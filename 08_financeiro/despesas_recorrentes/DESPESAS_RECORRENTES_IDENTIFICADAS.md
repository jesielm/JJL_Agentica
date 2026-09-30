# JJL — Despesas recorrentes identificadas

Atualizado em: 30/09/2026

## Objetivo
Cadastro de padrões recorrentes observados nos extratos bancários da JJL. Este arquivo serve como regra de classificação para conciliação e fluxo de caixa. Fornecedores de mercadoria e DDAs/NFs de compra ficam no contas a pagar e não são tratados aqui como despesa fixa recorrente.

## Regras confirmadas pelo usuário

| Beneficiário / padrão | Categoria | Regra de classificação | Recorrência / valor conhecido | Status |
|---|---|---|---|---|
| ACAC Contabilidade | Contabilidade | Despesa administrativa recorrente | R$ 810,50 por lançamento; foram identificados 3 pagamentos mensais | CONFIRMADO |
| Érico | Entregas / logística | Todo PIX para Érico é custo de entrega | Valor variável | CONFIRMADO |
| Luiz | Entregas / logística | Todo PIX para Luiz é custo de entrega | Valor variável | CONFIRMADO |
| Wanderson | Entregas / logística | Todo PIX para Wanderson é custo de entrega | Valor variável | CONFIRMADO |
| Matheus | Entregas / compras | PIX exatamente de R$ 120,00 = entrega; outros valores = compras, sujeitos à conciliação | R$ 120,00 por entrega | CONFIRMADO |
| Tarifas PIX / tarifas bancárias | Despesas bancárias | Classificar tarifas cobradas pelo banco como despesa financeira/bancária | Valor variável | CONFIRMADO |
| Juros / IOF / juros de limite | Despesas financeiras | Classificar separadamente de compras e operação | Valor variável | CONFIRMADO |
| Parcelas de empréstimos | Financiamento | Classificar como serviço da dívida; valores podem variar por mês | Valor variável | CONFIRMADO |
| Plaza Stop / Global Parking | Estacionamento | Despesa operacional eventual ligada às compras/CADEG; não projetar como fixa mensal sem nova evidência | Valores variáveis | CONFIRMADO COMO EVENTUAL |
| LA Autopeças | Veículo | Manutenção/custo eventual de veículo; não projetar como fixa mensal | Valor variável | CONFIRMADO COMO EVENTUAL |
| Orla / Aorla | Fornecedor / compra de mercadoria | Pagamento de fornecedor não recorrente; não projetar como despesa recorrente. Considerar somente quando houver compra/pagamento concreto | Valor variável | CONFIRMADO NÃO RECORRENTE |
| Royal Nuts / C6 entre contas próprias | Transferência interna | Não considerar despesa quando comprovadamente transferência entre contas do mesmo grupo/empresa | Valor variável | CONFIRMADO |

## Padrões observados que precisam de validação antes de virarem regra de projeção

- Impressão: houve lançamento identificado como impressão, mas não há evidência suficiente para assumir periodicidade mensal fixa.
- Frete/logística genérico: há custos além dos entregadores nominados, porém cada beneficiário deve ser identificado antes de automatizar a classificação.

## Regras de uso no fluxo de caixa

1. Só projetar automaticamente despesas recorrentes quando a periodicidade estiver confirmada.
2. Despesas eventuais e fornecedores não recorrentes entram apenas quando houver lançamento/obrigação concreta.
3. Transferências internas não entram como despesa operacional.
4. Compras de fornecedores devem ser controladas por NF de compra + duplicata/vencimento + DDA + extrato, evitando dupla contagem.
5. Lançamentos desconhecidos permanecem como `PENDENTE_CLASSIFICACAO` até confirmação do usuário.
