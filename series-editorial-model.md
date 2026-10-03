# Arquitetura editorial de séries

A Nocturna possui duas modalidades editoriais coexistentes:

- **Posts**: continuam armazenados em `DATA.pubs`, com a estrutura e as rotas existentes.
- **Séries**: ficam em `DATA.series`, com a hierarquia **série → blocos → capítulos**.

## Modelo de dados

Uma série segue este formato:

```js
{
  id: "identificador-da-serie",
  slug: "identificador-da-serie",
  title: "Título da série",
  summary: "Resumo da série.",
  blocks: [
    {
      id: "bloco-1",
      slug: "bloco-1",
      title: "Título do bloco",
      summary: "Resumo do bloco.",
      chapters: [
        {
          id: "capitulo-1",
          slug: "capitulo-1",
          title: "Título do capítulo",
          summary: "Resumo do capítulo.",
          content: "Conteúdo extenso do capítulo..."
        }
      ]
    }
  ]
}
```

Um bloco pode conter quantos capítulos forem necessários. Cada capítulo possui uma página própria, permitindo textos extensos sem condensá-los em um único post.

## Rotas

- `#/series` — índice de séries.
- `#/series/<serie>` — identidade e índice da série.
- `#/series/<serie>/<bloco>` — índice e conteúdo editorial do bloco.
- `#/series/<serie>/<bloco>/<capitulo>` — capítulo individual.

As páginas de capítulo oferecem navegação anterior/próximo dentro do próprio bloco. As páginas de bloco permitem avançar ou retornar entre blocos da mesma série.

## Isolamento editorial

A busca, categorias, tags, contagens, relacionados e navegação de **Posts** continuam baseados exclusivamente em `DATA.pubs`. Séries não são convertidas em posts, não são condensadas em posts e não alteram a estrutura existente.

A navegação pública acrescenta apenas o destino **Séries** ao lado de **Artigos**. Se não houver séries cadastradas, o índice permanece vazio sem afetar os posts.

## Extensão

Para criar uma série, basta acrescentar um objeto a `DATA.series` seguindo o modelo acima. Para ampliar uma série existente, acrescentam-se blocos ou capítulos ao respectivo objeto. Nenhuma alteração em `DATA.pubs` é necessária.
