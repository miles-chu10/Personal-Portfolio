export const OFFLINE_MESSAGE =
  "The portfolio agent is offline right now. You can reach Miles by email using the link at the top of the page.";

export const RATE_LIMITED_MESSAGE =
  "The agent is handling a lot of questions right now. Try again in a minute.";

export async function readErrorMessage(response: Response) {
  if (response.status === 503) {
    return OFFLINE_MESSAGE;
  }

  if (response.status === 429) {
    return RATE_LIMITED_MESSAGE;
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string };

  return data.error ?? "Portfolio agent failed.";
}
