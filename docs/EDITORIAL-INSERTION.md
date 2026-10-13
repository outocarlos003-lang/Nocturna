# Fluxo de inserção editorial: primeira solicitação até validação

Este procedimento usa o modelo canônico já adotado pela Nocturna. A primeira decisão é operacional: identificar o destino correto e editar a fonte de verdade. Issue não é inserção, não altera o acervo e não é pré-requisito para publicar.

## Roteamento por tipo de conteúdo

- **Publicação individual do acervo:** criar `editorial/posts/<slug>.md` com os campos obrigatórios de front matter e o texto integral; executar `node scripts/sync-editorial.mjs` para sincronizar os dados em `DATA.pubs` no `index.html`.
- **Coleção, bloco ou capítulo estruturado:** editar `DATA.series[] → blocks[] → chapters[]` em `index.html`, seguindo `EDITORIAL_RULES.md`.
- **Issue/PR:** issue serve somente para acompanhamento opcional. Nunca substitua a alteração editorial por issue. PR pode ser usado para revisão do diff, mas deve conter a alteração real.

## Regra uniforme de duplicatas: 90%

Antes de gravar, compare o texto integral proposto com o acervo, incluindo publicações, coleções agregadas e capítulos individualmente. Normalize caixa, acentos, pontuação e espaços para comparação e use similaridade por distância de edição de caracteres:

`similaridade = 1 - (distância de Levenshtein / comprimento do maior texto normalizado)`

- **>= 90%:** classificar como duplicata e bloquear a nova inserção.
- **< 90%:** não bloquear por duplicidade. Semelhança temática, título semelhante ou personagens em comum não são suficientes.
- Para uma coleção, compare tanto o texto agregado de todos os capítulos quanto cada capítulo contra o acervo completo.
- Não compare somente trechos, títulos ou resumos. Se o texto-fonte integral não estiver disponível, declare a limitação e não alegue que a comparação foi feita.

Executar `node scripts/check-editorial-duplicate.mjs caminho/solicitacao.json` antes da mutação. O JSON deve conter `item.content` ou `item.sourceText`; coleções podem usar `item.blocks[].chapters[].content`.

## Estrutura canônica

`DATA.series[] → blocks[] → chapters[]`

Cada coleção deve ter `id`, `slug`, `title`, um ou mais blocos e metadados compatíveis com as coleções existentes. Cada bloco deve ter `id`, `slug`, `title` e um ou mais capítulos. Cada capítulo deve ter `id`, `slug`, `title` e conteúdo integral não vazio. Categorias referenciadas devem existir em `DATA.cats`.

## Checklist de conclusão

- [ ] A publicação foi roteada para a fonte correta: post individual ou coleção estruturada.
- [ ] O conteúdo fornecido foi transcrito integralmente.
- [ ] A comparação integral de duplicatas foi executada com limiar fixo de 90%.
- [ ] Uma correspondência >=90% foi bloqueada; valores abaixo de 90% não foram bloqueados por duplicidade.
- [ ] A publicação individual foi sincronizada em `DATA.pubs`, ou a coleção foi integrada em `DATA.series`.
- [ ] IDs, slugs, categorias, tags, imagens, rotas e contadores são válidos.
- [ ] Não houve perda ou alteração acidental de conteúdo existente.
- [ ] Os validadores aplicáveis passaram; etapas não executadas estão explicitamente identificadas.
- [ ] Commit, workflow, deploy e inspeção pública foram reportados como estados separados.

## Validação

```sh
node scripts/check-editorial-duplicate.mjs caminho/solicitacao.json
node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/
node validate.mjs
node scripts/validate-editorial-continuity.mjs
node scripts/validate-comments.mjs
node scripts/validate-system.mjs
node scripts/validate-assets.mjs
```

O workflow `.github/workflows/nocturna-validation.yml` executa verificações em pushes e pull requests. Instruções e testes automatizados orientam o processo, mas não substituem evidência do diff, do deploy e da publicação efetiva.
