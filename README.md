# Nocturna Reply API

Backend mínimo para publicar respostas da página `comentarios/` diretamente na Issue #5 sem colocar Personal Access Token, App private key ou installation token no JavaScript público.

## Arquitetura

```text
GitHub Pages
  │
  │ POST {message,parentNode,parentComment,parentAuthor,responder}
  ▼
Cloudflare Worker `nocturna-reply-api`
  │
  │ assina JWT com GITHUB_PRIVATE_KEY
  │ cria installation token temporário
  ▼
GitHub API
  │
  │ POST /repos/outocarlos003-lang/Nocturna/issues/5/comments
  ▼
Issue #5
  │
  │ issue_comment.created
  ▼
.github/workflows/nocturna-reply-router.yml
  │
  ▼
novo comentário convertido em nó filho e ancorado no pai
```

O endpoint de criação de comentário do GitHub aceita um GitHub App installation access token com permissão `Issues: write`. O token de instalação é temporário; a chave privada permanece somente no Worker. citeturn0search0turn0search5

## 1. Criar o GitHub App

Crie um GitHub App privado na conta que possui o repositório e dê somente:

- **Repository permissions → Issues: Read and write**
- nenhuma permissão de conteúdo é necessária para este fluxo
- eventos/webhooks não são necessários para a publicação, porque o workflow do próprio repositório continua recebendo `issue_comment.created`

Instale o App somente em `outocarlos003-lang/Nocturna`. GitHub permite restringir a instalação a repositórios selecionados. citeturn4search7

Na página do App, gere uma **Private Key**. A chave privada deve permanecer secreta e não deve ser colocada no repositório. citeturn4search0

## 2. Configurar o Cloudflare Worker

No diretório deste Worker:

```bash
npx wrangler login
npx wrangler deploy
```

Depois configure os dois segredos:

```bash
npx wrangler secret put GITHUB_APP_ID
npx wrangler secret put GITHUB_PRIVATE_KEY
```

O Cloudflare recomenda usar Secrets para credenciais sensíveis, e não `vars` ou código-fonte. citeturn1search1turn1search8

O Worker descobre automaticamente a instalação do App em `outocarlos003-lang/Nocturna`, portanto não é necessário armazenar `GITHUB_INSTALLATION_ID`.

O JWT do GitHub App é criado no servidor com RS256 e validade curta; depois ele é trocado por um installation access token. O JWT do App não deve durar mais de 10 minutos e os tokens de instalação expiram em uma hora. citeturn5search0turn5search8

## 3. Se preferir deploy pelo GitHub Actions

O repositório já contém `.github/workflows/deploy-nocturna-reply-api.yml`.

Adicione estes **Actions secrets** ao repositório:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Depois de um push que altere `infra/nocturna-reply-api/`, o workflow publica o Worker.

## 4. Configurar a URL pública do Worker

Um Worker em `workers.dev` recebe uma URL no formato:

```text
https://nocturna-reply-api.<seu-subdominio>.workers.dev
```

O subdomínio `workers.dev` pertence à conta Cloudflare e o nome do Worker vem do campo `name` do `wrangler.jsonc`. citeturn3search0

Copie essa URL para:

`comentarios/reply-api-config.js`

Exemplo:

```js
window.NOCTURNA_REPLY_API = "https://nocturna-reply-api.exemplo.workers.dev";
```

O domínio público da Nocturna já está fixado no Worker como:

```text
https://outocarlos003-lang.github.io
```

Se o site passar a usar um domínio personalizado, atualize `ALLOWED_ORIGIN` no Worker. GitHub Pages aceita domínios personalizados. citeturn2search0

## Resultado

Depois da configuração, `Enviar` dentro de qualquer caixa de resposta deixa de abrir o GitHub para colagem manual.

O fluxo passa a ser:

```text
escrever resposta
      ↓
Enviar
      ↓
Worker seguro
      ↓
GitHub API
      ↓
comentário criado na Issue #5
      ↓
workflow nocturna-reply-router.yml
      ↓
nó filho ancorado ao comentário-pai
```

Nenhum Personal Access Token, installation token ou private key fica no `index.html` ou no código público do GitHub Pages.


## Comentários canônicos

A conversa da Nocturna é uma árvore, não uma lista.

- A Issue #5 é a autoridade histórica.
- A projeção canônica é `data/comments/issue-5.json`.
- A interface `comentarios/index.html` somente lê essa projeção e reconstrói a árvore.
- `site-comments-export.json` é preservado como evidência de migração histórica; não é consumidor da interface.
- Os IDs históricos 1..23 são preservados. O próximo ID canônico é 24.
- Cada descendente guarda `parentNodeId`, `parentCommentId`, `parentAuthor`, `depth`, `order`, autoria, conteúdo e origem.
- `scripts/validate-comments.mjs` rejeita duplicidade, pai ausente, auto-pai, profundidade incoerente e lacunas de identidade.
- `scripts/normalize-comments.mjs` aceita somente o envelope `nocturna-reply:v1` produzido pelo mecanismo de resposta e por comentário de bot; a operação é idempotente pela identidade `source-id`.
- `.github/workflows/nocturna-comments.yml` normaliza, valida e publica o artefato Pages com a projeção viajando junto do site.
- Comentários públicos sem o envelope canônico permanecem públicos, mas não entram artificialmente na genealogia.

O conteúdo editorial da resposta continua limpo. Os metadados de parentesco ficam no envelope técnico oculto do comentário publicado e são usados somente para reconstrução e validação.
