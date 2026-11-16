# Vercel deployment and API secret storage

This project uses Python FastAPI to serve both the web interface and `/api/*` endpoints. Deploy the complete application to Vercel. The browser calls the same website's `/api/check` endpoint; the Python backend calls Alibaba Cloud Bailian using a server-side key.

## Current deployment

- Production: <https://hku-recycling-helper.vercel.app>.
- Alternative production URL: <https://hku-recycling-helper-zyk4.vercel.app>.
- Project settings: <https://vercel.com/zyk4/hku-recycling-helper/settings>.
- Deployment changes: [PR #1](https://github.com/pzdmmsd/HKU-Recycling-Helper/pull/1), branch `codex/vercel-deployment`. The deployed application source is commit `78af297e0e00f64c5c1126264b416d016c2ee36e`; subsequent documentation changes do not change the application code.
- Production is publicly accessible with the owner's approval. Preview deployments retain Vercel Authentication.
- Local `.env` files and credentials were excluded from the uploaded source. The production key is configured separately in Vercel's secret store.
- Initial validation: 101 automated tests and six offline safety checks passed. A fresh browser session verified public access, language switching, all four sample outcomes, source dialogs, and desktop/mobile layouts.
- Live verification on 2026-11-16: after the Production secret was saved, a new deployment made `live_available` true. Submitting `One empty clean plastic bottle.` through the production browser form returned HTTP 200, `mode: live`, `status: accepted`, and two evidence entries. The browser rendered the result successfully.

The initial deployment uploaded a committed source snapshot from the GitHub working copy. **Automatic deployment on Git pushes is not connected yet** because the Vercel account did not have a GitHub Login Connection when import was attempted. To connect automatic deployments:

1. Connect the GitHub account that owns the repository in [Vercel Account Authentication](https://vercel.com/account/settings/authentication). Grant the Vercel GitHub App access to this private repository.
2. Review and merge PR #1 so `main` contains the deployment changes.
3. In the existing Vercel project, open **Settings > Git > Connect Git Repository** and connect `pzdmmsd/HKU-Recycling-Helper`, using `main` as the production branch. Reuse the existing project.

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
