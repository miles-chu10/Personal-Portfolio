import json
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta

import pytest
from chatkit.server import ChatKitServer
from chatkit.types import ThreadMetadata, UserMessageItem
from agents import Agent
from agents.models.interface import Model
from openai.types.responses import ResponseOutputItemAddedEvent, ResponseOutputMessage
from fastapi.testclient import TestClient
from sqlalchemy import func, select, update

from backend.main import PortfolioServer, create_app, portfolio_snapshot
from backend.store import ItemRow, LimitReached, SQLStore, ThreadRow, VisitorContext, utcnow


VISITOR_A = str(uuid.uuid4())
VISITOR_B = str(uuid.uuid4())
TOKEN = "test-backend-token-with-at-least-32-chars"


class FakeServer(ChatKitServer[VisitorContext]):
  async def respond(self, thread: ThreadMetadata, input_user_message: UserMessageItem | None, context: VisitorContext):
    if False:
      yield None


def request_data(operation, params):
  return {"type": operation, "params": params}


def message(text="What projects has Miles built?"):
  return {"content": [{"type": "input_text", "text": text}], "attachments": [], "inference_options": {}}


def send(client, operation, params, visitor=VISITOR_A, token=TOKEN):
  return client.post("/chatkit", json=request_data(operation, params), headers={"authorization": f"Bearer {token}", "x-portfolio-visitor": visitor})


def events(response):
  assert response.status_code == 200, response.text
  return [json.loads(line[6:]) for line in response.text.splitlines() if line.startswith("data: ")]


@pytest.fixture
def service(tmp_path):
  url = f"sqlite:///{tmp_path / 'chat.sqlite3'}"
  store = SQLStore(url)
  client = TestClient(create_app(database_url=url, backend_token=TOKEN, api_key="fake", server=FakeServer(store)))
  return client, store, url


def create_thread(client, visitor=VISITOR_A):
  created = events(send(client, "threads.create", {"input": message()}, visitor))
  return created[0]["thread"]["id"]


def test_create_add_get_list_items_delete(service):
  client, _, _ = service
  thread_id = create_thread(client)
  assert events(send(client, "threads.add_user_message", {"thread_id": thread_id, "input": message("What work has Miles done?")}))
  got = send(client, "threads.get_by_id", {"thread_id": thread_id})
  assert got.status_code == 200
  listed = send(client, "threads.list", {})
  assert [row["id"] for row in listed.json()["data"]] == [thread_id]
  items = send(client, "items.list", {"thread_id": thread_id})
  assert len(items.json()["data"]) == 2
  deleted = send(client, "threads.delete", {"thread_id": thread_id})
  assert deleted.status_code == 200
  assert send(client, "threads.get_by_id", {"thread_id": thread_id}).status_code == 404


def test_tenant_isolation_every_read_and_write(service):
  client, store, _ = service
  thread_id = create_thread(client)
  item_id = send(client, "items.list", {"thread_id": thread_id}).json()["data"][0]["id"]
  assert send(client, "threads.get_by_id", {"thread_id": thread_id}, VISITOR_B).status_code == 404
  assert send(client, "items.list", {"thread_id": thread_id}, VISITOR_B).status_code == 404
  assert send(client, "threads.delete", {"thread_id": thread_id}, VISITOR_B).status_code == 404
  assert send(client, "threads.list", {}, VISITOR_B).json()["data"] == []
  assert events(send(client, "threads.add_user_message", {"thread_id": thread_id, "input": message()}, VISITOR_B))[-1]["type"] == "error"
  import asyncio
  with pytest.raises(Exception):
    asyncio.run(store.load_item(thread_id, item_id, VisitorContext(VISITOR_B)))


def test_rejects_malformed_and_disabled_operations(service):
  client, _, _ = service
  for payload in [None, {}, {"type": "threads.create", "params": {}}, request_data("threads.create", {"input": message("x" * 501)}), request_data("threads.create", {"input": {**message(), "attachments": ["file"]}}), request_data("items.feedback", {})]:
    assert client.post("/chatkit", json=payload, headers={"authorization": f"Bearer {TOKEN}", "x-portfolio-visitor": VISITOR_A}).status_code == 400
  assert send(client, "threads.list", {}, token="wrong").status_code == 401
  assert client.post("/chatkit", json=request_data("threads.list", {}), headers={"authorization": f"Bearer {TOKEN}"}).status_code == 401
  assert client.post("/chatkit", json=request_data("threads.list", {}), headers={"authorization": f"Bearer {TOKEN}", "x-portfolio-visitor": "not-a-uuid"}).status_code == 401


def test_configuration_fail_closed(monkeypatch, tmp_path):
  monkeypatch.setenv("VERCEL", "1")
  for url, token, key in [(None, TOKEN, "fake"), (f"sqlite:///{tmp_path / 'db'}", TOKEN, "fake"), ("postgresql://example", None, "fake"), ("postgresql://example", TOKEN, None)]:
    client = TestClient(create_app(database_url=url, backend_token=token, api_key=key))
    assert send(client, "threads.list", {}).status_code == 503


def test_short_token_and_disable_switch_fail_closed(monkeypatch, tmp_path):
  url = f"sqlite:///{tmp_path / 'db'}"
  store = SQLStore(url)
  short = TestClient(create_app(database_url=url, backend_token="short", api_key="fake", server=FakeServer(store)))
  assert send(short, "threads.list", {}).status_code == 503
  monkeypatch.setenv("CHAT_ENABLED", "false")
  disabled = TestClient(create_app(database_url=url, backend_token=TOKEN, api_key="fake", server=FakeServer(store)))
  assert send(disabled, "threads.list", {}).status_code == 503


def test_public_snapshot_keeps_complete_nested_projects():
  document = {"timeline": {"latest": [{"title": "Work"}], "earlier": [{"title": "Projects"}]}}
  assert json.loads(portfolio_snapshot(document, "timeline"))["earlier"][0]["title"] == "Projects"


def test_agent_run_cancelled_when_chat_stream_closes(service, monkeypatch):
  _, store, _ = service
  context = VisitorContext(VISITOR_A)
  thread = ThreadMetadata(id=store.generate_thread_id(context), created_at=utcnow())
  asyncio.run(store.save_thread(thread, context))
  server = PortfolioServer(store, {"profile": {"name": "Miles"}})

  class FakeRun:
    is_complete = False
    cancelled = False

    def cancel(self):
      self.cancelled = True

  run = FakeRun()
  monkeypatch.setattr("backend.main.Runner.run_streamed", lambda *args, **kwargs: run)

  async def fake_events(agent_context, result):
    yield "first-event"
    await asyncio.Event().wait()

  monkeypatch.setattr("backend.main.stream_agent_response", fake_events)

  async def exercise():
    stream = server.respond(thread, None, context)
    assert await stream.__anext__() == "first-event"
    await stream.aclose()

  asyncio.run(exercise())
  assert run.cancelled


def test_quota_and_persistence_restart(service):
  client, _, url = service
  thread_id = create_thread(client)
  for _ in range(7):
    events(send(client, "threads.add_user_message", {"thread_id": thread_id, "input": message()}))
  assert send(client, "threads.add_user_message", {"thread_id": thread_id, "input": message()}).status_code == 429
  reopened = SQLStore(url)
  second_client = TestClient(create_app(database_url=url, backend_token=TOKEN, api_key="fake", server=FakeServer(reopened)))
  assert send(second_client, "threads.get_by_id", {"thread_id": thread_id}).status_code == 200
  assert len(send(second_client, "items.list", {"thread_id": thread_id}).json()["data"]) == 8
  assert send(second_client, "threads.add_user_message", {"thread_id": thread_id, "input": message()}).status_code == 429


def test_expiration(service):
  client, store, _ = service
  thread_id = create_thread(client)
  with store.engine.begin() as db:
    db.execute(update(ThreadRow).where(ThreadRow.id == thread_id).values(expires_at=utcnow() - timedelta(seconds=1)))
  assert send(client, "threads.get_by_id", {"thread_id": thread_id}).status_code == 404
  assert send(client, "threads.list", {}).json()["data"] == []
  with store.engine.connect() as db:
    assert db.scalar(select(func.count()).select_from(ThreadRow)) == 0
    assert db.scalar(select(func.count()).select_from(ItemRow)) == 0


def test_concurrent_quota_is_atomic(service):
  _, store, _ = service
  visitor = VisitorContext(str(uuid.uuid4()))

  def reserve(_):
    try:
      store.reserve_generation(visitor, per_visitor=8, global_limit=1000)
      return True
    except LimitReached:
      return False

  with ThreadPoolExecutor(max_workers=12) as pool:
    results = list(pool.map(reserve, range(20)))
  assert sum(results) == 8


def test_global_quota_across_visitors(monkeypatch, tmp_path):
  monkeypatch.setenv("CHATKIT_GLOBAL_PER_MINUTE", "1")
  url = f"sqlite:///{tmp_path / 'global.sqlite3'}"
  store = SQLStore(url)
  client = TestClient(create_app(database_url=url, backend_token=TOKEN, api_key="fake", server=FakeServer(store)))
  assert events(send(client, "threads.create", {"input": message()}, VISITOR_A))
  assert send(client, "threads.create", {"input": message()}, VISITOR_B).status_code == 429


def test_stream_failure_hides_credit_details(tmp_path):
  class CreditFailure(ChatKitServer[VisitorContext]):
    async def respond(self, thread, input_user_message, context):
      raise RuntimeError("credit_balance_exhausted secret-detail")
      yield

  url = f"sqlite:///{tmp_path / 'credit.sqlite3'}"
  store = SQLStore(url)
  client = TestClient(create_app(database_url=url, backend_token=TOKEN, api_key="fake", server=CreditFailure(store)))
  response = send(client, "threads.create", {"input": message()})
  assert response.status_code == 200
  assert events(response)[-1]["type"] == "error"
  assert events(response)[-1]["allow_retry"] is False
  assert "credit_balance_exhausted" not in response.text
  assert "secret-detail" not in response.text


@pytest.mark.parametrize("cancel_while_waiting", [False, True])
def test_real_sdk_adapter_cleans_pending_tasks_on_cancel(service, cancel_while_waiting):
  _, store, _ = service
  context = VisitorContext(VISITOR_A)
  thread = ThreadMetadata(id=store.generate_thread_id(context), created_at=utcnow())
  asyncio.run(store.save_thread(thread, context))

  class WaitingModel(Model):
    cancelled = False

    async def get_response(self, *args, **kwargs):
      raise AssertionError("The synthetic model must only stream")

    async def stream_response(self, *args, **kwargs):
      try:
        yield ResponseOutputItemAddedEvent(
          item=ResponseOutputMessage(id="msg_synthetic", content=[], role="assistant", status="in_progress", type="message"),
          output_index=0,
          sequence_number=0,
          type="response.output_item.added",
        )
        await asyncio.Event().wait()
      finally:
        self.cancelled = True

  model = WaitingModel()
  server = PortfolioServer(store, {"profile": {"name": "Miles"}})
  server.agent = Agent(name="Synthetic", model=model, instructions="Synthetic test")

  async def exercise():
    stream = server.respond(thread, None, context)
    await asyncio.wait_for(stream.__anext__(), timeout=2)
    if cancel_while_waiting:
      pending = asyncio.create_task(stream.__anext__())
      for _ in range(20):
        await asyncio.sleep(0)
      pending.cancel()
      with pytest.raises(asyncio.CancelledError):
        await pending
    await stream.aclose()
    for _ in range(20):
      await asyncio.sleep(0)
    leaked = [task for task in asyncio.all_tasks() if task is not asyncio.current_task() and not task.done()]
    assert not leaked, [repr(task.get_coro()) for task in leaked]

  asyncio.run(exercise())
  assert model.cancelled
