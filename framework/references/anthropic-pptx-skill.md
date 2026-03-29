---
type: reference
source: anthropics/skills/pptx
title: "Anthropic PPTX — Criacao de Apresentacoes (Oficial)"
tags:
  - reference
  - anthropic
  - pptx
  - presentations
  - official
absorbed: 2026-03-29
---

# Anthropic PPTX — Criacao de Apresentacoes

> Fonte: [anthropics/skills/pptx](https://skills.sh/anthropics/skills/pptx) — Anthropic (oficial)
> 50.2K installs/semana | 3/3 audits PASS

## Workflows

### Ler/Analisar PPTX
```bash
python -m markitdown presentation.pptx
```

### Criar do Zero (PptxGenJS)
```javascript
// Via Node.js com pptxgenjs
const pptx = new PptxGenJS();
const slide = pptx.addSlide();
slide.addText("Title", { x: 0.5, y: 0.5, fontSize: 36, bold: true });
pptx.writeFile({ fileName: "output.pptx" });
```

### QA Visual
```bash
# Converter para imagens para inspecao
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
# Verificar placeholders
python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum"
```

## Design System (10 Paletas Anti-AI-Slop)

| Paleta | Uso |
|--------|-----|
| Midnight Executive | Corporativo, formal |
| Forest & Moss | Sustentabilidade, natureza |
| Coral Energy | Startup, energia |
| Warm Terracotta | Artesanal, autenticidade |
| Ocean Gradient | Tech, inovacao |
| Charcoal Minimal | Minimalista, luxury |
| Teal Trust | Saude, fintech |
| Berry & Cream | Feminino, beauty |
| Sage Calm | Wellness, mindfulness |
| Cherry Bold | Impacto, urgencia |

Regra: 1 cor domina (60-70%), 1-2 tons de suporte.

## Typography

| Pairing | Uso |
|---------|-----|
| Georgia / Calibri | Editorial, trust |
| Arial Black / Arial | Bold, direto |
| Cambria / Calibri | Classico, profissional |
| Palatino / Garamond | Elegante, premium |

Sizing: Titulos 36-44pt, Headers 20-24pt, Body 14-16pt, Captions 10-12pt

## Layout Patterns

- Two-column (texto + ilustracao)
- Icon + text rows em circulos coloridos
- Grid 2x2 ou 2x3
- Half-bleed images com content overlay

## Regras Criticas

- NUNCA slides so com texto/bullets
- NUNCA accent lines sob titulos
- Spacing consistente 0.3-0.5" entre blocos
- Margins minimo 0.5" das bordas
- NUNCA texto claro em fundo claro
- Body text left-aligned; center apenas titulos

## Dependencias

| Lib | Funcao | Instalacao |
|-----|--------|-----------|
| markitdown[pptx] | Ler/extrair texto | `pip install markitdown[pptx]` |
| Pillow | Thumbnails | Ja instalado (dep pdf2image) |
| pptxgenjs | Criar slides | `npm i -g pptxgenjs` |
| LibreOffice | PPTX→PDF (QA visual) | Opcional, lazy install |

## Impact na Matrix

### Agentes impactados
- @bugs: `*create-pitch-deck` — pitch para investidores
- @analyst: `*export-research-deck` — pesquisa como apresentacao
- @pm: `*create-presentation` — PRDs visuais
- @kamala: brand presentations
- @mifune: offer/pricing decks
- @traffic-manager: campaign presentations

### Workflows impactados
- Brand Sprint: pitch deck como output opcional
- Spec Pipeline: spec como apresentacao para stakeholders
- Offer-to-Market: deck de oferta
