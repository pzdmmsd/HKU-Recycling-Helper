# Vercel deployment and API secret storage

This project uses Python FastAPI to serve both the web interface and `/api/*` endpoints. Deploy the complete application to Vercel. The browser calls the same website's `/api/check` endpoint; the Python backend calls Alibaba Cloud Bailian using a server-side key.

## Current deployment

- Production URL: <https://hku-recycling-helper.vercel.app> (alias: <https://hku-recycling-helper-zyk4.vercel.app>)
- Project settings: <https://vercel.com/zyk4/hku-recycling-helper/settings>
- Connected repository: `pzdmmsd/HKU-Recycling-Helper` (`main` branch)
- Local `.env` files and credentials are excluded from Git and Vercel uploads via `.gitignore` and `.vercelignore`; the production key is stored in Vercel Environment Variables.

## Import and deploy from GitHub

For a new deployment:

1. Sign in at <https://vercel.com/new> and import `pzdmmsd/HKU-Recycling-Helper`. If the private repository is missing, grant the Vercel GitHub App access to it.
2. Select `main` as the Production Branch, keep Root Directory at the repository root, and choose **FastAPI** as the Framework Preset.
3. Leave custom Build Command, Install Command, and Output Directory overrides empty. The application entrypoint is `app/main.py`, dependencies come from `requirements.txt`, and `.python-version` selects Python 3.14.
4. Add the variables below under **Settings > Environment Variables**, then deploy. Sample mode also works without a key.
5. Wait for **Ready** and open the assigned production URL. Once Git integration is connected, pushes to the production branch trigger production deployments.

`vercel.json` sets a 180-second function duration to accommodate sequential normalization and classification calls. Keep `static/`, `data/`, and the root `SKILL.md` in the function bundle: the application reads them at runtime.

## Store the API key

| Variable | Value | Purpose |
| --- | --- | --- |
| `BAILIAN_API_KEY` | Your Bailian API key | The required secret. Select the Secret type, or the Sensitive option in dashboards that use that label, and target Production. |
| `AI_BASE_URL` | `https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1` | Default endpoint. The backend only permits this course endpoint. |
| `AI_MODEL` | `qwen3.8-flash` | Default model. |
| `AI_TIMEOUT_SECONDS` | `45` | Default timeout for each upstream call. |
| `AI_MAX_TOKENS` | `800` | Default output token limit. |
| `AI_TEMPERATURE` | `0.1` | Default temperature. |
| `ALLOWED_HOSTS` | For example, `recycle.example.edu` | Additional exact hostnames. Use commas between names; omit schemes, ports, and paths. |

Keep the production secret scoped to Production. Configure a separate suitable Preview key only if preview deployments need Live AI.

**Saving a variable does not update an existing deployment.** After adding or changing `BAILIAN_API_KEY`, open the project's **Deployments** tab, select the current production deployment, choose **Redeploy**, and wait for **Ready**. Reload the production website afterward. A variable saved after the current deployment was created will only be available to a new deployment.

For local development, store the key in the repository-root `.env` file. Both `.gitignore` and `.vercelignore` exclude this file, and Vercel deployments do not load it. Keep credentials out of GitHub, frontend JavaScript and HTML, `vercel.json`, and public variables such as `NEXT_PUBLIC_*` or `VITE_*`. Never paste credentials into chat or application logs.

Keep **Automatically expose System Environment Variables** enabled in Vercel. The application accepts its exact `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_BRANCH_URL` hostnames. Add custom domains and additional aliases to `ALLOWED_HOSTS`. The current production configuration explicitly includes both assigned production aliases.

## Verify the deployment

1. Open `/` and test English/Traditional Chinese switching.
2. Open `/api/config`. Confirm that the rule count is greater than zero and that no key is exposed. With a key configured in the active deployment, `live_available` should be `true`. This indicates configuration readiness; it does not validate the upstream credential.
3. In Sample mode, submit a supplied example and confirm that a preset result appears without an external AI call.
4. In Live AI mode, submit `One empty clean plastic bottle.` and confirm that the response has `mode: live` and cited evidence.

To run browser checks against production without making real AI calls:

```powershell
$env:HKU_TEST_URL='https://hku-recycling-helper.vercel.app'
node scripts/browser_check.mjs
```

The browser check covers both deployments with a key and Sample-only deployments. When Live AI is available, its error-handling check uses a mock response.

## Troubleshooting

| Symptom | Check and resolution |
| --- | --- |
| `The server-side course API key is not configured` after saving the key | Confirm the exact variable name `BAILIAN_API_KEY`, the correct project, and the Production target. Redeploy after saving, wait for Ready, and reload the production URL. |
| Live mode remains unavailable on an older deployment URL | Open the stable production URL or the latest production deployment. Old deployments retain their original variables. |
| `host_not_allowed` | Enable system environment variables or add the exact visited hostname to `ALLOWED_HOSTS`, then redeploy. |
| Provider authentication failure | Check that the configured key is valid for the course endpoint. Replace it directly in Vercel, then redeploy. |
| Provider timeout | Check Vercel Runtime Logs and upstream connectivity. A timeout must not produce a guessed recycling decision. |

The provider lock limits concurrency within one function instance. It is not a global rate limiter across multiple instances. For public Live AI usage, configure suitable provider quotas and any necessary platform access or rate limits. Same-origin checks do not authenticate visitors.

## Cloudflare alternative

Cloudflare Workers supports Python FastAPI but requires a Python Worker entrypoint and runtime adaptation. Uploading only `static/` to Cloudflare Pages cannot run this Python backend. The configuration in this repository targets Vercel.

## Official references

- [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
- [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python)
- [Manage Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
- [Cloudflare Python FastAPI](https://developers.cloudflare.com/workers/languages/python/packages/fastapi/)
