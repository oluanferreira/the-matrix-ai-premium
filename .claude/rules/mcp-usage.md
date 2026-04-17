---
paths: **/*
---

# MCP Server Usage Rules - LMAS Architecture

## MCP Governance

**IMPORTANT:** All MCP infrastructure management is handled EXCLUSIVELY by the **DevOps Agent (@devops / Operator)**.

| Operation | Agent | Command |
|-----------|-------|---------|
| Search MCP catalog | DevOps | `*search-mcp` |
| Add MCP server | DevOps | `*add-mcp` |
| List enabled MCPs | DevOps | `*list-mcps` |
| Remove MCP server | DevOps | `*remove-mcp` |
| Setup Docker MCP | DevOps | `*setup-mcp-docker` |

Other agents (Dev, Architect, etc.) are MCP **consumers**, not administrators. If MCP management is needed, delegate to @devops.

---

## MCP Configuration Architecture

LMAS uses Docker MCP Toolkit as the primary MCP infrastructure:

### Direct in Claude Code (global ~/.claude.json)
| MCP | Purpose | Transport |
|-----|---------|-----------|
| **playwright** | Browser automation, screenshots, web testing | stdio |
| **desktop-commander** | Docker container operations via docker-gateway | stdio |
| **magic** | 21st.dev component builder | stdio |

### Inside Docker Desktop (via docker-gateway)

| MCP | Purpose |
|-----|---------|
| **EXA** | Web search, research, company/competitor analysis |
| **Context7** | Library documentation lookup |

## CRITICAL: Tool Selection Priority

ALWAYS prefer native Claude Code tools over MCP servers:

| Task | USE THIS | NOT THIS |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write` / `Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` tool | docker-gateway |
| Search content | `Grep` tool | docker-gateway |
| List directories | `Bash(ls)` or `Glob` | docker-gateway |

## desktop-commander (docker-gateway) Usage

### ONLY use docker-gateway when:
1. User explicitly says "use docker" or "use container"
2. User explicitly mentions "Desktop Commander"
3. Task specifically requires Docker container operations
4. Accessing MCPs running inside Docker (EXA, Context7)
5. User asks to run something inside a Docker container

### NEVER use docker-gateway for:
- Reading local files (use `Read` tool)
- Writing local files (use `Write` or `Edit` tools)
- Running shell commands on host (use `Bash` tool)
- Searching files (use `Glob` or `Grep` tools)
- Listing directories (use `Bash(ls)` or `Glob`)
- Running Node.js or Python scripts on host (use `Bash` tool)

## playwright MCP Usage

### ONLY use playwright when:
1. User explicitly asks for browser automation
2. User wants to take screenshots of web pages
3. User needs to interact with a website
4. Task requires web scraping or testing
5. Filling forms or clicking elements on web pages

### NEVER use playwright for:
- General file operations
- Running commands
- Anything not related to web browsers

## EXA MCP Usage (via Docker)

### Use EXA (mcp__docker-gateway__web_search_exa) for:
1. Web searches for current information
2. Research and documentation lookup
3. Company and competitor research
4. Finding code examples online

### Access pattern:
```
mcp__docker-gateway__web_search_exa
```

## Context7 MCP Usage (via Docker)

### Use Context7 for:
1. Library documentation lookup
2. API reference for packages/frameworks
3. Getting up-to-date docs for dependencies

### Access pattern:
```
mcp__docker-gateway__resolve-library-id
mcp__docker-gateway__get-library-docs
```

## 21st.dev Magic MCP Usage (Direct — stdio)

21st.dev e um ecossistema com 3 camadas: Library (1.100+ componentes gratuitos), MCP Tools (4 tools AI), e Agents SDK.

### Hierarquia de uso: Library > Builder > Manual

| Nivel | Canal | Custo | Quando |
|-------|-------|-------|--------|
| **1. Library (CLI)** | `npx shadcn@latest add "https://21st.dev/r/{autor}/{comp}"` | GRATIS | Componente pronto existe na library |
| **2. MCP Inspiration** | `component_inspiration` | GRATIS (0 tokens) | Buscar referencias antes de gerar |
| **3. MCP Builder** | `component_builder` | 1 token | Nada pronto atende, gerar com AI |
| **4. MCP Refiner** | `component_refiner` | GRATIS | Melhorar componente existente |
| **5. Manual** | Codigo manual | GRATIS | Muito especifico, sem padrao shadcn |

### 4 Tools disponiveis:

| Tool | Dono Primario | Dono Secundario | Uso |
|------|-------------|----------------|-----|
| `component_builder` | @dev | — | Gerar componentes React/Tailwind de descricao textual |
| `component_refiner` | @dev | @ux-design-expert | Melhorar/redesenhar componentes existentes |
| `component_inspiration` | @ux-design-expert | @dev, @kamala | Buscar referencias de componentes na library |
| `logo_search` | @kamala | @dev, @ux-design-expert | Buscar logos profissionais (JSX/TSX/SVG) |

### Library — Inventario (1.100+ componentes):

| Categoria | Qtd | Uso |
|-----------|-----|-----|
| Hero Sections | 284 | Landing pages |
| Buttons | 250 | CTAs, forms |
| Cards | 79 | Features, products |
| Texts/Typography | 58 | Animated, gradient |
| Modals/Dialogs | 37 | Forms overlay |
| Features | 36 | Product sections |
| Hooks | 31 | useMediaQuery, useDebounce |
| Tables | 30 | Dashboards |
| Images | 26 | Galleries, zoom |
| Scroll Areas | 24 | Parallax, snap |
| Pricing | 17 | SaaS pricing |
| Testimonials | 15 | Social proof |
| Backgrounds | 15 | Animated, particles |
| Sidebars | 14 | Dashboard layouts |
| Footers | 14 | Links, social |
| Navigation | 11 | Headers, menus |
| AI Chat | 10 | Chat bubbles, streaming |
| Dashboard | 8 | Analytics, KPIs |

### Quando usar 21st.dev vs codigo manual:

| Situacao | Usar 21st.dev? | Canal |
|----------|---------------|-------|
| Novo componente UI (botao, card, form, modal) | SIM | Library primeiro, Builder se nao tem |
| Componente existe mas precisa de polish | SIM | Refiner |
| Precisa de inspiracao antes de construir | SIM | Inspiration |
| Precisa de logo de empresa/marca | SIM | logo_search |
| Componente back-end only (API, service) | NAO | — |
| Projeto nao usa React/Tailwind | NAO | — |
| Landing page completa | SIM | Library para cada secao (hero+features+pricing+CTA+footer) |

---

## MCP Control via Settings

Chaves de `settings.json` para controle granular de MCP servers (descobertas via absorção claude-code-templates, 2026-03-31):

| Chave | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| `enableAllProjectMcpServers` | boolean | Auto-aprovar todos MCPs do projeto (elimina prompts) | `true` |
| `enabledMcpjsonServers` | string[] | Whitelist — apenas estes MCPs sao ativados | `["memory", "github"]` |
| `disabledMcpjsonServers` | string[] | Blacklist — estes MCPs sao desativados | `["web-scraper"]` |
| `MCP_TIMEOUT` | number (env) | Timeout de conexao MCP em ms | `30000` |
| `MCP_TOOL_TIMEOUT` | number (env) | Timeout de execucao de tool MCP em ms | `60000` |
| `MAX_MCP_OUTPUT_TOKENS` | number (env) | Limite de tokens de output MCP | `50000` |

**Uso recomendado:**
- **CI/ambientes trusted:** `enableAllProjectMcpServers: true` elimina aprovacao manual
- **Projetos com MCPs arriscados:** `disabledMcpjsonServers` para blacklist seletiva
- **Timeout de MCPs lentos:** `MCP_TOOL_TIMEOUT: 120000` para MCPs que demoram (CodeRabbit)

> **Referencia completa:** `framework/references/claude-code-settings-keys.md`

---

## Rationale

- **Native tools** execute on the LOCAL system (Windows/Mac/Linux)
- **docker-gateway** executes inside Docker containers (Linux)
- Using docker-gateway for local operations causes path mismatches and failures
- Native tools are faster and more reliable for local file operations
- EXA and Context7 run inside Docker for isolation and consistent environment
- playwright runs directly for better browser integration with host system

---

## Known Issues

### Docker MCP Secrets Bug (Dec 2025)

**Issue:** Docker MCP Toolkit's secrets store and template interpolation do not work properly. Credentials set via `docker mcp secret set` are NOT passed to containers.

**Symptoms:**
- `docker mcp tools ls` shows "(N prompts)" instead of "(N tools)"
- MCP server starts but fails authentication
- Verbose output shows `-e ENV_VAR` without values

**Workaround:** Edit `~/.docker/mcp/catalogs/docker-mcp.yaml` directly with hardcoded env values:
```yaml
{mcp-name}:
  env:
    - name: API_TOKEN
      value: 'actual-token-value'
```

**Affected MCPs:** Any MCP requiring authentication (Notion, Slack, etc.)

**Working MCPs:** EXA works because its key is in `~/.docker/mcp/config.yaml` under `apiKeys`

For detailed instructions, see `*add-mcp` task or ask @devops for assistance.
