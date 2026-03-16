# Checkpoint Protocol — Automatic Project State Tracking

## Regra Global (MUST)

**TODOS os agentes DEVEM atualizar `docs/PROJECT-CHECKPOINT.md` após qualquer ação relevante.**

Isso NÃO é opcional. O checkpoint é o "save point" do projeto — garante continuidade entre sessões.

## Trigger Events (quando atualizar)

Atualize o checkpoint **imediatamente após** qualquer uma destas ações:

| Evento | Exemplo | Seção a atualizar |
|--------|---------|-------------------|
| **Story criada** | @sm cria story 4.5 | Status das Stories, Totais |
| **Story completada** | @dev marca Ready for Review | Status das Stories, Último Trabalho, Próximos Passos, Totais |
| **Story status mudou** | Draft → InProgress → Done | Status das Stories |
| **Documento criado** | PRD, Architecture, ADR | Documentos do Projeto |
| **Documento atualizado** | PRD v1.3 → v1.4 | Documentos do Projeto |
| **Agente criado** | @checkpoint criado | Último Trabalho |
| **Decisão arquitetural** | ADR-3 Scene Flow | Decisões Arquiteturais |
| **Workflow concluído** | SDC completo para epic 5 | Último Trabalho, Próximos Passos |
| **Task concluída** | Subtask de story completada | Último Trabalho |
| **Arquivo relevante criado/modificado** | Novo service, nova scene | Último Trabalho (arquivos) |
| **Testes adicionados** | 101 testes novos | Totais |
| **Push/merge realizado** | @devops faz push | Último Trabalho |
| **Sessão encerrando** | Usuário vai parar de trabalhar | TUDO (refresh completo) |

## Como Atualizar

### Atualização inline (PADRÃO — rápido, ~10 segundos)

A atualização inline é SEMPRE o método padrão. É rápida: abra o arquivo, edite 2-5 linhas, pronto.

Após a ação, atualize diretamente **apenas as seções que mudaram** de `docs/PROJECT-CHECKPOINT.md`:

- Story mudou status → atualizar tabela de stories + totais
- Arquivo criado → adicionar em "Último Trabalho"
- ADR tomada → adicionar em "Decisões Arquiteturais"

**NÃO reescreva o arquivo inteiro.** Edite apenas as linhas relevantes.

### Atualização completa via agente (MANUAL — quando solicitado pelo usuário)

Apenas quando o usuário pedir ou quando muitas coisas mudaram e o checkpoint parece desatualizado:
```
@checkpoint *update
```

**O `@checkpoint *update` NÃO é automático.** É um botão manual para refresh completo.

## Formato da Atualização

Ao atualizar "Último Trabalho Realizado", use este formato:

```markdown
### Sessão {data}

**Story X.Y — {título}** ({status}):
- {o que foi feito em 2-3 bullets}
- Arquivos: {lista dos arquivos criados/modificados}
- Testes: {X novos, Y total}
```

## Regras

1. **NÃO pule o checkpoint** — mesmo para mudanças "pequenas". Uma story Draft→InProgress é relevante.
2. **NÃO delegue ao usuário** — o agente que fez a ação atualiza o checkpoint.
3. **NÃO acumule** — atualize imediatamente após cada ação, não "depois".
4. **Mantenha conciso** — o checkpoint deve ser escaneável em 30 segundos.
5. **Seção "Último Trabalho"** tem no máximo as **3 sessões mais recentes**. Sessões antigas são removidas.

## Início de Sessão

No início de TODA sessão:
1. Ler `docs/PROJECT-CHECKPOINT.md`
2. Verificar se "Próximos Passos" ainda é válido
3. Se checkpoint parecer desatualizado, rodar `@checkpoint *verify`
