"""Tenant-scoped durable ChatKit storage and atomic request quotas."""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from chatkit.store import Store
from chatkit.types import Page, ThreadItem, ThreadMetadata
from pydantic import TypeAdapter
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, create_engine, delete, func, select, text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


TTL = timedelta(hours=24)
MAX_THREADS = 10
MAX_ITEMS = 80
ITEM_ADAPTER = TypeAdapter(ThreadItem)


class MissingItem(Exception):
  pass


class LimitReached(Exception):
  pass


@dataclass(frozen=True)
class VisitorContext:
  visitor_id: str


class Base(DeclarativeBase):
  pass


class ThreadRow(Base):
  __tablename__ = "chatkit_threads"
  id: Mapped[str] = mapped_column(String(64), primary_key=True)
  owner: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
  expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
  value: Mapped[str] = mapped_column(Text, nullable=False)


class ItemRow(Base):
  __tablename__ = "chatkit_items"
  id: Mapped[str] = mapped_column(String(64), primary_key=True)
  thread_id: Mapped[str] = mapped_column(String(64), ForeignKey("chatkit_threads.id", ondelete="CASCADE"), index=True)
  owner: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
  value: Mapped[str] = mapped_column(Text, nullable=False)


class QuotaRow(Base):
  __tablename__ = "chatkit_quotas"
  key: Mapped[str] = mapped_column(String(128), primary_key=True)
  count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
  expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


def utcnow() -> datetime:
  return datetime.now(timezone.utc)


def aware(value: datetime) -> datetime:
  return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


class SQLStore(Store[VisitorContext]):
  def __init__(self, database_url: str):
    self.engine = create_engine(
      database_url,
      connect_args={"check_same_thread": False} if database_url.startswith("sqlite:") else {},
      pool_pre_ping=True,
    )
    if database_url.startswith("sqlite:"):
      from sqlalchemy import event

      @event.listens_for(self.engine, "connect")
      def enable_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")
    Base.metadata.create_all(self.engine)

  def _thread(self, db: Session, thread_id: str, context: VisitorContext) -> ThreadRow:
    row = db.get(ThreadRow, thread_id)
    if row is None or row.owner != context.visitor_id or aware(row.expires_at) <= utcnow():
      raise MissingItem()
    return row

  def reserve_generation(self, context: VisitorContext, per_visitor: int = 8, global_limit: int = 120) -> None:
    # INSERT then conditional UPDATE are atomic on SQLite and PostgreSQL. The
    # transaction rolls both counters back when either cap is reached.
    minute = int(utcnow().timestamp() // 60)
    with Session(self.engine) as db, db.begin():
      for key, limit in ((f"v:{context.visitor_id}:{minute}", per_visitor), (f"g:{minute}", global_limit)):
        db.execute(text("INSERT INTO chatkit_quotas (key, count, expires_at) VALUES (:key, 0, :expires_at) ON CONFLICT (key) DO NOTHING"), {"key": key, "expires_at": utcnow() + timedelta(minutes=2)})
        result = db.execute(text("UPDATE chatkit_quotas SET count = count + 1 WHERE key = :key AND count < :limit"), {"key": key, "limit": limit})
        if result.rowcount != 1:
          raise LimitReached()

  def cleanup_expired(self) -> None:
    now = utcnow()
    with Session(self.engine) as db, db.begin():
      expired = select(ThreadRow.id).where(ThreadRow.expires_at <= now)
      db.execute(delete(ItemRow).where(ItemRow.thread_id.in_(expired)))
      db.execute(delete(ThreadRow).where(ThreadRow.expires_at <= now))
      db.execute(delete(QuotaRow).where(QuotaRow.expires_at <= now))

  def generate_thread_id(self, context: VisitorContext) -> str:
    return f"thr_{uuid.uuid4().hex}"

  def generate_item_id(self, item_type, thread: ThreadMetadata, context: VisitorContext) -> str:
    return f"{item_type}_{uuid.uuid4().hex}"

  async def save_thread(self, thread: ThreadMetadata, context: VisitorContext) -> None:
    with Session(self.engine) as db, db.begin():
      current = db.get(ThreadRow, thread.id)
      if current is not None:
        self._thread(db, thread.id, context)
        current.value = thread.model_dump_json()
      else:
        # Serialise per-owner creates before counting, including across workers.
        owner_key = f"owner:{context.visitor_id}"
        db.execute(text("INSERT INTO chatkit_quotas (key, count, expires_at) VALUES (:key, 0, :expires_at) ON CONFLICT (key) DO NOTHING"), {"key": owner_key, "expires_at": utcnow() + TTL})
        db.execute(text("UPDATE chatkit_quotas SET count = count WHERE key = :key"), {"key": owner_key})
        count = db.scalar(select(func.count()).select_from(ThreadRow).where(ThreadRow.owner == context.visitor_id, ThreadRow.expires_at > utcnow()))
        if count >= MAX_THREADS:
          raise LimitReached()
        now = utcnow()
        db.add(ThreadRow(id=thread.id, owner=context.visitor_id, created_at=now, expires_at=now + TTL, value=thread.model_dump_json()))

  async def load_thread(self, thread_id: str, context: VisitorContext) -> ThreadMetadata:
    with Session(self.engine) as db:
      return ThreadMetadata.model_validate_json(self._thread(db, thread_id, context).value)

  async def load_threads(self, limit: int, after: str | None, order: str, context: VisitorContext) -> Page[ThreadMetadata]:
    limit = min(max(limit, 1), 20)
    with Session(self.engine) as db:
      query = select(ThreadRow).where(ThreadRow.owner == context.visitor_id, ThreadRow.expires_at > utcnow())
      if after:
        cursor = self._thread(db, after, context)
        condition = ThreadRow.created_at < cursor.created_at if order == "desc" else ThreadRow.created_at > cursor.created_at
        query = query.where(condition)
      query = query.order_by(ThreadRow.created_at.desc() if order == "desc" else ThreadRow.created_at.asc(), ThreadRow.id).limit(limit + 1)
      rows = db.scalars(query).all()
      return Page(data=[ThreadMetadata.model_validate_json(row.value) for row in rows[:limit]], has_more=len(rows) > limit, after=rows[limit - 1].id if len(rows) > limit else None)

  async def delete_thread(self, thread_id: str, context: VisitorContext) -> None:
    with Session(self.engine) as db, db.begin():
      self._thread(db, thread_id, context)
      db.execute(delete(ItemRow).where(ItemRow.thread_id == thread_id, ItemRow.owner == context.visitor_id))
      db.execute(delete(ThreadRow).where(ThreadRow.id == thread_id, ThreadRow.owner == context.visitor_id))

  async def add_thread_item(self, thread_id: str, item: ThreadItem, context: VisitorContext) -> None:
    await self.save_item(thread_id, item, context)

  async def save_item(self, thread_id: str, item: ThreadItem, context: VisitorContext) -> None:
    with Session(self.engine) as db, db.begin():
      self._thread(db, thread_id, context)
      if item.thread_id != thread_id:
        raise MissingItem()
      current = db.get(ItemRow, item.id)
      if current:
        if current.owner != context.visitor_id or current.thread_id != thread_id:
          raise MissingItem()
        current.value = ITEM_ADAPTER.dump_json(item).decode()
      else:
        count = db.scalar(select(func.count()).select_from(ItemRow).where(ItemRow.thread_id == thread_id, ItemRow.owner == context.visitor_id))
        if count >= MAX_ITEMS:
          raise LimitReached()
        db.add(ItemRow(id=item.id, thread_id=thread_id, owner=context.visitor_id, created_at=utcnow(), value=ITEM_ADAPTER.dump_json(item).decode()))

  async def load_item(self, thread_id: str, item_id: str, context: VisitorContext) -> ThreadItem:
    with Session(self.engine) as db:
      self._thread(db, thread_id, context)
      row = db.get(ItemRow, item_id)
      if row is None or row.thread_id != thread_id or row.owner != context.visitor_id:
        raise MissingItem()
      return ITEM_ADAPTER.validate_json(row.value)

  async def load_thread_items(self, thread_id: str, after: str | None, limit: int, order: str, context: VisitorContext) -> Page[ThreadItem]:
    limit = min(max(limit, 1), 40)
    with Session(self.engine) as db:
      self._thread(db, thread_id, context)
      query = select(ItemRow).where(ItemRow.thread_id == thread_id, ItemRow.owner == context.visitor_id)
      if after:
        cursor = db.get(ItemRow, after)
        if cursor is None or cursor.thread_id != thread_id or cursor.owner != context.visitor_id:
          raise MissingItem()
        condition = ItemRow.created_at < cursor.created_at if order == "desc" else ItemRow.created_at > cursor.created_at
        query = query.where(condition)
      query = query.order_by(ItemRow.created_at.desc() if order == "desc" else ItemRow.created_at.asc(), ItemRow.id).limit(limit + 1)
      rows = db.scalars(query).all()
      return Page(data=[ITEM_ADAPTER.validate_json(row.value) for row in rows[:limit]], has_more=len(rows) > limit, after=rows[limit - 1].id if len(rows) > limit else None)

  async def delete_thread_item(self, thread_id: str, item_id: str, context: VisitorContext) -> None:
    with Session(self.engine) as db, db.begin():
      self._thread(db, thread_id, context)
      result = db.execute(delete(ItemRow).where(ItemRow.id == item_id, ItemRow.thread_id == thread_id, ItemRow.owner == context.visitor_id))
      if result.rowcount != 1:
        raise MissingItem()

  async def save_attachment(self, attachment, context: VisitorContext) -> None:
    raise ValueError("Attachments are disabled")

  async def load_attachment(self, attachment_id: str, context: VisitorContext):
    raise MissingItem()

  async def delete_attachment(self, attachment_id: str, context: VisitorContext) -> None:
    raise MissingItem()
