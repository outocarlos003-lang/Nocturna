# Protocolo de comunicação editorial e operacional

Este documento reduz ruídos entre o solicitante e quem executa alterações no Nocturna. É uma regra prática de interpretação, não um formulário obrigatório: pedidos naturais e incompletos devem ser resolvidos usando o contexto confiável do projeto sempre que possível.

## Ruídos previsíveis e prevenção

| Possível ruído | Regra de interpretação |
|---|---|
| Título do capítulo confundido com título da coleção | O título da coleção explicitamente informado define o destino. Títulos de capítulo iguais em coleções diferentes não são conflito por si só. |
| Perda de contexto entre mensagens | Mantenha a coleção, o bloco e a tarefa ativos enquanto mensagens seguintes parecerem continuação. Só troque o contexto quando o solicitante indicar outra obra, outro destino ou encerramento. |
| Confusão entre texto-fonte e estado do repositório | A mensagem atual é a fonte do novo conteúdo; o repositório é o estado anterior. Leia a mensagem inteira antes de dizer que falta texto. |
| Reenvio de capítulo já registrado | Compare o conteúdo integral e os metadados na coleção-alvo. Se já estiver correto, não duplique; explique o que foi verificado e o que ainda falta. |
| Pedido de “terminar”, “publicar” ou “corrigir” com escopo amplo | Interprete como concluir a tarefa até onde as ferramentas permitem: editar, validar, verificar rotas e assets, conferir workflows/deploy e reportar separadamente cada estado. Não trate commit como deploy. |
| Referências, subtítulos ou metadados incorporados ao corpo | Preserve os campos separados segundo o modelo existente. Não mova texto editorial para outro campo nem o reescreva sem instrução. |
| Numeração ou sequência ambígua | Use coleção e bloco ativos, capítulos vizinhos, IDs, slugs e referências. Pergunte apenas se ainda houver mais de um destino plausível. |
| “Igual ao anterior” ou “continue” | Reutilize o padrão estrutural mais recente e confiável, mas não copie conteúdo autoral antigo para substituir o texto novo. |
| Correção de um erro anterior | Corrija tanto o dado quanto a regra/processo que causou o erro, quando apropriado. Reconheça limitações de verificação com clareza. |
| “Pronto” interpretado como garantia de publicação pública | Informe em separado: alteração gravada, validações executadas, workflow aprovado, deploy concluído e inspeção visual. Só afirme cada estado após verificá-lo. |

## Como interpretar pedidos naturais

- **“Adicione este capítulo”**: procure primeiro a coleção e o bloco explicitamente nomeados ou já ativos; confira duplicação real dentro desse destino; preserve o texto integral; atualize dados, rotas e recursos necessários.
- **“Continue” / “próximo capítulo”**: continue na coleção e no bloco ativos, mantendo a sequência. Não crie coleção nova por inferência baseada apenas no número ou título.
- **“Corrija”**: identifique o defeito específico pelo contexto; minimize mudanças colaterais e compare o diff antes de concluir.
- **“Publique” / “termine de uma vez”**: execute as etapas de edição e verificação que estiverem disponíveis. Se alguma etapa depender de ambiente ou permissão indisponível, diga exatamente qual etapa ficou pendente, sem mascará-la como concluída.
- **“Faça do jeito habitual”**: siga os arquivos de instruções, regras editoriais e padrões reais do repositório; não invente convenções.
- **Pedido que contém texto completo**: trate o texto fornecido como fonte autoritativa. Não peça que o usuário o envie novamente se já estiver na mensagem atual.

## Contexto persistente da tarefa

Ao longo de uma sequência editorial, acompanhe estes elementos como contexto de trabalho:
1. Coleção-alvo (título exato).
2. Bloco/seção-alvo (título exato).
3. Capítulo ou artefato atual (número e título).
4. Operação pretendida (criar, continuar, corrigir, reorganizar, validar ou publicar).
5. Fonte autoritativa (mensagem atual, arquivo fornecido ou registro existente, conforme o pedido).
6. Estado final verificado e pendências reais.

Uma instrução explícita mais recente substitui apenas a dimensão que ela altera. Por exemplo, mudar o título do capítulo não muda automaticamente a coleção; indicar nova coleção muda o destino, mas não autoriza alterar o conteúdo.

## Padrão de execução e relato

1. Interpretar o pedido inteiro e extrair destino, conteúdo e restrições.
2. Consultar os dados canônicos e localizar registros/arquivos relacionados.
3. Resolver a ambiguidade por contexto e evidência; fazer uma pergunta somente quando a escolha não puder ser feita com segurança.
4. Fazer a menor alteração coerente com o pedido, sem duplicar registros.
5. Comparar o conteúdo final com a fonte completa, quando disponível.
6. Executar validadores, verificar rotas, sitemap e assets quando o ambiente permitir.
7. Conferir diff, commit e estado do workflow/deploy.
8. Responder com: o que mudou; onde; quais verificações passaram; o que não pôde ser verificado. Nunca declarar uma etapa como concluída por inferência.

## Modelo opcional de pedido

Não é necessário preencher todos os campos. Uma frase natural continua válida.

- **Destino:** coleção e bloco, se conhecidos.
- **Ação:** adicionar, continuar, corrigir, revisar ou publicar.
- **Material:** texto integral e metadados fornecidos.
- **Restrições:** o que preservar, substituir ou não duplicar.
- **Conclusão esperada:** apenas commit, ou também validação e confirmação de deploy.

Exemplo: “Continue na coleção [título], bloco [título]. Adicione o Capítulo IV com o texto abaixo, preservando integralmente o conteúdo e os registros existentes. Valide o site e confirme separadamente o commit e o deploy.”

## Regra de ouro

Não transfira ao solicitante o custo de resolver uma ambiguidade que o contexto do projeto já resolve. Não esconda uma ambiguidade real atrás de um palpite. Preserve o conteúdo, o contexto e a distinção entre feito, validado e publicado.
