# /obsidian-context — Context Load via Obsidian CLI

Carrega contexto do projeto usando a CLI do Obsidian. Mais rapido e eficiente que ler arquivos manualmente.

## Instrucoes

Execute os seguintes comandos e apresente um resumo ao usuario:

1. **Estado do vault:**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" vault
```

2. **Tags mais usadas (entender foco do projeto):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" tags counts sort=count
```

3. **Notas orfas (gaps):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" orphans total
```

4. **Links nao resolvidos (problemas):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" unresolved total
```

5. **Dead ends (notas sem saida):**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" deadends total
```

6. **Daily note de hoje:**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" daily:read
```

7. **Tasks pendentes:**
```bash
"/c/Users/luanf/AppData/Local/Programs/Obsidian/Obsidian.exe" tasks todo limit=10
```

## Output

Apresente um resumo conciso:
```
📋 Contexto Obsidian:
- Vault: {nome} ({N} arquivos)
- Tags dominantes: {top 5}
- Saude: {N} orfas, {N} links quebrados, {N} dead ends
- Daily note: {resumo ou "vazia"}
- Tasks pendentes: {N}
```
