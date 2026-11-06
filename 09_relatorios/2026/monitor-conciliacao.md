# Monitor de conciliacao JJL

> Gerado automaticamente. Itens sem vinculo sao **candidatos a revisao**, nao comprovacao de falha de processamento.

## Servicos
- erp-email-collector.service: Result=exit-code; ExecMainStatus=1
- erp-oc-ingestion.service: Result=success; ExecMainStatus=0
- erp-supplier-ingestion.service: Result=success; ExecMainStatus=0
- erp-push-notifier.service: Result=success; ExecMainStatus=0

## Situacao da coleta
- BAIXADO: 4021
- DUPLICADO: 37680
- ERRO: 2
- INVALID_XML: 1

## OCs recebidas nos ultimos 7 dias sem vinculo por SHA256 (revisar PDF)

| email_id | arquivo | recebido | erro |
| --- | --- | --- | --- |
| Nenhum |  |  |  |

## Erros de coleta

| email_id | arquivo | status | erro |
| --- | --- | --- | --- |
| 36876 | JJL- OC - 109152.PDF | ERRO | <HttpError 400 when requesting https://gmail.googleapis.com/gmail/v1/users/me/messages/1a18822d099e0 |
| 35312 | 5198928406403266534_NFe33260908969770000159550010054945381952145127.pdf | ERRO | <HttpError 403 when requesting https://gmail.googleapis.com/gmail/v1/users/me/messages/1a0cbda5a0165 |
| 869 | 33260517162778000108550010003361301260003366-nfe.xml | INVALID_XML | XML malformado: invalid token line 1 column 4193 |

## OCs registradas nos ultimos 7 dias

| OC | unidade | entrega | validacao |
| --- | --- | --- | --- |
| 109389 | CENTRO | 2026-11-10 | PARSED_PDF |
| PROV-BARRA-20261110 | BARRA | 2026-11-10 | PENDING |
| 109201 | CENTRO | 2026-11-04 | PARSED_PDF |

## NFs registradas nos ultimos 7 dias

| NF | fornecedor | valor | tipo |
| --- | --- | --- | --- |
| Nenhum |  |  |  |

## Limitacoes
- NFs XML sem vinculo direto nao sao automaticamente erros: podem ser XMLs de terceiros, duplicatas ou devolucoes.
- A verificacao nao altera pedidos, notas ou contas a pagar.
- Conferir Gmail e PostgreSQL para qualquer excecao antes de corrigir dados.
