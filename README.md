# Nocturna

Publicação digital de leitura em Dark Romanticism. By Riquelmi.

Nocturna. Todos os direitos reservados.

## Estrutura e função

| Arquivo | Função |
|---|---|
| `index.html` | Núcleo autocontido: CSS, JS e dados (`DATA`) internos. Sem `fetch()`, módulos, bibliotecas ou CSS externo. |
| `manifest.webmanifest` | Manifesto referenciado em `index.html`; ícone em `assets/global/icon.svg`. |
| `assets/global/` · `assets/editorial/` | Recursos da identidade · imagens das publicações (nunca alteradas automaticamente). |
| `social-card.svg` | Card social global. Muitas plataformas não aceitam SVG em `og:image`; se for o caso, exporte PNG com o mesmo nome-base. |
| `robots.txt` | Permite rastreamento (não é controle de segurança). |
| `scripts/sitemap.mjs` | Gera `sitemap.xml` a partir de uma URL pública real. Sem URL real não há sitemap. |
| `tests/validate.mjs` | Valida categorias, IDs, relações, manifesto, assets e ausência de dependências externas. |

## Executar

Abra `index.html` direto (`file://`) ou sirva por HTTP/HTTPS (ex.: GitHub Pages). Rotas usam hash (`#/categorias/metafisica`) porque caminhos reais não existem em `file://`/`content://`. Manifesto, canonical e armazenamento dependem de HTTP(S); a canonical só é emitida nesse caso. Não há Service Worker.

## Modelo editorial (fonte única)

Tudo vem de `DATA` em `index.html`: Home, grade, menu, rodapé, busca, índices, breadcrumbs, anterior/próximo.

- **Categorias**: `id`, `slug`, `name`, `description` (`null` até haver texto definitivo). Rotas: `#/categorias/<slug>`.
- **Séries**: `DATA.series` usa a hierarquia `série → blocks → chapters`. Rotas: `#/series`, `#/series/<serie>`, `#/series/<serie>/<bloco>`, `#/series/<serie>/<bloco>/<capitulo>`. Séries são independentes de `DATA.pubs` e não entram na busca, categorias, tags ou contagens de posts. Detalhes: `docs/series-editorial-model.md`.
- **Publicação**: `{id, title, summary, cats:[idDeCategoria], body:[{h},{p}]}`. Uma única vez em `pubs`; várias categorias não duplicam resultados. Sem categoria continua acessível e pesquisável.
- **Adicionar publicação**: inclua o objeto em `pubs`, rode `node tests/validate.mjs`. **Editar/remover**: altere/remova o objeto; índices e contagens se atualizam. **Categorias**: edite `cats` e valide referências antes de remover.

## Contato

E-mail e WhatsApp em `DATA.contact`. Sem backend, o formulário só prepara o e-mail (`mailto:`), enviado após confirmação do usuário.

## Segurança e privacidade

Sem credenciais, administração, cookies ou armazenamento local. Todo texto dinâmico é escapado. Edição ocorre fora da camada pública (commits/PR); o histórico do Git é o versionamento e a reversão.
