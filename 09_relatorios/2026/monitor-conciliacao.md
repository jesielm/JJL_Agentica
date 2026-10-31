# Monitor de conciliacao JJL

> Gerado automaticamente. Itens sem vinculo sao **candidatos a revisao**, nao comprovacao de falha de processamento.

## Servicos
- erp-email-collector.service: Result=success; ExecMainStatus=0
- erp-oc-ingestion.service: Result=success; ExecMainStatus=0
- erp-supplier-ingestion.service: Result=success; ExecMainStatus=0
- erp-push-notifier.service: Result=success; ExecMainStatus=0

## Situacao da coleta
- BAIXADO: 4021
- DUPLICADO: 37330
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
| 109201 | CENTRO | 2026-11-04 | PARSED_PDF |
| 108813 | CENTRO | 2026-10-26 | PARSED_PDF |
| 109179 | CENTRO | 2026-11-03 | PARSED_PDF |
| 109152 | BARRA | 2026-11-04 | PARSED_PDF |
| 109169 | BARRA | 2026-11-04 | PARSED_PDF |
| 109090 | CENTRO | 2026-11-03 | PARSED_PDF |
| 108974 | BARRA | 2026-10-27 | PARSED_PDF |

## NFs registradas nos ultimos 7 dias

| NF | fornecedor | valor | tipo |
| --- | --- | --- | --- |
| 5573544 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 1835.98 | COMPRA |
| 3670938 | JBS S/A | 1217.73 | COMPRA |
| 5548867 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 974.45 | COMPRA |
| 3663430 | JBS S/A | 6177.88 | COMPRA |
| 2435044 | NUTRYMAX COMERCIO DE PRODUTOS ALIMENTICIOS LTDA | 1068.44 | COMPRA |
| 2438572 | NUTRYMAX COMERCIO DE PRODUTOS ALIMENTICIOS LTDA | 1068.44 | COMPRA |
| 2436489 | NUTRYMAX COMERCIO DE PRODUTOS ALIMENTICIOS LTDA | 1068.44 | DEVOLUCAO |
| 352315 | CANTAGALO2012 COMERCIO DE CARNES LTDA  ME | 12594.40 | COMPRA |
| 2450456 | NUTRYMAX COMERCIO DE PRODUTOS ALIMENTICIOS LTDA | 850.82 | COMPRA |
| 5564723 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 123.75 | DEVOLUCAO |
| 353374 | CANTAGALO2012 COMERCIO DE CARNES LTDA  ME | 3001.00 | COMPRA |
| 353373 | CANTAGALO2012 COMERCIO DE CARNES LTDA  ME | 12738.40 | COMPRA |
| 353280 | CANTAGALO2012 COMERCIO DE CARNES LTDA  ME | 1501.30 | COMPRA |
| 10689984 | BRF S.A. | 3304.17 | COMPRA |
| 5560795 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 830.24 | COMPRA |
| 3667021 | JBS S/A | 7538.54 | COMPRA |

## Limitacoes
- NFs XML sem vinculo direto nao sao automaticamente erros: podem ser XMLs de terceiros, duplicatas ou devolucoes.
- A verificacao nao altera pedidos, notas ou contas a pagar.
- Conferir Gmail e PostgreSQL para qualquer excecao antes de corrigir dados.
