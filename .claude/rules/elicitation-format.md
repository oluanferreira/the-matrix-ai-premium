---
paths:
  - ".lmas-core/development/agents/**"
  - ".lmas-core/development/tasks/**"
---
# Elicitation Format — Padrao de Comunicacao Agente→Usuario

## Rule (SHOULD — All Agents)

Quando um agente precisa fazer uma pergunta ao usuario (elicitation point, decisao, confirmacao), DEVE seguir este formato padronizado. O objetivo e que o usuario entenda a pergunta em 5 segundos, mesmo que nao olhe a tela ha 20 minutos.

## Formato Padrao

### 1. RE-GROUND (1-2 frases)

Recontextualizar onde estamos: projeto, branch, task atual.

| Exec Mode | Comportamento |
|-----------|---------------|
| YOLO | SKIP — sem re-ground (0 prompts) |
| Interactive | Curto — projeto + task em 1 frase |
| Pre-Flight | Completo — projeto + branch + story + task + contexto |
| Safety | Completo + alerta de modo seguro |

Exemplo Interactive:
> **Projeto ClaWin, implementando auth flow.** Preciso de uma decisao:

### 2. SIMPLIFY

Explicar o problema em linguagem clara. Sem jargao interno, sem nomes de funcoes, sem detalhes de implementacao. Usar analogias quando possivel.

**Regra:** Se voce precisaria ler o codigo-fonte para entender sua propria explicacao, esta complexo demais.

### 3. RECOMMEND

```
RECOMENDACAO: Opcao [X] porque [razao em 1 linha]
```

Incluir **Completude: X/10** para cada opcao:

| Score | Significado |
|-------|------------|
| 10 | Implementacao completa — todos os edge cases, cobertura total |
| 7 | Happy path coberto, alguns edge cases faltando |
| 5 | Funcional mas com lacunas conhecidas |
| 3 | Atalho que adia trabalho significativo |

**Sempre recomendar a opcao mais completa** — o custo marginal com AI e proximo de zero.

### 4. OPTIONS

Opcoes letradas com estimativa de esforco quando relevante:

```
A) Implementacao completa com testes (Completude: 9/10)
B) Happy path apenas, testes depois (Completude: 6/10)
C) Pular por agora (Completude: 2/10)
```

Para opcoes que envolvem esforco, mostrar ambas as escalas:
```
A) Auth completo com OAuth + email (humano: ~3 dias / AI: ~30 min) — Completude: 9/10
```

## Tabelas de Compressao por Dominio

### Software Development

| Tipo de Task | Humano | AI-Assistido | Compressao |
|-------------|--------|-------------|------------|
| Boilerplate / scaffolding | 2 dias | 15 min | ~100x |
| Escrita de testes | 1 dia | 15 min | ~50x |
| Feature implementation | 1 semana | 30 min | ~30x |
| Bug fix + regression test | 4 horas | 15 min | ~20x |
| Arquitetura / design | 2 dias | 4 horas | ~5x |
| Pesquisa / exploracao | 1 dia | 3 horas | ~3x |

### Marketing

| Tipo de Task | Humano | AI-Assistido | Compressao |
|-------------|--------|-------------|------------|
| Copy de landing page | 2 dias | 20 min | ~30x |
| Email sequence (5 emails) | 3 dias | 30 min | ~30x |
| Content strategy | 1 semana | 2 horas | ~5x |
| Pesquisa de mercado | 2 dias | 1 hora | ~10x |
| SEO audit completo | 1 dia | 30 min | ~15x |

### Brand

| Tipo de Task | Humano | AI-Assistido | Compressao |
|-------------|--------|-------------|------------|
| Brand positioning | 2 semanas | 2 horas | ~20x |
| Naming (geracao + avaliacao) | 1 semana | 30 min | ~20x |
| Brand identity system | 2 semanas | 4 horas | ~10x |
| Narrativa de marca | 1 semana | 1 hora | ~15x |

### Business

| Tipo de Task | Humano | AI-Assistido | Compressao |
|-------------|--------|-------------|------------|
| Offer design (value stack) | 1 semana | 1 hora | ~10x |
| Pricing strategy | 3 dias | 30 min | ~15x |
| Campaign plan | 2 dias | 30 min | ~15x |
| Business model canvas | 1 dia | 30 min | ~10x |

## Quando NAO Aplicar

- Modo YOLO (0 elicitation points — agente decide sozinho)
- Confirmacoes triviais (sim/nao sem opcoes)
- Morpheus executando `*task` diretamente
- Informacoes fatuais (nao ha decisao a tomar)

## Obrigatoriedade

Esta rule e **SHOULD** — agentes podem customizar o formato para tasks especificas onde o padrao nao se aplica bem (ex: @data-engineer *model-domain tem elicitation propria). O formato padrao e o DEFAULT quando nenhum formato especifico e definido na task.
