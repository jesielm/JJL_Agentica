# Regras funcionais — Lista de Compras Compartilhada (10/10/2026)

## Colunas
Primeira coluna: **Comprado** (checkbox compartilhado).
Segunda coluna: **Fornecedor sugerido** (indicação editável, não obrigação).
Demais: Produto, quantidade consolidada, Senac Barra, Senac Centro, unidade, situação, comprado por, comprado em.

## Compra compartilhada
Cada item de compra deve ter checkbox persistido no backend, sincronizado em tempo real ou por atualização periódica em todos os celulares. Marcar como comprado exige registro atômico com usuário e horário; evitar marcação duplicada e informar ao segundo comprador que já foi comprado. Permitir desfazer com auditoria. Itens novos começam pendentes. Não considerar checkbox local/browser como solução definitiva.

## Sugestão de fornecedor
Calcular fornecedor habitual pela **frequência de compras históricas comprovadas por produto normalizado** (contagem de NFs/pedidos distintos, não pelo fornecedor da compra mais recente). Empate: maior quantidade adquirida, depois recência. Exibir como sugestão editável; não confundir fornecedor de venda JJL com fornecedor de compra.

Sem histórico consistente:
- Farinhas e castanhas: Cadeg.
- Azeite: Mundial / Assaí.
- Outros: Mundial / Assaí.

## Atenção Polico / Royal Nuts
Produtos da Polico exigem cruzamento com estoque estimado, últimas entradas, vendas e pedidos abertos antes de recomendar reposição. Não presumir que todo item de frutas secas/temperos é da Polico; priorizar histórico confirmado e sinalizar divergências. Separar embalagem Royal Nuts de compra original Polico e evitar dupla contagem.

## Aceite
Dois compradores logados visualizam a mesma lista; quando um marca comprado, o outro vê a alteração e não compra novamente. A lista pode ser filtrada por pendentes e agrupada por fornecedor, sem perder quantidades por unidade.
