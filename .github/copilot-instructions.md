# Instruções para alterações editoriais da Nocturna

Ao receber um pedido de inserção editorial, execute a tarefa de ponta a ponta na mesma solicitação. Não peça confirmação sobre decisões que possam ser inferidas com segurança do modelo existente.

## Regra crítica: o pedido atual é a fonte do conteúdo

1. Leia a mensagem atual do solicitante integralmente antes de concluir que algum texto, capítulo, título ou metadado está ausente. Nunca afirme que o usuário não forneceu um conteúdo sem conferir toda a mensagem atual.
2. Não confunda ausência de um capítulo no repositório com ausência do capítulo no pedido. O repositório mostra o estado anterior; a mensagem atual determina o que foi solicitado agora.
3. Quando houver um texto integral na mensagem, trate-o como fonte soberana. Extraia e confira o início, o fim, os títulos, as referências, os parágrafos e a sequência antes de editar os dados.
4. Não use semelhança com séries, capítulos ou posts existentes como motivo para ignorar a nova solicitação. Verifique duplicação real e, se o pedido for uma nova coleção, crie uma entidade nova com IDs e slugs exclusivos, preservando os registros preexistentes.
5. Não declare integridade textual apenas porque um registro existe, porque o build passou ou porque alguns trechos coincidem. Compare o conteúdo gravado com o texto recebido integralmente. Se não for possível obter a mensagem-fonte completa ou fazer a comparação, declare essa limitação e não afirme que a fidelidade foi verificada.
6. Não declare publicação concluída sem verificar o commit, as rotas geradas, os recursos associados e o resultado efetivo do build/deploy. Separe claramente validação do repositório, execução do deploy e inspeção visual do site.

## Procedimento obrigatório
1. Leia `index.html`, localize `/*DATA*/const DATA=` e `/*END DATA*/`, e examine coleções, blocos, capítulos, publicações, categorias, imagens e tags já existentes.
2. Leia integralmente o pedido atual e monte um inventário dos elementos fornecidos: título global, subtítulos, blocos, capítulos, conteúdo integral, referências, sequência e instruções de mídia. Só marque um elemento como ausente depois de verificar o pedido inteiro.
3. Use a estrutura e os campos de uma coleção existente como modelo. Preserve a ordem e o estilo editorial do repositório; não invente um segundo formato.
4. Transcreva integralmente todos os títulos, subtítulos, referências bíblicas, descrições e capítulos fornecidos pelo solicitante. Não reduza, parafraseie, omita, complete nem substitua conteúdo fornecido. Metadados e resumos ficam em seus próprios campos, nunca dentro do corpo original, salvo se já fizerem parte dele.
5. Crie IDs e slugs únicos, associe categorias existentes e mantenha a ordem editorial solicitada. Se o pedido disser que uma obra inicia uma nova coleção, acrescente uma entrada em `DATA.series`; não altere nem duplique uma coleção existente para simular a inserção.
6. Para cada capítulo, confira a correspondência integral entre fonte e destino. Registre internamente verificações de início, fim, títulos, quantidade de parágrafos e igualdade exata do conteúdo quando a fonte estiver disponível. Não use verificações parciais como substituto da comparação integral.
7. Atualize os dados reais que alimentam a interface. Não corrija apenas o contador visível. Não altere o total de publicações, salvo quando uma publicação nova for realmente criada.
8. Execute `node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/`, `node validate.mjs`, `node scripts/validate-comments.mjs`, `node scripts/validate-system.mjs` e `node scripts/validate-assets.mjs` quando o ambiente permitir. Corrija falhas antes de concluir.
9. Verifique a diferença final: todos os itens pedidos devem existir nos dados, sem duplicações indevidas; a coleção deve estar navegável e pesquisável; imagens e rotas devem apontar para arquivos existentes; e o texto deve corresponder integralmente à fonte.
10. Confirme o commit e o estado do workflow de publicação. Não confunda commit criado, workflow iniciado, workflow aprovado, deploy concluído e site inspecionado: são estados diferentes.

## Regra de comunicação
Evite perguntas de esclarecimento desnecessárias. Só interrompa para perguntar quando houver ambiguidade real que não possa ser resolvida pela estrutura existente ou quando faltar o próprio conteúdo que o usuário espera que seja publicado. Nunca invente capítulos ou conteúdo ausente. Se cometer um erro de leitura, reconheça-o claramente, corrija a causa no processo e não transfira ao solicitante a responsabilidade por um texto que estava presente.
