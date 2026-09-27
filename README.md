# JJL Agêntica

Base persistente de conhecimento operacional da JJL Distribuidora.

## Objetivo
Centralizar dados estruturados provenientes de OCs, notas fiscais, e-mails, entregas, fornecedores e financeiro, mantendo rastreabilidade até a fonte original.

## Estrutura
- `01_clientes/` — informações por cliente/unidade.
- `02_ordens_compra/` — OCs recebidas e índice estruturado.
- `03_notas_fiscais_venda/` — dados de faturamento.
- `04_notas_fiscais_compra/` — histórico de compras.
- `05_fornecedores/` — fornecedores, produtos e preços históricos.
- `06_produtos/` — visão consolidada por produto.
- `07_entregas_pendencias/` — faltas, entregas e regularizações.
- `08_financeiro/` — contas a pagar/receber, DDA e conciliação.
- `09_relatorios/` — relatórios operacionais e gerenciais.
- `10_governanca/` — regras, agentes e rastreabilidade.

## Regra principal
Dados extraídos de e-mail/PDF/NF devem registrar fonte, data de coleta e nível de confirmação. Não substituir fatos documentais por inferências.
