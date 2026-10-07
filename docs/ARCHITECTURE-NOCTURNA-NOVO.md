# Nocturna Novo — arquitetura de referência

Esta branch (nocturna-novo) é a preparação do segundo Nocturna. A conexão GitHub desta sessão não expõe a criação de repositórios, então o conteúdo foi mantido isolado sem alterar main.

## Camadas
- Publicação: index.html, shells de rotas e páginas estáticas.
- Dados editoriais: data/publications/, data/series/, data/comments/.
- Taxonomia: categorias/ e rotas de tags geradas pelo acervo.
- Apresentação: dark-romanticism.css e dark-romanticism.js.
- Interação: busca, favoritos, leitura, progresso, navegação de séries e painel neural existente.
- Pensadores: comentarios/, com projeção canônica da genealogia.
- Automação: scripts/ e workflows em .github/workflows/.
- Deploy: GitHub Pages + Worker opcional em index.js/Wrangler.
- SEO/publicação: sitemap.mjs, sitemap.xml, robots.txt, llms.txt, manifest e social card.

## Fonte de verdade
O README atual declara index.html:DATA como fonte editorial canônica. Os JSON/SVG históricos da raiz são preservados como recursos legados/editoriais e não devem virar uma segunda fonte de verdade.

## Comentários
A árvore canônica é data/comments/issue-1.json. A raiz histórica é Johan Liebert; cada nó conserva identidade, autoria, conteúdo, origem e arestas pai/filho. Os validadores rejeitam duplicidade, pai inexistente, auto-pai, ciclos e profundidade inconsistente.
