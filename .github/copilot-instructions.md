# Instruções para alterações editoriais da Nocturna

Ao receber um pedido de inserção editorial, execute a tarefa de ponta a ponta na mesma solicitação. Não peça confirmação sobre decisões que possam ser inferidas com segurança do modelo existente.

## Procedimento obrigatório
1. Leia `index.html`, localize `/*DATA*/const DATA=` e `/*END DATA*/`, e examine coleções, blocos, capítulos, publicações, categorias, imagens e tags já existentes.
2. Use a estrutura e os campos de uma coleção existente como modelo. Preserve a ordem e o estilo editorial do repositório; não invente um segundo formato.
3. Transcreva integralmente todos os títulos, subtítulos, referências bíblicas, descrições e capítulos fornecidos pelo solicitante. Não reduza, parafraseie, omita nem substitua conteúdo fornecido.
4. Crie IDs e slugs únicos, associe categorias existentes e mantenha a ordem editorial solicitada. Se o pedido disser que uma obra inicia uma nova coleção, acrescente uma entrada em `DATA.series`; não altere nem duplique uma coleção existente para simular a inserção.
5. Atualize os dados reais que alimentam a interface. Não corrija apenas o contador visível. Não altere o total de publicações, salvo quando uma publicação nova for realmente criada.
6. Execute `node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/`, `node validate.mjs`, `node scripts/validate-comments.mjs`, `node scripts/validate-system.mjs` e `node scripts/validate-assets.mjs` quando o ambiente permitir. Corrija falhas antes de concluir.
7. Verifique a diferença final: todos os itens pedidos devem existir nos dados, sem duplicações, e a coleção deve estar navegável e pesquisável conforme a arquitetura existente.
8. Entregue a alteração integralmente. Se não puder aplicar ou verificar algum passo, declare precisamente o bloqueio e não afirme que está concluído.

## Regra de comunicação
Evite perguntas de esclarecimento desnecessárias. Só interrompa para perguntar quando houver ambiguidade real que não possa ser resolvida pela estrutura existente ou quando faltar o próprio conteúdo que o usuário espera que seja publicado. Nunca invente capítulos ou conteúdo ausente.
