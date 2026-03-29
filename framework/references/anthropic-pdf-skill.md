---
type: reference
source: anthropics/skills/pdf
title: "Anthropic PDF Processing — Skill Oficial"
tags:
  - reference
  - anthropic
  - pdf
  - official
  - canonical
absorbed: 2026-03-29
---

# Anthropic PDF Processing — Referência Oficial

> Fonte: [anthropics/skills/pdf](https://skills.sh/anthropics/skills/pdf) — Anthropic (oficial)
> 54.8K installs/semana | 105K stars | Skill que alimenta document capabilities do Claude.ai

## Bibliotecas Python

### pypdf — Operações básicas
- Ler PDFs e acessar page count
- Merge (adicionar páginas sequencialmente)
- Split em arquivos de página única
- Extrair metadata (title, author, subject, creator)
- Rotacionar páginas (90 graus)
- Adicionar watermarks
- Password protection

### pdfplumber — Extração de texto e tabelas
- Extrair texto preservando layout
- Identificar e extrair tabelas
- Converter tabelas para pandas DataFrames
- Exportar para Excel

### reportlab — Criação de PDFs
- Criar PDFs com Canvas ou Platypus
- Adicionar texto, linhas, elementos visuais
- Multi-page documents com estilos
- NUNCA usar Unicode subscript/superscript (renderiza como blocos pretos)
- Usar XML tags: `<sub>`, `<super>`

## CLI Tools

| Ferramenta | Uso |
|-----------|-----|
| `pdftotext` | Extrair texto com layout e page range |
| `qpdf` | Merge, split, rotate, decrypt |
| `pdftk` | Legacy: merge, split, rotate |
| `pdfimages` | Extrair imagens (JPEG) |

## OCR (PDFs escaneados)

```python
from pdf2image import convert_from_path
import pytesseract

images = convert_from_path('scanned.pdf')
for img in images:
    text = pytesseract.image_to_string(img)
```

## Quick Reference

| Task | Tool | Método |
|------|------|--------|
| Merge | pypdf | Adição sequencial de páginas |
| Split | pypdf | 1 arquivo por página |
| Extrair texto | pdfplumber | Layout-aware parsing |
| Extrair tabelas | pdfplumber | Table detection + DataFrame |
| Criar PDF | reportlab | Canvas ou Platypus |
| Decrypt | qpdf | CLI password removal |
| OCR | pdf2image + pytesseract | Imagem → texto |

## Instalação

```bash
pip install pypdf pdfplumber reportlab pdf2image pytesseract
# CLI tools (apt/brew):
# pdftotext (poppler-utils), qpdf, pdftk
```

## Integração com LMAS

- **Read tool** continua sendo o padrão para leitura simples de PDFs (max 20 páginas)
- **pdfplumber** para quando precisar extrair TABELAS de PDFs
- **reportlab** para quando precisar CRIAR PDFs (reports, specs)
- **OCR** para PDFs escaneados (imagens sem texto selecionável)


## Impact Analysis (retroativa)

### Comandos propostos
- @analyst: *extract-pdf-tables � extrair tabelas de PDFs
- @pm: *export-pdf � exportar PRD como PDF
- @ux-design-expert: *read-brandbook � extrair brand guidelines de PDF

### Workflows impactados
- Brownfield Discovery: ler PDFs tecnicos com extracao de tabelas
- Design Handoff: PDF export como deliverable

### Substituicoes
- Copia manual de texto ? pdfplumber
- PDFs escaneados ilegiveis ? OCR
- Impossivel criar PDFs ? reportlab

### Quality Gates
- Smith pode verificar PDFs gerados

### Status: Awareness implementado (SYNAPSE + tool-examples). Comandos e workflow updates como proximos passos quando agentes forem modificados.