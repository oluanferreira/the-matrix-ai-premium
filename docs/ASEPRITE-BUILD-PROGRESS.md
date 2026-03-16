# Aseprite — Compilação do Fonte (Progresso)

> Iniciado em 2026-03-14 | Concluído em 2026-03-15 | Status: **CONCLUÍDO**

---

## Objetivo

Compilar o Aseprite a partir do código-fonte (grátis) em vez de comprar o binário ($20).
Resultado: software idêntico, custo zero.

---

## Pré-requisitos — Status

| Requisito | Status | Notas |
|-----------|--------|-------|
| Git | OK | v2.53.0 |
| CMake | OK | Instalado via winget |
| Ninja | OK | Instalado via winget |
| VS2022 Build Tools + C++ | OK | Instalado com VCTools workload |
| Aseprite source code | OK | Clonado em `C:\aseprite-build\aseprite\` (com submodules) |
| Skia (lib gráfica) | OK | Baixado de https://github.com/aseprite/skia/releases (m124-08a5439a6b, 27.4MB) extraído em `C:\aseprite-build\skia\` |

---

## Build Concluído

### Skia
- Fonte: https://github.com/aseprite/skia/releases (release m124-08a5439a6b)
- Arquivo: `Skia-Windows-Release-x64.zip` (27.4MB)
- Extraído em: `C:\aseprite-build\skia\`

### Compilação
- CMake + Ninja executados com sucesso
- Build type: RelWithDebInfo
- 2433 linhas de build log, zero erros

### Resultado
- **Executável:** `C:\aseprite-build\aseprite\build\bin\aseprite.exe`
- **Tamanho:** 21MB
- **Versão:** v1.3.17-9 (baseada no source code commit 5655bbabc)

### Para usar
```powershell
C:\aseprite-build\aseprite\build\bin\aseprite.exe
```

Ou criar atalho no Desktop apontando para o executável acima.

---

## Referências

- [Aseprite GitHub](https://github.com/aseprite/aseprite)
- [Build Instructions (INSTALL.md)](https://github.com/aseprite/aseprite/blob/main/INSTALL.md)
- [Skia Pre-built Releases (oficial)](https://github.com/aseprite/skia/releases)

---

## Contexto

Este Aseprite será usado no projeto **The Matrix AI Visual** — escritório pixel art 2D onde agentes AI trabalham em tempo real. Stack completo: Phaser 3 (v3.90) + Aseprite + LDtk + Node.js/SSE. Custo total: $0.

---

*Build concluído em 2026-03-15*
