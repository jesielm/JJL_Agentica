# Auditoria de sincronização — 31/10/2026

Este documento registra **pendências de sincronização**, com base nos relatórios operacionais de 30 e 31/10/2026. **Não substitui os PDFs/XMLs originais nem comprova a existência de registros no banco de dados.**

## Documentos informados como registrados no ERP, ainda a conciliar com o GitHub

### Ordens de compra

| OC | Unidade | Valor (R$) | Entrega prevista |
| --- | --- | ---: | --- |
| 109090 | Senac Downtown — Centro | 1.873,60 | 03/11/2026 |
| 109152 | Senac Barra | 15.832,20 | 04/11/2026 |
| 109169 | Senac Barra | 14.470,17 | 04/11/2026 |
| 109179 | Senac Downtown — Centro | 4.193,33 | 03/11/2026 |
| 109201 | Senac Downtown — Centro | 2.178,00 | 04/11/2026 |

Os relatórios indicam que esses pedidos foram registrados no ERP. **Não incluir como documento fiscal ou OC original até recuperar e validar os arquivos-fonte.**

### NFs de fornecedores citadas nos relatórios

| NF | Fornecedor | Valor (R$) | Observação |
| --- | --- | ---: | --- |
| 2450456 | Nutrymax | 850,82 | Verificar vínculo em contas a pagar |
| 352315 | Cantagalo | 12.594,40 | Parcela com diferença de R$ 1,60 |
| 3670938 | JBS | 1.217,73 | Verificar vínculo em contas a pagar |
| 5573544 | Rio Quality | 1.835,98 | Verificar vínculo em contas a pagar |

## Pendências de engenharia

- Corrigir `erp-push-notifier.service`: relatório aponta imagem `erp-agentico:0.23` indisponível e erro 125.
- Auditar cobertura de backlog Gmail após 10/10/2026.
- Conciliar parcelas extraídas com `finance.payables`, com deduplicação por chave de acesso.
- Verificar OC 108978, não localizada nos relatórios recentes.
- Validar documentos sanitários do veículo e situação da licença da empresa antes de entregas refrigeradas.

## Critérios para conclusão

1. Conferir arquivos originais (PDF/XML) com Gmail/VPS.
2. Verificar registros e chaves no PostgreSQL, sem duplicar lançamentos.
3. Versionar somente arquivos permitidos pela política de dados da JJL; evitar dados sensíveis, tokens e credenciais.
4. Atualizar esta auditoria com evidências de conciliação e links para commits posteriores.

**Estado:** auditoria documental, não sincronização dos arquivos originais.
