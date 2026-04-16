# AI Connector for Local AI

AI Connector for Local AI is a WordPress AI provider plugin plus a small local proxy for running inference against models on your own machine.

It is built for WordPress 7.0+ and the new Connectors primitives. The WordPress plugin runs on the remote site. The local proxy runs on a machine you control, talks to an OpenAI-compatible local backend such as Ollama or LM Studio, and exposes that backend to WordPress through an authenticated Tailscale Funnel.

## What It Does

- Registers a `local-ai` AI provider with the WordPress AI Client.
- Adds a Settings screen for entering the proxy URL, API key, and selected model.
- Loads model choices from the real proxied `/v1/models` endpoint.
- Restricts the provider to the selected model so WordPress auto-discovery consistently uses it.
- Ships a local `node` proxy that can:
  - detect local backends,
  - persist configuration in `local/.env`,
  - expose the proxy through Tailscale Funnel,
  - protect requests with a bearer token.

## Repository Layout

- [`plugin.php`](plugin.php): WordPress plugin bootstrap, settings UI, connector registration.
- [`src/`](src): provider, model, and metadata directory classes.
- [`local/server.mjs`](local/server.mjs): local proxy and Tailscale Funnel entrypoint.

## Requirements

- WordPress `7.0+`
- PHP `7.4+`
- Node.js `18+` with native `fetch`
- One local OpenAI-compatible backend, currently tested against:
  - Ollama
  - LM Studio
- Tailscale, if you want public exposure through Funnel

## WordPress Plugin Setup

1. Copy this plugin into `wp-content/plugins/ai-connector-for-local-ai`.
2. Activate the plugin in WordPress.
3. Open `Settings > Connectors` or the dedicated Local AI settings page.
4. Enter:
   - the proxy endpoint URL,
   - the shared API key,
   - the model to expose to WordPress.

The Connectors screen links back to this setup page.

## Local Proxy Setup

Preferred install path:

```bash
npm install -g @mattwiebe/ai-connector-for-local-ai
```

Then initialize and run the proxy with:

```bash
wphi init
wphi up
```

macOS background service management:

```bash
wphi install
wphi start
wphi stop
wphi status
wphi rotate-key
wphi uninstall
```

You can also run it without a global install:

```bash
npx @mattwiebe/ai-connector-for-local-ai init
npx @mattwiebe/ai-connector-for-local-ai up
```

For local development from this repo, you can still use:

```bash
npm run init
npm run up
npm run service:install
npm run start
npm run stop
npm run status
npm run rotate-key
npm run service:uninstall
```

That guided setup will:

- detect or prompt for the backend URL,
- generate or accept an API key,
- ask whether to enable Tailscale Funnel,
- ask which public Funnel port to use, defaulting to `8443`,
- save everything into `local/.env`.

After that, normal startup is non-interactive:

```bash
wphi up
```

To reconfigure later:

```bash
wphi init
```

On macOS, `wphi install` or `npm run service:install` writes a LaunchAgent at `~/Library/LaunchAgents/com.mattwiebe.ai-connector-for-local-ai.plist` so the proxy can keep running in the background across logins.

To rotate the shared API key in the persisted `.env` file and print the new key:

```bash
wph rotate-key
```

This also works as:

```bash
wphi rotate-key
npm run rotate-key
```

On macOS, if the LaunchAgent is currently running, `rotate-key` will restart it automatically so the background process picks up the new key immediately.

Useful overrides:

```bash
wphi up --port 13531
wphi up --funnel-port 10000
wphi up --backend http://localhost:11434
wphi up --api-key your-secret
wphi up --no-tunnel
```

## Development

Developer docs, release notes, packaging details, and reference material now live in [docs/developing.md](docs/developing.md).
