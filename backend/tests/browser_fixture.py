"""Deterministic ChatKit server for local browser checks; never calls OpenAI.

Run only from backend/ with:
  CHATKIT_BACKEND_TOKEN=... .venv/bin/python -m uvicorn tests.browser_fixture:app --port 8001
"""

import json
import os
import tempfile
from pathlib import Path

from chatkit.server import ChatKitServer
from chatkit.types import AssistantMessageContent, AssistantMessageItem, ThreadItemDoneEvent

from main import create_app, portfolio_snapshot
from store import SQLStore, VisitorContext, utcnow


if os.getenv("VERCEL") == "1":
  raise RuntimeError("The browser fixture cannot run in Vercel")

token = os.getenv("CHATKIT_BACKEND_TOKEN")
if not token:
  raise RuntimeError("Set CHATKIT_BACKEND_TOKEN for the browser fixture")

database_url = os.getenv("CHATKIT_FIXTURE_DATABASE_URL") or f"sqlite:///{tempfile.gettempdir()}/portfolio-chatkit-browser-fixture.sqlite3"
document = json.loads(Path(__file__).resolve().parents[1].joinpath("portfolio.json").read_text(encoding="utf-8"))
store = SQLStore(database_url)


class FixtureServer(ChatKitServer[VisitorContext]):
  async def respond(self, thread, input_user_message, context):
    question = ""
    if input_user_message is not None:
      question = " ".join(part.text for part in input_user_message.content if hasattr(part, "text"))
    section = "skills" if "skill" in question.lower() else "profile" if "background" in question.lower() else "timeline"
    fact = portfolio_snapshot(document, section)
    answer = f"Public portfolio detail: {fact[:350]}"
    item = AssistantMessageItem(
      id=self.store.generate_item_id("message", thread, context),
      thread_id=thread.id,
      created_at=utcnow(),
      content=[AssistantMessageContent(text=answer)],
    )
    yield ThreadItemDoneEvent(item=item)


app = create_app(database_url=database_url, backend_token=token, api_key="fixture-no-model", server=FixtureServer(store))
