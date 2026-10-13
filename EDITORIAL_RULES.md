# Editoriale Nocturna: regras obrigatórias

Estas regras valem para qualquer inclusão, correção, reorganização ou publicação de capítulos. A estrutura editorial existente é a fonte de verdade; nunca crie uma coleção apenas para acomodar um capítulo subsequente.

## Regra de pertencimento

1. **Capítulos sequenciais pertencem à mesma coleção e ao mesmo bloco já visados.** Capítulo II, III, IV e seguintes são continuações por padrão. Preserve os IDs, slugs, título da coleção, título do bloco e a ordem existentes.
2. **Não deduza uma coleção nova pelo título isolado de um capítulo subsequente.** Primeiro procure a coleção e o bloco correspondentes no registro `DATA.series`, inclusive por título, tema, referências, IDs e capítulos vizinhos. Verifique também os arquivos editoriais históricos para evitar duplicar conteúdo ou criar rotas concorrentes.
3. **Capítulo I é o sinal padrão de início de coleção nova**, desde que não haja evidência de que seja uma correção ou substituição de um Capítulo I existente. Antes de criar a coleção, procure títulos, temas, blocos e versões já existentes.
4. **Exceção explícita prevalece.** Só crie uma coleção para um capítulo subsequente quando a instrução do usuário disser claramente que se trata de uma coleção nova. Uma instrução contextual explícita também pode determinar que um Capítulo I substitui/corrige o Capítulo I de uma coleção existente.
5. **Ambiguidade não autoriza duplicação.** Se houver duas coleções/blocos candidatos plausíveis e não for possível identificar com segurança o destino, não publique nem invente uma estrutura: inspecione o histórico e peça esclarecimento antes de alterar os dados.

## Procedimento antes de gravar

- Leia `index.html` e localize a coleção e o bloco pretendidos em `DATA.series`.
- Confira o número/título do capítulo, capítulos vizinhos, conteúdo existente e possíveis duplicatas em outras coleções.
- Atualize a entrada existente in-place quando for continuação; não acrescente um objeto a `DATA.series` para um capítulo II ou posterior.
- Preserve integralmente o texto fornecido. Não substitua nem remova capítulos existentes durante a inclusão.
- Mantenha IDs e slugs canônicos e únicos. Gere novamente rotas e sitemap pelo fluxo editorial do repositório.
- Execute `node validate.mjs`, `node scripts/validate-system.mjs` e as validações de assets/comentários disponíveis. Examine o diff para confirmar que não surgiu coleção, bloco ou rota duplicada.
- Só conclua depois de verificar o número de coleções, o pertencimento do capítulo, a rota pública e o sitemap.

## Critério de aceitação

Uma continuação só está correta quando o capítulo novo aparece dentro da coleção e do bloco previamente visados, a contagem de coleções não aumenta sem autorização explícita, nenhum capítulo existente foi perdido e as rotas públicas apontam para o registro canônico.
