# Nocturna

> **Estado atual (fonte operacional):** a versão corrente do projeto é a branch `main`. A branch `rastreabilidade-site` é histórica e não deve ser usada para descrever o estado atual do site. O GitHub Pages é implantado a partir de `main` por `.github/workflows/pages.yml`; o workflow pode transformar o conteúdo antes de gerar o artifact publicado. O conteúdo deste repositório e o conteúdo efetivamente servido pelo Pages são, portanto, fontes distintas e devem ser comparados separadamente.

## Estado de publicação atual

- **Branch de origem do deploy:** `main`.
- **Workflow de publicação:** [`.github/workflows/pages.yml`](./.github/workflows/pages.yml).
- **URL pública:** <https://outocarlos003-lang.github.io/Nocturna/>.
- **Referência histórica:** `rastreabilidade-site` é uma branch antiga e não representa o estado operacional atual.
- **Regra de diagnóstico:** para descrever o site publicado, não substitua a verificação da URL pública pelo conteúdo de uma branch ou commit histórico. Quando a URL não puder ser consultada, declare essa limitação.

## Relação entre Git e GitHub Pages

O Pages publica o artifact gerado a partir do checkout de `main`. O workflow gera as cascas de rota e o sitemap antes do upload, sem uma etapa adicional de mutação editorial. Por isso, uma comparação rigorosa deve distinguir: (1) estado atual do Git e (2) conteúdo derivado gerado pelo workflow.

## Referências históricas

O histórico do Git e branches antigas preservam versões anteriores do projeto. Mensagens de commit, README antigos e a branch `rastreabilidade-site` descrevem estados que podem não corresponder ao estado atual. Para análise operacional, fixe explicitamente a referência `main` e trate o histórico apenas como evidência histórica.


Publicação digital de leitura em Dark Romanticism. Por Riquelmi.

© 2026 Nocturna. Todos os direitos reservados.

Por Riquelmi.

## Acesso e rastreabilidade

- **[Repositório completo](./)** — visão geral do projeto no GitHub.
- **[Árvore completa de arquivos](https://github.com/outocarlos003-lang/Nocturna/tree/main)** — navegação por diretórios e arquivos.
- **[Histórico de commits](https://github.com/outocarlos003-lang/Nocturna/commits/main/)** — rastreabilidade das alterações feitas no repositório.
- **[Árvore Git completa](https://github.com/outocarlos003-lang/Nocturna/tree/main?recursive=1)** — inventário recursivo de todos os caminhos versionados.

### Diretórios principais

| Diretório | Acesso |
|---|---|
| `.github/` | [Workflows e automações](./.github/) |
| `artigos/` | [Publicações e artigos](./artigos/) |
| `assets/` | [Recursos visuais](./assets/) |
| `categorias/` | [Índices por categoria](./categorias/) |
| `contato/` | [Página de contato](./contato/) |
| `faq/` | [Perguntas frequentes](./faq/) |
| `privacidade/` | [Política de privacidade](./privacidade/) |
| `sobre/` | [Página sobre](./sobre/) |
| `tags/` | [Índices por tag](./tags/) |
| `arquivo/` | [Arquivo](./arquivo/) |

### Arquivos principais

| Arquivo | Acesso | Função |
|---|---|---|
| `index.html` | [abrir](./index.html) | Núcleo único da aplicação: CSS, JS e todo o conteúdo editorial (`DATA`) internos. |
| `manifest.webmanifest` | [abrir](./manifest.webmanifest) | Manifesto referenciado em `index.html`. |
| `robots.txt` | [abrir](./robots.txt) | Orienta rastreadores de mecanismos de busca. |
| `sitemap.xml` | [abrir](./sitemap.xml) | Mapa das URLs públicas atualmente versionadas. |
| `sitemap.mjs` | [abrir](./sitemap.mjs) | Gera o `sitemap.xml` a partir da URL pública configurada. |
| `validate.mjs` | [abrir](./validate.mjs) | Valida a estrutura e as referências do projeto. |
| `series-editorial-model.md` | [abrir](./series-editorial-model.md) | Documentação do modelo editorial de séries. |
| `social-card.svg` | [abrir](./social-card.svg) | Card social global. |
| `LICENSE` | [abrir](./LICENSE) | Termos de licença do repositório. |

### Recursos de identidade

- [Ícone global](./icon.svg)
- [Card social](./social-card.svg)
- [Arte — A ontologia da marca invisível](./a-ontologia-da-marca-invisivel.svg)
- [Arte — Arquiteto da correspondência ontológica](./arquiteto-da-correspondencia-ontologica.svg)
- [Arte — Metafísica do pecado: a lei como antítese operativa](./metafisica-do-pecado-a-lei-como-antitese-operativa.svg)
- [Arte — Metafísica do pecado como fratura teleológica da criatura](./metafisica-do-pecado-como-fratura-teleologica-da-criatura.svg)
- [Arte — Quando a eternidade julga a causalidade](./quando-a-eternidade-julga-a-causalidade.svg)

## Estrutura e função

| Arquivo | Função |
|---|---|
| `index.html` | Núcleo autocontido: CSS, JS, dados e conteúdo editorial em `DATA`. A navegação neural também nasce desse mesmo registro, sem arquivo editorial externo. |
| `manifest.webmanifest` | Manifesto referenciado em `index.html`; ícone global em `icon.svg`. |
| `assets/global/` · `assets/editorial/` | Recursos da identidade · imagens das publicações (nunca alteradas automaticamente). |
| `social-card.svg` | Card social global. Muitas plataformas não aceitam SVG em `og:image`; se for o caso, exporte PNG com o mesmo nome-base. |
| `robots.txt` | Permite rastreamento (não é controle de segurança). |
| `sitemap.mjs` | Gera `sitemap.xml` a partir da URL pública configurada. |
| `validate.mjs` | Valida categorias, IDs, relações, manifesto e assets conforme as regras atuais do projeto. |

## Executar

Abra `index.html` direto (`file://`) ou sirva por HTTP/HTTPS (ex.: GitHub Pages). A aplicação aceita rotas por hash (`#/categorias/metafisica`) e também reconhece as rotas estáticas correspondentes no GitHub Pages. As rotas públicas são cascas mínimas geradas a partir de `index.html`; ao abrir uma rota, o navegador retorna ao núcleo e o `index.html` resolve o conteúdo. Manifesto, canonical e armazenamento dependem de HTTP(S); a canonical só é emitida nesse caso. Não há Service Worker.

## Modelo editorial (fonte única)

Tudo vem de `DATA` em `index.html`: Home, grade, menu, rodapé, busca, índices, breadcrumbs, anterior/próximo.

- **Categorias**: `id`, `slug`, `name`, `description` (`null` até haver texto definitivo). Rotas: `#/categorias/<slug>`.
- **Séries**: `DATA.series` usa a hierarquia `série → blocks → chapters`. Rotas: `#/series`, `#/series/<serie>`, `#/series/<serie>/<bloco>`, `#/series/<serie>/<bloco>/<capitulo>`. Séries são independentes de `DATA.pubs` e não entram na busca, categorias, tags ou contagens de posts. Detalhes: [`series-editorial-model.md`](./series-editorial-model.md).
- **Publicação**: `{id, title, summary, cats:[idDeCategoria], body:[{h},{p}]}`. Uma única vez em `pubs`; várias categorias não duplicam resultados. Sem categoria continua acessível e pesquisável.
- **Adicionar publicação**: inclua o objeto em `pubs`, rode `node validate.mjs`. **Editar/remover**: altere/remova o objeto; índices e contagens se atualizam. **Categorias**: edite `cats` e valide referências antes de remover.

## Contato

E-mail e WhatsApp em `DATA.contact`. Sem backend, o formulário só prepara o e-mail (`mailto:`), enviado após confirmação do usuário.

## Segurança e privacidade

Sem credenciais, administração, cookies ou armazenamento local. Todo texto dinâmico é escapado. Edição ocorre fora da camada pública (commits/PR); o histórico do Git é o versionamento e a reversão.

## Núcleo único e compatibilidade de rotas\n\nO conteúdo editorial não é duplicado em páginas estáticas. `sitemap.mjs` cria somente cascas mínimas para preservar URLs diretas e o sitemap; cada casca encaminha para a rota equivalente dentro de `index.html`. Assim, todas as publicações, existentes e futuras, vivem uma única vez em `DATA.pubs`.\n\nA camada neural também é interna: a pesquisa transversal e as relações entre publicações são construídas diretamente a partir de `DATA` no `index.html`. Os artefatos derivados antigos (`dados-neurais/grafo.json`, `neural-index.mjs`, `neural-navigation.mjs` e `mapa-neural/`) deixam de fazer parte do caminho de execução.\n\n## Rastreabilidade de alterações

Cada mudança relevante deve permanecer registrada no histórico do Git. Para auditar uma versão específica, use os links de **commits** e **árvore do repositório** acima; para localizar qualquer arquivo ou diretório, use a **árvore Git completa**.
