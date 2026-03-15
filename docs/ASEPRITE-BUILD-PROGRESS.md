# Aseprite — Compilação do Fonte (Progresso)

> Iniciado em 2026-03-14 | Status: **EM ANDAMENTO**

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
| Skia (lib gráfica) | **PENDENTE** | Precisa baixar pre-built de https://github.com/nickelc/aseprite-build/releases OU https://github.com/nickelc/aseprite-build |

---

## Próximos Passos (continuar amanhã)

### Passo 1: Baixar Skia pre-built

```powershell
# Opção A: Baixar Skia pre-built para Windows (mais rápido)
cd C:\aseprite-build
# Baixar de: https://github.com/nickelc/aseprite-build/releases
# Arquivo: Skia-Windows-Release-x64.zip
# Extrair para: C:\aseprite-build\skia
```

Alternativa oficial (compilar Skia manualmente — mais demorado):
```powershell
# Ver instruções em: https://github.com/nickelc/aseprite-build
# Ou: https://github.com/nickelc/nickelc.github.io/wiki/Building-Aseprite-with-Skia
```

### Passo 2: Compilar Aseprite

```powershell
# Abrir "Developer Command Prompt for VS 2022" ou rodar:
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64

cd C:\aseprite-build\aseprite
mkdir build
cd build

cmake -G Ninja ^
  -DCMAKE_BUILD_TYPE=RelWithDebInfo ^
  -DLAF_BACKEND=skia ^
  -DSKIA_DIR=C:\aseprite-build\skia ^
  -DSKIA_LIBRARY_DIR=C:\aseprite-build\skia\out\Release-x64 ^
  -DSKIA_LIBRARY=C:\aseprite-build\skia\out\Release-x64\skia.lib ^
  ..

ninja aseprite
```

### Passo 3: Verificar

```powershell
# O executável estará em:
C:\aseprite-build\aseprite\build\bin\aseprite.exe

# Testar:
.\bin\aseprite.exe
```

### Passo 4: Criar atalho

Criar atalho no Desktop apontando para `C:\aseprite-build\aseprite\build\bin\aseprite.exe`

---

## Referências

- [Aseprite GitHub](https://github.com/aseprite/aseprite)
- [Build Instructions (INSTALL.md)](https://github.com/aseprite/aseprite/blob/main/INSTALL.md)
- [Skia Pre-built Releases](https://github.com/nickelc/aseprite-build/releases)
- [Nickelc Build Wiki](https://github.com/nickelc/nickelc.github.io/wiki/Building-Aseprite-with-Skia)

---

## Contexto

Este Aseprite será usado no projeto **The Matrix AI Visual** — escritório pixel art 2D onde agentes AI trabalham em tempo real. Stack completo: Phaser 4 + Aseprite + LDtk + Node.js/SSE. Custo total: $0.

---

*Progresso salvo em 2026-03-14*
