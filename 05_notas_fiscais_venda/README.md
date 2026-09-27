# Notas fiscais de venda da JJL

Lote recebido em 27/09/2026: 191 XMLs de NF-e emitidas entre 02/06/2026 e 25/09/2026. Emitente em todos os arquivos: JJL Distribuidora de Alimentos Ltda.

## Consultas rápidas
- `notas.csv`: uma linha por NF-e, com chave, número, data, destinatário, endereço, valores, protocolo e status SEFAZ.
- `itens.csv`: 1.961 itens, com produto, quantidade, preço unitário e valor. Relacione pelo campo `chave`.
- `xml-AAAA-MM.zip`: XMLs originais separados pelo mês da emissão; o campo `xml` dos CSVs aponta para o caminho lógico `xml/AAAA-MM/nfe-NNNN.xml`, cujo arquivo está dentro do ZIP do mês.

**Atenção ao faturamento:** 115 notas têm `status_sefaz=100` (uso autorizado) e 76 têm `status_sefaz=101` (cancelamento homologado). Para vendas/faturamento, filtre `status_sefaz=100`, além de examinar `tipo`, `finalidade` e `natureza`. Notas de devolução e ajustes podem exigir tratamento separado. O status registrado é o que consta neste XML; eventos posteriores não incluídos no lote podem alterar a situação.

Valores e quantidades preservam a representação original da NF-e. Use a chave de acesso para deduplicar novos lotes. Não trate estes arquivos como todas as vendas da empresa fora do período coberto.
