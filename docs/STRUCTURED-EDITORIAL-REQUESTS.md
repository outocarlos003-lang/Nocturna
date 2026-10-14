# Validação de solicitações editoriais estruturadas

O script `scripts/validate-editorial-request.mjs` verifica um JSON antes que uma alteração editorial seja preparada. Ele não modifica `index.html`, não publica conteúdo e não cria commits.

## Uso

```sh
node scripts/validate-editorial-request.mjs caminho/solicitacao.json
```

O JSON deve conter `operation` e `item`. Operações aceitas:

- `add-series`: `item` representa uma coleção completa, incluindo `date`, `blocks`, capítulos e categorias válidas.
- `add-block`: exige `parentSeriesId`; `item` representa um bloco com pelo menos um capítulo completo.
- `add-chapter`: exige `parentSeriesId` e `parentBlockId`; `item` representa um capítulo com `content` integral.

Cada item precisa de `id`, `slug`, `title`, `summary` e `cats`. IDs e slugs aceitam apenas letras minúsculas sem acentos, números e hífens. Categorias devem existir em `DATA.cats` no `index.html`.

Exemplo mínimo da estrutura de uma solicitação de capítulo:

```json
{
  "operation": "add-chapter",
  "parentSeriesId": "id-da-colecao",
  "parentBlockId": "id-do-bloco",
  "item": {
    "id": "capitulo-novo",
    "slug": "capitulo-novo",
    "title": "Capítulo novo",
    "summary": "Resumo do capítulo.",
    "content": "Texto integral do capítulo.",
    "cats": ["cat-teologia"]
  }
}
```

A validação local é uma pré-verificação. Antes da integração, a proposta ainda deve ser comparada ao modelo editorial existente e passar pelos validadores do repositório. Não há publicação automática.
