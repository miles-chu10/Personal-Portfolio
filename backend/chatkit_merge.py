"""Cancellation fix for the pinned ChatKit 1.6.5 stream merger.

The SDK helper starts two __anext__ tasks but does not cancel them when its
consumer closes the merged generator. Keep this replacement scoped to that
single helper until the pinned SDK includes the upstream fix.
"""

from __future__ import annotations

import asyncio
from contextlib import suppress
from importlib.metadata import version
from typing import AsyncIterator, TypeVar

import chatkit.agents


T1 = TypeVar("T1")
T2 = TypeVar("T2")


async def cancellation_safe_merge(a: AsyncIterator[T1], b: AsyncIterator[T2]) -> AsyncIterator[T1 | T2]:
  pending = {asyncio.create_task(iterator.__anext__()): iterator for iterator in (a, b)}
  try:
    while pending:
      done, _ = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
      stopped = False
      for task in done:
        iterator = pending.pop(task)
        try:
          event = task.result()
        except StopAsyncIteration:
          stopped = True
        else:
          yield event
          if not stopped:
            pending[asyncio.create_task(iterator.__anext__())] = iterator
      if stopped:
        break
  finally:
    for task in pending:
      task.cancel()
    if pending:
      await asyncio.gather(*pending, return_exceptions=True)
    for iterator in (a, b):
      closer = getattr(iterator, "aclose", None)
      if closer is not None:
        with suppress(Exception):
          await closer()


def install() -> None:
  if version("openai-chatkit") != "1.6.5":
    raise RuntimeError("Review ChatKit stream cancellation before changing the pinned SDK")
  chatkit.agents._merge_generators = cancellation_safe_merge
