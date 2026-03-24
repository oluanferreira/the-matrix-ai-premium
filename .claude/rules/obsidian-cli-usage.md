# Obsidian CLI Usage — Intelligence Layer

## Rule (SHOULD — All Agents)

O Obsidian CLI esta disponivel para consultas rapidas ao vault. Use-o para operacoes que se beneficiam de metadata do Obsidian (backlinks, tags, orphans, properties) em vez de ler arquivos raw.

## Como Executar

O binario esta em:
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" <command> [options]
```

Alias sugerido no bash:
```bash
alias obs='"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe"'
```

## Quando Usar CLI vs Read Tool

| Necessidade | Usar CLI | Usar Read Tool |
|-------------|----------|---------------|
| Buscar texto no vault | `search query="X"` | NAO — CLI e mais rapido |
| Ler conteudo de uma nota | NAO — Read e mais completo | `Read file_path` |
| Ver backlinks de uma nota | `backlinks file=X` | NAO — impossivel sem CLI |
| Listar tags | `tags counts sort=count` | NAO — impossivel sem CLI |
| Contar notas orfas | `orphans total` | NAO — impossivel sem CLI |
| Ler/modificar frontmatter | `property:read/set` | Edit tool para mudancas complexas |
| Criar nota rapida | `create name="X" content="Y"` | Write tool para notas longas |
| Adicionar a daily note | `daily:append content="X"` | NAO — CLI e direto |
| Listar tasks | `tasks todo` | Grep para buscas complexas |
| Ver info de arquivo | `file file=X` | Read para conteudo |
| Listar links de saida | `links file=X` | NAO — impossivel sem CLI |
| Links nao resolvidos | `unresolved` | NAO — impossivel sem CLI |

## Comandos Mais Uteis para Agentes

### Context-Load (Rule 1 — Pre-Read)
```bash
# Ver estado geral do vault
obs vault

# Tags mais usadas (entender o projeto)
obs tags counts sort=count

# Notas orfas (gaps de documentacao)
obs orphans total

# Backlinks de um doc (quem referencia isso?)
obs backlinks file="PROJECT-CHECKPOINT"

# Buscar por tema
obs search query="auth" limit=10
```

### Checkpoint Updates
```bash
# Adicionar na daily note
obs daily:append content="- Sessao: implementei story 5.3, status InProgress"

# Ler propriedade de uma nota
obs property:read name="status" file="story-5.3"

# Atualizar propriedade
obs property:set name="status" value="Done" file="story-5.3"
```

### Analise e Qualidade
```bash
# Links quebrados
obs unresolved total

# Dead ends (notas sem links de saida)
obs deadends total

# Outline de uma nota
obs outline file="core-architecture"

# Contar palavras
obs wordcount file="PRD"
```

## Limitacoes

- CLI requer Obsidian aberto (desktop app rodando)
- Busca nao e semantica (apenas texto exato) — para semantica, usar Smart Connections plugin (Fase 4+)
- Nao substitui Read/Write/Edit para manipulacao de conteudo
- Resultados podem ser grandes — usar `limit=N` e `total` para controlar output
