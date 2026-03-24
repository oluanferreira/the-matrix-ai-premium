# /obsidian-health — Vault Health Check

Verifica a saude do vault do Obsidian e identifica problemas.

## Instrucoes

Execute os seguintes comandos e apresente um diagnostico:

1. **Notas orfas (sem ninguem linkando para elas):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" orphans total
```

2. **Links nao resolvidos (links para notas que nao existem):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" unresolved total
```

3. **Dead ends (notas sem links de saida):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" deadends total
```

4. **Propriedades sem tipo definido:**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" properties total
```

5. **Notas na inbox (precisam ser categorizadas):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" files folder=inbox total
```

## Diagnostico

Apresente:
```
🏥 Vault Health Check:
- Orfas: {N} (ideal: < 50)
- Links quebrados: {N} (ideal: 0)
- Dead ends: {N} (ideal: < 30)
- Properties: {N} tipos
- Inbox: {N} notas aguardando categorizacao

Recomendacoes:
- {acao 1 se algo estiver fora do ideal}
- {acao 2}
```
