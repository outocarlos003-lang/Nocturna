# Fluxo de inserção editorial: primeira solicitação até validação

Este procedimento complementa `.github/copilot-instructions.md` e usa exclusivamente o modelo de dados editorial já adotado em `index.html`.

## Estrutura canônica
`DATA.series[] → blocks[] → chapters[]`

Cada coleção deve ter `id`, `slug`, `title`, um ou mais blocos e os metadados compatíveis com as coleções existentes. Cada bloco deve ter `id`, `slug`, `title` e um ou mais capítulos. Cada capítulo deve ter `id`, `slug`, `title` e conteúdo integral não vazio. Categorias referenciadas devem existir em `DATA.cats`.

## Checklist de conclusão
- [ ] Todo o conteúdo fornecido no pedido foi transcrito integralmente.
- [ ] A nova coleção foi inserida em `DATA.series` (não apenas no contador ou numa lista visual).
- [ ] A coleção, os blocos e os capítulos seguem o modelo existente.
- [ ] IDs e slugs são únicos e válidos.
- [ ] Categorias, tags e imagens referenciadas são válidas.
- [ ] Contadores, navegação, pesquisa, rotas e sitemap derivam dos dados atualizados.
- [ ] Não houve duplicação nem alteração acidental de obras existentes.
- [ ] Todos os validadores passaram; qualquer etapa não executada está explicitamente identificada.

## Validação local
```sh
node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/
node validate.mjs
node scripts/validate-comments.mjs
node scripts/validate-system.mjs
node scripts/validate-assets.mjs
```

O workflow `.github/workflows/nocturna-validation.yml` também executa verificações em pushes e pull requests. Uma inserção só deve ser declarada concluída depois de os dados estarem atualizados e as verificações aplicáveis passarem. As instruções orientam agentes e contribuidores, mas não substituem a validação nem garantem que o site publicado já atualizou antes do deploy.
