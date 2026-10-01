# Notas fiscais de venda da JJL

Lote recebido em 27/09/2026: 191 XMLs de NF-e emitidas entre 02/06/2026 e 25/09/2026. Emitente em todos os arquivos: JJL Distribuidora de Alimentos Ltda.

## Consultas rápidas
- `notas.csv`: uma linha por NF-e, com chave, número, data, destinatário, endereço, valores, protocolo e status SEFAZ.
- `itens.csv`: itens das NF-e; relacione pela chave de acesso.
- `faturamento_mensal.csv`: camada analítica mensal por Senac Barra, Senac Centro, SESC, Outros, canceladas e faturamento válido.
- `xml-AAAA-MM.zip`: XMLs originais separados pelo mês da emissão; o campo `xml` dos CSVs aponta para o caminho lógico do original.

## Arquitetura aprovada
1. Gmail/fontes fiscais ficam na camada de **coleta**.
2. Cada nova NF-e/evento deve ser preservada em `YYYY/MM/`, preferencialmente com XML/original e JSON estruturado.
3. `scripts/consolidar_nfs_venda.py` faz a **consolidação**, deduplicando por chave e sem apagar histórico.
4. Consultas de faturamento, margem, contas a receber e Simples devem priorizar a base consolidada no GitHub, evitando reler Gmail.

## Regras fiscais
- A chave de acesso é o identificador de deduplicação.
- Evento/status posterior atualiza a situação da mesma chave sem excluir o histórico.
- `status_sefaz/cStat=101` permanece registrado e é excluído do faturamento.
- Para vendas/faturamento, considerar documentos autorizados (`100`) e excluir devoluções/ajustes conforme natureza/finalidade.
- Senac Barra, Senac Centro e SESC são classificados por CNPJ/endereço, não apenas pelo nome do cliente.
- O consolidador possui proteção para impedir que uma execução reduza acidentalmente o número de registros existentes.

## Formato recomendado para novas coletas
Além do XML/original, gravar JSON estruturado no diretório mensal, por exemplo `2026/10/nfe-3103.json`, com os campos fiscais da nota e uma lista `itens`. Isso permite consolidação determinística sem depender de parsing de PDF ou Markdown.

## Execução
```bash
python3 scripts/consolidar_nfs_venda.py
```
Executar após a coleta e antes de consultas analíticas que dependam das NF-e recém-chegadas.

**Atenção:** o status registrado em um XML pode ser alterado por evento fiscal posterior; os coletores devem buscar cancelamentos/substituições e registrá-los sem apagar o documento original.
