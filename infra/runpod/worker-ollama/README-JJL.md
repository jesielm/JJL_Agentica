# JJL Runpod Ollama worker

Worker based on [runpod-workers/worker-ollama](https://github.com/runpod-workers/worker-ollama), commit `1848765ec`.

## Correction
In `handler.py`, forward `think` from Runpod `input` into Ollama's `/api/chat` or `/api/generate` JSON payload, preserving other options.

## Publish
Run the GitHub Actions workflow **Publish JJL Ollama worker to GHCR** manually.

Image: `ghcr.io/jesielm/jjl-worker-ollama:think-fix-1848765`

Build context: `infra/runpod/worker-ollama`.

GitHub Actions requires `packages: write` and permission to create packages. The image package may default to private; configure Runpod access before using it.

## Safety
Do not include API keys, credentials, or JJL documents in source control. Do not modify the production endpoint `67unr2b8pq0rdf` until a separate test endpoint verifies a nonempty `message.content` with `think: false`.
