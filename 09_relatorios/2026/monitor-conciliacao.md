# Monitor de conciliacao JJL

> Gerado automaticamente. Itens sem vinculo sao **candidatos a revisao**, nao comprovacao de falha de processamento.

## Servicos
- erp-email-collector.service: Result=exit-code; ExecMainStatus=0
- erp-oc-ingestion.service: Result=exit-code; ExecMainStatus=1
- erp-supplier-ingestion.service: Result=success; ExecMainStatus=0
- erp-push-notifier.service: Result=success; ExecMainStatus=0

## Situacao da coleta
- BAIXADO: 4106
- DUPLICADO: 37737
- ERRO: 3
- INVALID_XML: 1

## OCs recebidas nos ultimos 7 dias sem vinculo por SHA256 (revisar PDF)

| email_id | arquivo | recebido | erro |
| --- | --- | --- | --- |
| Nenhum |  |  |  |

## Erros de coleta

| email_id | arquivo | status | erro |
| --- | --- | --- | --- |
| 41820 | image001.jpg | ERRO | <HttpError 403 when requesting https://gmail.googleapis.com/gmail/v1/users/me/messages/1a1ab9796a3e2 |
| 36876 | JJL- OC - 109152.PDF | ERRO | <HttpError 400 when requesting https://gmail.googleapis.com/gmail/v1/users/me/messages/1a18822d099e0 |
| 35312 | 5198928406403266534_NFe33260908969770000159550010054945381952145127.pdf | ERRO | <HttpError 403 when requesting https://gmail.googleapis.com/gmail/v1/users/me/messages/1a0cbda5a0165 |
| 869 | 33260517162778000108550010003361301260003366-nfe.xml | INVALID_XML | XML malformado: invalid token line 1 column 4193 |

## OCs registradas nos ultimos 7 dias

| OC | unidade | entrega | validacao |
| --- | --- | --- | --- |
| 110438 | BARRA | 2026-12-01 | PARSED_PDF |
| 110439 | BARRA | 2026-12-01 | PARSED_PDF |
| 110548 | CENTRO | 2026-12-01 | PARSED_PDF |
| 110555 | CENTRO | 2026-12-01 | PARSED_PDF |

## NFs registradas nos ultimos 7 dias

| NF | fornecedor | valor | tipo |
| --- | --- | --- | --- |
| 5625895 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 383.04 | DEVOLUCAO |
| 3688716 | JBS S/A | 859.56 | COMPRA |
| 10763882 | BRF S.A. | 294.94 | COMPRA |
| 5622868 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 383.04 | COMPRA |
| 356281 | CANTAGALO2012 COMERCIO DE CARNES LTDA  ME | 10197.60 | COMPRA |
| 2496912 | NUTRYMAX COMERCIO DE PRODUTOS ALIMENTICIOS LTDA | 660.30 | COMPRA |
| 3685753 | JBS S/A | 8011.25 | COMPRA |
| 5613595 | RIO QUALITY COMERCIO DE ALIMENTOS S/A | 1458.10 | COMPRA |
| 56071 | CASA FLORA LTDA | 706.27 | COMPRA |
| 355424 | CANTAGALO2012 COMERCIO DE CARNES LTDA  ME | 1034.15 | COMPRA |
| 2483071 | NUTRYMAX COMERCIO DE PRODUTOS ALIMENTICIOS LTDA | 452.76 | COMPRA |

## Limitacoes
- NFs XML sem vinculo direto nao sao automaticamente erros: podem ser XMLs de terceiros, duplicatas ou devolucoes.
- A verificacao nao altera pedidos, notas ou contas a pagar.
- Conferir Gmail e PostgreSQL para qualquer excecao antes de corrigir dados.
