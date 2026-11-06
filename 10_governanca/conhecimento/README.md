# Conhecimento operacional JJL

Fonte estruturada: PostgreSQL knowledge.operational_facts.

Regras: manter origem e historico; nao associar produtos ambiguos automaticamente; preservar OC, NF e embalagem; Cadeg fallback; sem bloqueio de estoque nesta fase.

## Captura automatica de notas fiscais (2026-11-06)
- Trigger PostgreSQL: knowledge.capture_supplier_invoice_item() em finance.supplier_invoice_items, AFTER INSERT OR UPDATE.
- Cada item gera observacao com fornecedor, chave NF-e, descricao, codigo, unidade, quantidade e precos.
- Backfill inicial: 1605 itens de NFs existentes. Observacoes ficam OBSERVED, sem vinculo automatico com produtos vendidos.
- Proximo passo: workflow de revisao e confirmacao das associacoes; manter preferencias humanas separadas.
