# Nocturna

## Arquitetura operacional

A aplicação é um site estático servido pelo GitHub Pages, com uma camada opcional de resposta canônica executada pelo Cloudflare Worker definido em `index.js` e configurado por `wrangler.jsonc`.

A fonte editorial atual é o bloco `DATA` de `index.html`. Os arquivos JSON/SVG históricos na raiz são recursos editoriais e não devem ser tratados como uma segunda fonte de verdade sem integração explícita.

O fluxo de comentários é:

```text
GitHub Pages
  │
  ├── /comentarios/ → projeção data/comments/issue-1.json
  │
  └── POST → Cloudflare Worker (index.js)
                         │
                         └── GitHub API → Issue #1
                                              │
                                              └── nocturna-comments.yml
                                                   ├── bootstrap root
                                                   ├── dedupe
                                                   ├── validate
                                                   ├── normalize + genealogy
                                                   ├── validate
                                                   ├── publish genealogy
                                                   ├── verify live GitHub state
                                                   └── persist + deploy
```

O Worker nunca recebe token ou chave privada no navegador. `GITHUB_APP_ID` e `GITHUB_PRIVATE_KEY` são segredos do Worker.

## Genealogia canônica dos comentários

A conversa da Nocturna é uma árvore lógica sobre a fonte GitHub, não uma substituição dela.

- O comentário existente de **Johan Liebert** é a única raiz canônica.
- A raiz conserva `parentNodeId: null` e `depth: 0`.
- Cada descendente conserva seu `commentId`, conteúdo, autoria, origem e permalink, recebendo apenas metadados relacionais derivados.
- `parentNodeId` e `parentCommentId` formam a aresta pai → filho.
- `rootNodeId` e `rootCommentId` identificam a mesma origem em qualquer descendente.
- `depth` é a distância real até Johan, não uma propriedade visual.
- `branchNodeId` identifica o primeiro nó do ramo ao qual o comentário pertence; múltiplos ramos continuam compartilhando a mesma raiz.
- Ancestrais e descendentes não são duplicados no armazenamento: são consultas derivadas das arestas existentes.
- A relação pode existir na camada canônica mesmo quando o GitHub não forneceu uma relação nativa equivalente.
- A normalização é idempotente e só acrescenta ou reconcilia metadados relacionais; não reescreve o conteúdo editorial dos comentários.
- A validação rejeita raiz divergente, pai ausente, auto-pai, ciclos, profundidade incoerente, identidade duplicada e nós que não conseguem remontar à raiz.

Em termos de modelo:

```text
node = {
  commentId,
  parentCommentId,
  rootCommentId,
  parentNodeId,
  rootNodeId,
  branchNodeId,
  depth,
  ...metadados originais
}
```

Assim, a estrutura nativa do GitHub permanece a fonte dos comentários, enquanto a genealogia do Nocturna é uma camada topológica determinística sobre essa fonte.

## Deploy do Worker

Na raiz do repositório:

```bash
npx wrangler deploy
npx wrangler secret put GITHUB_APP_ID
npx wrangler secret put GITHUB_PRIVATE_KEY
```

Depois de publicar o Worker, coloque a URL pública em `comentarios/reply-api-config.js`.

O `ALLOWED_ORIGIN` do Worker é `https://outocarlos003-lang.github.io`; altere-o se o domínio público da aplicação mudar.

## Validação

Valide o acervo editorial:

```bash
node validate.mjs
```

Valide a árvore canônica:

```bash
node scripts/validate-comments.mjs
```

Valide as invariantes da genealogia com casos positivos e negativos:

```bash
node scripts/test-genealogy.mjs
```

Valide também a correspondência entre a projeção e os comentários vivos do Issue #1:

```bash
GITHUB_TOKEN=... node scripts/verify-github-genealogy.mjs
```

Gere as cascas de rota e o sitemap somente quando quiser atualizar a publicação estática:

```bash
node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/
```

## Comentários canônicos

- A Issue #1 é a autoridade histórica.
- A projeção canônica é `data/comments/issue-1.json`.
- A interface `comentarios/index.html` somente lê essa projeção e reconstrói a árvore.
- `site-comments-export.json` é preservado como evidência de migração histórica; não é consumidor da interface.
- Os IDs históricos 1..23 são preservados. O próximo ID canônico é 24.
- O comentário de Johan é o ponto zero, independentemente da ordem física em que os registros históricos aparecem no JSON.
- Cada descendente guarda `parentNodeId`, `parentCommentId`, `parentAuthor`, `depth`, `order`, autoria, conteúdo, origem e, após a reconciliação, a raiz e o ramo a que pertence.
- `scripts/validate-comments.mjs` rejeita duplicidade, pai ausente, auto-pai, ciclo, profundidade incoerente, origem divergente e lacunas de identidade.
- `scripts/normalize-comments.mjs` aceita somente o envelope `nocturna-reply:v1` produzido pelo mecanismo de resposta e por comentário de bot; a operação é idempotente pela identidade `source-id` e reconcilia a genealogia existente antes de incorporar novos nós.
- `scripts/publish-genealogy-to-github.mjs` materializa nós sem comentário real no Issue #1, usando `nocturna-node:v1` como identidade técnica idempotente e atualizando os permalinks reais na projeção.
- `scripts/verify-github-genealogy.mjs` faz a checagem inversa: cada nó não-raiz deve ter exatamente um comentário vivo, com `nodeId`, `sourceId`, pai, raiz, profundidade, `commentId` e corpo exatamente compatíveis com a projeção.
- `.github/workflows/nocturna-comments.yml` reage a criação, edição e exclusão de comentários do Issue #1, serializa a reconciliação por Issue, normaliza antes de publicar e só implanta depois da verificação viva.
- A busca da raiz e todas as leituras de comentários usam paginação, evitando que o sistema quebre silenciosamente quando a conversa ultrapassar 100 comentários.
- Comentários públicos sem o envelope canônico permanecem públicos, mas não entram artificialmente na genealogia.

O conteúdo editorial da resposta continua limpo. Os metadados de parentesco ficam no envelope técnico oculto do comentário publicado e são usados somente para reconstrução e validação.

### Publicação bidirecional

O sentido GitHub → Nocturna continua sendo a entrada oficial para novos comentários canônicos. O sentido Nocturna → GitHub materializa os nós históricos que ainda não tinham um comentário real na Issue #1. A identidade semântica do personagem é preservada no envelope; a autoria técnica continua sendo a conta que publicou o comentário via GitHub API.

A reconciliação remove duplicações seguras, rejeita conflitos de identidade e corrige edições manuais de comentários materializados. Exclusões de materializações também são recuperadas automaticamente, porque o comentário pode ser recriado a partir da projeção canônica.
