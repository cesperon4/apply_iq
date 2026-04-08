import "server-only";
import { Agent, fetch as undiciFetch } from "undici";
import { Ollama } from "ollama";

const TEN_MIN_MS = 600_000;

/**
 * Default Node `fetch` uses undici with a headers timeout that can fire while Ollama is
 * still loading the model or generating (especially with thinking models). Bump timeouts.
 */
const longRunningAgent = new Agent({
  connectTimeout: TEN_MIN_MS,
  headersTimeout: TEN_MIN_MS,
  bodyTimeout: TEN_MIN_MS,
});

function ollamaFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return undiciFetch(
    input as never,
    {
      ...init,
      dispatcher: longRunningAgent,
    } as never,
  ) as unknown as Promise<Response>;
}

export const ollama = new Ollama({ fetch: ollamaFetch });
