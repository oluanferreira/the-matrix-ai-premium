---
title: SLC Methodology — Simple, Lovable, Complete
type: reference
domain: methodology
status: canonical
version: 1.0
adopted: 2026-04-14
supersedes: MVP (as Phase 1 default)
origin: Jason Cohen (WP Engine, 2017)
---

# SLC — Simple, Lovable, Complete

> **Paráfrase da tese de Jason Cohen** (WP Engine founder, 2017): em mercados maduros, o novo padrão mínimo não é "minimum viable" — é **simples, amável e completo**. Entregar pouco, mas entregar bem.

## Por que existe

A Matrix (LMAS) já pratica alta qualidade por constituição: Quality First (Art. V), Artifact Completeness (Art. VI), Generator Completeness (RULE_15), Workflow Fidelity (Art. VII). Chamar a entrega inicial de "MVP" contradizia essa DNA. SLC é o nome correto da metodologia que a Matrix já executa.

## Os 3 eixos (MUST — todos obrigatórios)

### Simple
- **1 jornada ponta-a-ponta**, não 5 jornadas pela metade
- Escopo MÍNIMO — se dá pra cortar, corta
- @pm tem autoridade para rejeitar slices inflados
- @hamann counsel pró redução quando o slice cresce

**Evidência obrigatória:** lista de features fora do slice (o que ficou de fora e por quê)

### Lovable
- UI polida — não "funcional e feia"
- Microcopy cuidada — @copywriter revisa textos user-facing
- Brand presente — @kamala valida tom visual e narrativa
- UX validada — @ux-design-expert aprova flows críticos
- Acessibilidade básica coberta (não é "depois")

**Evidência obrigatória:** screenshots dos fluxos + review de copy + validação brand

### Complete
- Cada feature incluída no slice é 100% funcional
- Sem stubs, sem "TODO: implementar depois"
- Happy path + edge cases principais cobertos
- Testes automatizados para o slice (unit + integration mínimo)
- Error states implementados (não só happy path)
- @qa valida os 3 eixos como quality gate
- @smith audita evidências no adversarial review

**Evidência obrigatória:** testes verdes, checklist de edge cases, prova de tratamento de erros

## Carve-outs (quando MVP ainda é válido)

SLC é **default**. MVP permanece válido APENAS nestes casos explícitos:

| Caso | Exemplo |
|------|---------|
| Ferramenta interna com <10 usuários | Admin panel interno com 3 pessoas, scripts de ops |
| Spike técnico descartável | Validar se API X responde, POC de integração |
| Validação pura de hipótese sem brand | Formulário-fake de landing pra medir conversão |

**Fora dos carve-outs, MVP é proibido para projetos Matrix.** Usar MVP num produto user-facing com brand investido = finding CRITICAL Smith.

## SLC vs MVP — tabela comparativa

| Eixo | MVP | SLC |
|------|-----|-----|
| Escopo | Mínimo | Pequeno |
| Qualidade | Baixa aceitável | Alta obrigatória |
| Meta | Aprender | Encantar + aprender |
| Usuário trata como | Cobaia | Cliente real |
| Marca | Ausente ou quebrada | Presente e polida |
| Risco principal | Queimar usuário | Escopo infinito |
| Mitigação | Itera rápido | Corta escopo, não qualidade |

## Tradução SLC ↔ MVP (comunicação externa)

Investidores, clientes e outros devs entendem "MVP". Quando comunicar externamente:

- **Internamente (Matrix):** "Vamos entregar SLC slice de checkout"
- **Externamente (cliente):** "Vamos entregar MVP polido de checkout — uma jornada completa, pronta pra usuário real"

O agente adapta a linguagem. Internamente, SLC tem dentes (eixos como quality gate). Externamente, o conceito é traduzido sem perder o padrão.

## Aplicação por workflow

### Greenfield (novo produto)
- **Phase 1 = SLC slice delivery**, não "MVP build"
- @pm define o slice com 3 eixos no PRD
- @architect valida viabilidade ("a arquitetura suporta entregar slice lovable?")
- @qa gate inclui SLC axes audit

### Brownfield (produto existente)
- SLC não retroage — não tenta transformar produto ruim em SLC de uma vez
- **SLC upgrade path**: roadmap de melhorias que aproximam o produto do padrão SLC
- Cada nova feature entra como slice SLC

### Spec Pipeline
- Gate adicional após critique: **SLC viability check**
- Se a spec não permite entregar slice lovable → revisar escopo ANTES de implementação

## Anti-padrões (SLC-washing)

Se alguma dessas afirmações soa familiar, não é SLC — é MVP disfarçado:

- "Tá quase completo, falta só polir depois"
- "O MVP tá pronto, só precisa de um pouco de design"
- "Lançamos agora, iteramos a UX na v2"
- "Tá feio mas funciona"
- "O teste ficou pra próxima sprint"
- "Essa feature tá 80%, os outros 20% a gente vê depois"

Smith bloqueia claim de SLC sem evidência nos 3 eixos. O risco real do SLC não é qualidade baixa — é **escopo inflado**. O cura é cortar features, não cortar qualidade.

## Autoridade e enforcement

| Agente | Papel no SLC |
|--------|-------------|
| @pm (Morgan) | Define o slice no PRD com os 3 eixos. Rejeita slices inflados. |
| @po (Keymaker) | Valida stories contra os eixos. Bloqueia expansão mid-phase. Lê tag `slc_phase_1_slice` em story-tmpl. |
| @sm (River) | Tagueia stories de Phase 1 como SLC slice. |
| @architect (Aria) | Valida viabilidade arquitetural do slice lovable. |
| @ux-design-expert (Sati) | Veto sobre claim "Lovable" — UX polida obrigatória. |
| @kamala (Kamala) | Veto sobre "Lovable" lado brand — identidade presente. |
| @copywriter (Mouse) | Review de microcopy user-facing. |
| @mifune (Mifune) | SLC Offer Discipline — ofertas, pricing e lançamento alinham ao slice. Recusa value stack fora do Simple. |
| @bugs (Bugs) | SLC Narrative Anchor — narrativa e pitch amarram ao que de fato ship no slice Complete. Zero ficção. |
| @qa (Oracle) | Quality gate — os 3 eixos com evidência. |
| @smith | Adversarial audit via `*verify-slc-axes` — claim sem evidência = CRITICAL. Routing definido em smith.md:slc_audit_routing. |
| @hamann | Counsel pró redução de escopo quando slice infla. |

## Origem e referências

- **Jason Cohen**, WP Engine founder, "Simple, Lovable, Complete" (A Smart Bear blog, 2017)
- Reconciliado com **Rails Doctrine** #4 (Integrated Systems) e #2 (Convention over Configuration)
- Complementar a **Eric Ries** (Lean Startup) — SLC é a resposta ao custo oculto de MVPs quebrados em mercados maduros
- Alinhado com **Quality First** (Matrix Constitution Art. V) e **Generator Completeness** (RULE_15)

## Ver também

- `.synapse/constitution` — CONSTITUTION_RULE_9 (SLC First)
- `.lmas-core/product/templates/prd-tmpl.yaml` — seção SLC Slice Definition (campo `slc-slice`)
- `.lmas-core/product/templates/brownfield-prd-tmpl.yaml` — seção SLC Upgrade Path
- `.lmas-core/product/templates/story-tmpl.yaml` — tag `slc-phase-1-slice`
- `.lmas-core/development/workflows/greenfield-fullstack.yaml` — project_type `slc-slice` default
- `.lmas-core/development/tasks/qa-gate.md` — quality gate audita evidência nos 3 eixos
- `framework/references/rails-doctrine-patterns.md` — Rails Doctrine #2 (Generator Completeness)
