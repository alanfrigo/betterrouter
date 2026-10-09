# Docker

Run Better Router in a container. Image destination: [`alanmf30/betterrouter`](https://hub.docker.com/r/alanmf30/betterrouter). Release CI builds `linux/amd64` + `linux/arm64`; manual commit builds support only platforms actually built and published.

---

# 👤 For Users

## Quick start

```bash
docker run -d \
  -p 20128:20128 \
  -v "$HOME/.9router:/app/data" \
  -e DATA_DIR=/app/data \
  --name 9router \
  alanmf30/betterrouter:latest
```

App listens on port `20128`. Open: http://localhost:20128

## Manage container

```bash
docker logs -f 9router        # view logs
docker stop 9router           # stop
docker start 9router          # start again
docker rm -f 9router          # remove
```

## Data persistence

```bash
-v "$HOME/.9router:/app/data" \
-e DATA_DIR=/app/data
```

Without `DATA_DIR`, the app falls back to `~/.9router/` (macOS/Linux) or `%APPDATA%\9router\` (Windows). In the container, `DATA_DIR=/app/data` makes the bind mount work.

Data layout under `$DATA_DIR/`:

```text
$DATA_DIR/
├── db/
│   ├── data.sqlite       # main SQLite database
│   └── backups/          # auto backups
└── ...                   # certs, logs, runtime configs
```

Host path: `$HOME/.9router/db/data.sqlite`
Container path: `/app/data/db/data.sqlite`

## Optional env vars

```bash
docker run -d \
  -p 20128:20128 \
  -v "$HOME/.9router:/app/data" \
  -e DATA_DIR=/app/data \
  -e PORT=20128 \
  -e HOSTNAME=0.0.0.0 \
  -e DEBUG=true \
  --name 9router \
  alanmf30/betterrouter:latest
```

## Optional Headroom sidecar

The 9Router image does not bundle Python or Headroom. To use Headroom in Docker, run it as a separate service and point 9Router at that proxy:

```yaml
services:
  9router:
    image: alanmf30/betterrouter:latest
    ports:
      - "20128:20128"
    volumes:
      - "$HOME/.9router:/app/data"
    environment:
      DATA_DIR: /app/data
      HEADROOM_URL: http://headroom:8787
    depends_on:
      - headroom

  headroom:
    image: ghcr.io/chopratejas/headroom:latest
    ports:
      - "8787:8787"
```

In the dashboard, open `Endpoint` → `Token Saver` → `Headroom`, confirm the URL is `http://headroom:8787`, recheck status, then enable Headroom.

If Headroom runs on the Docker host instead of as a sidecar, use `http://host.docker.internal:8787` on macOS/Windows. On Linux, add `--add-host=host.docker.internal:host-gateway` or the equivalent compose `extra_hosts` entry.

## Update to latest

```bash
docker pull alanmf30/betterrouter:latest
docker rm -f 9router
# re-run the quick start command
```

To pin a manual commit build instead of following `latest`, use its Git short-SHA tag:

```bash
docker pull alanmf30/betterrouter:<git-short-sha>
```

---

# 🛠 For Developers

## Build image locally (test)

```bash
docker build -t alanmf30/betterrouter .

docker run --rm -p 20128:20128 \
  -v "$HOME/.9router:/app/data" \
  -e DATA_DIR=/app/data \
  alanmf30/betterrouter
```

## Runtime and build prerequisites

The image uses Node 22 on Debian Bookworm slim (glibc), not Alpine. Chromium and its shared libraries are installed with the bundled Playwright CLI; `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright` is shared by root during installation and the non-root `node` runtime. The image includes Playwright, wreq-js native bindings, tokenizer/image assets, and the standalone MCP subprocess with its traced dependencies. No external OmniRoute checkout is needed or shipped.

Build from the repository root with Docker BuildKit and network access to Debian, npm, and Playwright browser downloads. Default build args: `NODE_IMAGE=node:22-bookworm-slim`, `NPM_REGISTRY=https://registry.npmjs.org/`, `APP_VERSION=unknown`. Keep overrides Debian/glibc-compatible; pass `APP_VERSION` as the release version or commit SHA. Host `node_modules`, `.next*`, CLI build output, and test dependencies are excluded from the context.

```bash
docker build \
  --build-arg APP_VERSION=<git-short-sha> \
  --build-arg NPM_REGISTRY=https://registry.npmjs.org/ \
  -t alanmf30/betterrouter:<git-short-sha> .
```

Startup fixes ownership of `/app/data` and `/app/data-home`, then drops privileges with `gosu node`. `custom-server.js` remains the entrypoint to preserve trusted client-IP handling. Persist `/app/data-home` separately if usage logs and other `~/.9router` files must survive recreation; `DATA_DIR=/app/data` covers the database. Browser-heavy workloads may need `--shm-size=1g`. External MCP commands need their own executable and credentials; the bundled ChatGPT web MCP runs with included Node dependencies.

Security: set a strong `INITIAL_PASSWORD` and `JWT_SECRET` through runtime environment variables, never build args. Prefer binding `-p 127.0.0.1:20128:20128` unless remote access is intentionally secured. No privileged container is required.

## Publish (automatic via CI)

Push a Docker-safe semver git tag `vX.Y.Z` (or a prerelease such as `vX.Y.Z-rc.1`) → GitHub Actions builds `linux/amd64` and `linux/arm64` on native runners, health-checks each platform image, verifies the resulting manifest and `/api/health`, then publishes:

- `ghcr.io/alanfrigo/betterrouter:X.Y.Z` + `:latest`
- `alanmf30/betterrouter:X.Y.Z` + `:latest`

The `v` prefix is used only for the git tag; image tags omit it. A stable tag push promotes `latest`, but a prerelease tag such as `vX.Y.Z-rc.1` publishes only its numbered image by default. Prereleases require an explicit manual `promote_latest` opt-in. Promotion happens only after both native platform builds, both platform health checks, manifest inspection, and the resolved-manifest smoke test succeed. A failed or timed-out platform build therefore cannot move `latest`.

The workflow rejects SemVer build metadata such as `v1.2.3+build.7` because the `+` form is not a valid Docker image tag. The git tag and both `package.json` versions must match exactly.

```bash
# Use scripts/release.js (recommended)
node scripts/release.js "Release title" "Notes"

# Or manually
git tag v0.5.81 && git push origin v0.5.81
```

To republish an existing tag, run the `Build and Push Docker Image` workflow manually and provide the exact tag, for example `v0.5.81`, in the `release_tag` input. Manual runs publish the numbered tag but leave `latest` unchanged by default:

```text
release_tag:     v0.5.81
promote_latest:  false
```

The `promote_latest` checkbox is an explicit opt-in for changing `latest`. Use it when a deliberate rollback or recovery should make that version the current default:

```text
release_tag:     v0.5.75
promote_latest:  true
```

Numbered image tags are mutable because a republish can replace their manifest. For a deployment that must be immutable, pin the image digest instead:

```bash
docker pull alanmf30/betterrouter@sha256:<verified-digest>
```

The release workflow runs `/api/health` on each native `amd64` and `arm64` platform image before it uploads the digest artifact or assembles the multi-platform manifest. It then runs a second health check against the resolved version manifest before any requested `latest` promotion.

During recovery, the selected tag remains the application source while the Dockerfile from the workflow revision is used, so an older tag can be rebuilt with the current publishing fixes.

The workflow is tag-driven. Creating a git tag does not automatically create a GitHub Release, so the Releases page and the published package/image tags can be at different versions unless a maintainer creates a release separately.

The `alanfrigo/betterrouter` repository needs these repository secrets for Docker Hub publishing:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

GHCR publishing uses the workflow's `GITHUB_TOKEN` with package write permission. Docker Hub publication is restricted to the `alanfrigo/betterrouter` repository and targets `alanmf30/betterrouter`.

The optional repository variable `NPM_REGISTRY` overrides the npm registry used by the CI Docker build. Local commit-SHA publication is separate from this semver workflow; do not create a release tag merely to publish a commit build.

Workflow: `.github/workflows/docker-publish.yml`
