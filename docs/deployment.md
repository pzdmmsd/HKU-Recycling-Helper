# Vercel 部署与 API 密钥存放

本项目使用 Python FastAPI，同时提供网页和 `/api/*` 接口。优先部署整个仓库到 Vercel，浏览器向同一网站的 `/api/check` 发请求，服务器再调用阿里云百炼。

## 本次部署（2026-11-16）

- 生产地址：<https://hku-recycling-helper.vercel.app>。
- 备用生产地址：<https://hku-recycling-helper-zyk4.vercel.app>。
- 项目设置：<https://vercel.com/zyk4/hku-recycling-helper/settings>。
- 代码修改：[PR #1](https://github.com/pzdmmsd/HKU-Recycling-Helper/pull/1)，分支 `codex/vercel-deployment`；应用源码提交为 `78af297e0e00f64c5c1126264b416d016c2ee36e`。
- 已获得公开生产网页的授权；生产网页公开，预览部署保留 Vercel 登录保护。
- 云端未上传本地 `.env` 或 API Key；默认提供 Sample mode，Live AI 需按下文添加密钥。
- 验证结果：101 项测试、6 项离线安全检查通过；生产部署状态 Ready，使用全新浏览器会话验证了公开访问、中英文切换、四类示例、来源弹窗和桌面/手机布局。未调用真实 AI。

本次使用 GitHub 工作副本中已提交的源码快照上传部署。Vercel 账户尚未关联 GitHub Login Connection，因此 **Git 推送自动部署尚未接通**。要接通后续自动部署：

1. 在 [Vercel 账户 Authentication](https://vercel.com/account/settings/authentication) 中连接拥有该仓库的 GitHub 账户，并允许 Vercel GitHub App 访问该私有仓库。
2. 审查并合并 PR #1，使 `main` 包含部署修复。
3. 打开已有 Vercel 项目的 **Settings → Git → Connect Git Repository**，连接 `pzdmmsd/HKU-Recycling-Helper`，生产分支使用 `main`。使用已有项目即可，无需创建第二个项目。

## 连接 GitHub 并部署

1. 登录 <https://vercel.com/new>，使用 GitHub 导入 `pzdmmsd/HKU-Recycling-Helper`。这是私有仓库；若列表中没有，需要给 Vercel GitHub App 授予该仓库访问权限。
2. Production Branch 选择 `main`，Root Directory 保持仓库根目录，Framework Preset 选择 **FastAPI**。
3. 不填写自定义 Build Command、Install Command 或 Output Directory。入口为 `app/main.py`，依赖来自 `requirements.txt`，Python 版本由 `.python-version` 指定为 3.14。
4. 在项目的 **Settings → Environment Variables** 添加下表变量，然后部署。也可以先不加密钥上线 Sample mode。
5. 等待部署状态变为 **Ready**，打开 Vercel 返回的网站地址。连接 Git 后，后续推送到 `main` 会触发生产部署。

`vercel.json` 设置单次函数执行上限为 180 秒，覆盖多语言输入可能依次执行的翻译、检索和分类调用。`static/`、`data/` 和根目录 `SKILL.md` 都是运行所需文件，必须保留在函数包里。

## API Key 放在哪里

| 变量名 | 值 | 用途 |
| --- | --- | --- |
| `BAILIAN_API_KEY` | 你自己的百炼 API Key | 唯一需要填写的秘密；选择 Sensitive（如可用），作用环境选择 Production。 |
| `AI_BASE_URL` | `https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1` | 已有默认值；当前后端只允许该课程端点。 |
| `AI_MODEL` | `qwen3.8-flash` | 已有默认值。 |
| `AI_TIMEOUT_SECONDS` | `45` | 单次上游调用超时，已有默认值。 |
| `AI_MAX_TOKENS` | `800` | 已有默认值。 |
| `AI_TEMPERATURE` | `0.1` | 已有默认值。 |
| `ALLOWED_HOSTS` | 例如 `recycle.example.edu` | 仅绑定自定义域名或需要额外别名时设置，不含协议、端口或路径，多个域名用英文逗号分隔。 |

生产密钥只在 Production 配置即可。确实需要在预览部署中测试 Live AI 时，再为 Preview 单独配置适用的密钥。保存或修改变量后，执行 **Redeploy**，旧部署不会自动读取新值。

本地开发仍把密钥保存在项目根目录 `.env`；该文件已经被 `.gitignore` 和 `.vercelignore` 排除，部署环境也不会读取 `.env`。不要把密钥提交到 GitHub、放进前端 JavaScript 或 HTML、写入 `vercel.json`，也不要放进 `NEXT_PUBLIC_*`、`VITE_*` 等前端公开变量。无需把密钥发到聊天里。

Vercel 的 **Automatically expose System Environment Variables** 应保持开启。应用仅从平台提供的 `VERCEL_URL`、`VERCEL_PROJECT_PRODUCTION_URL` 和 `VERCEL_BRANCH_URL` 接受自己的域名，不会放行所有 `*.vercel.app`。自定义域名需另外加入 `ALLOWED_HOSTS`。

## 上线后检查

1. 打开 `/`，确认网页和 EN / 繁體中文切换可用。
2. 打开 `/api/config`，确认返回 JSON、规则数量大于 0，且不包含 API Key。配置密钥后 `live_available` 应为 `true`，但这仅说明配置就绪，不代表上游密钥已经通过验证。
3. 在 Sample mode 选择示例并提交，应收到预设答案；这个过程不会调用百炼。
4. 配置密钥后，在 Live AI 输入 `One empty clean plastic bottle.`，确认实际百炼调用成功。
5. 如果网站提示 `host_not_allowed`，检查系统环境变量是否开启，或把当前访问的准确域名加入 `ALLOWED_HOSTS` 后重新部署。
6. 如果网页可用但 Live AI 报认证失败，检查该密钥与课程端点是否匹配。若超时，可在 Vercel Runtime Logs 中检查服务连通性；不要将密钥打印到日志。

当前进程内锁只能限制单个函数实例内的并发，不能作为多实例部署的全站限流。公开启用 Live AI 时，建议在百炼设置可用的调用额度限制，并按需要使用 Vercel 的访问保护或限流功能；同源检查不等于用户身份认证。

## Cloudflare 说明

Cloudflare Workers 支持 Python FastAPI，但需要 Python Worker 入口及相应运行时适配；Cloudflare Pages 仅上传 `static/` 无法运行当前 Python 后端。本次配置面向 Vercel，不应把这份仓库直接作为纯静态 Pages 项目发布。

## 官方参考

- [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
- [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python)
- [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
- [Cloudflare Python FastAPI](https://developers.cloudflare.com/workers/languages/python/packages/fastapi/)
