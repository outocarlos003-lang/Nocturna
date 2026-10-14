# Instruções para alterações editoriais da Nocturna

Ao receber um pedido editorial, execute a operação real de ponta a ponta na mesma solicitação. Não substitua uma inserção por um issue, comentário, checklist ou registro de tarefa. Issues são apenas acompanhamento opcional e nunca são o destino nem um pré-requisito para inserir publicações.

## Registros de tarefa: opcionais e nunca bloqueantes

1. O trabalho editorial começa na primeira solicitação do usuário, não depois da abertura de issue, criação de checklist, planejamento separado ou autorização de um registro de tarefa.
2. Issues, tarefas e comentários podem ser criados em paralelo para rastreabilidade, mas não podem atrasar, substituir, condicionar nem interromper a inserção de publicações, coleções, blocos, capítulos ou outros conteúdos solicitados.
3. Priorize executar a alteração canônica na mesma solicitação. Se uma etapa depender de informação realmente ausente, continue todas as partes independentes e peça apenas o dado indispensável para a parte bloqueada.
4. Um registro de tarefa documenta o trabalho; não é entrega editorial. Considere a solicitação concluída somente com evidência da alteração solicitada e informe separadamente validação, merge, deploy e publicação pública.


## Roteamento operacional obrigatório: decidir antes de agir

1. Identifique o tipo de conteúdo solicitado a partir do pedido e do modelo existente.
2. Para uma publicação individual do acervo, use `editorial/posts/*.md` com front matter válido e execute `node scripts/sync-editorial.mjs` para sincronizar `DATA.pubs` em `index.html`.
3. Para uma coleção, bloco ou capítulo estruturado, edite a estrutura canônica `DATA.series[] → blocks[] → chapters[]` em `index.html`, respeitando as regras de `EDITORIAL_RULES.md` e `docs/EDITORIAL-INSERTION.md`.
4. Não use issues como etapa intermediária obrigatória. Não crie um issue em vez de editar os arquivos canônicos. Se o pedido disser GitHub ou publicação, execute a alteração no repositório Nocturna; use Prompt-ria apenas se o pedido tratar especificamente dos instrumentos promptuais.
5. Antes de escrever, inspecione o repositório, os scripts de sincronização, o workflow de validação e as instruções pertinentes. Escolha o caminho correto antes de realizar qualquer mutação.
6. Crie uma branch de trabalho, grave a alteração no repositório correto, valide e abra PR quando o fluxo de colaboração exigir. Relate links de commits/PRs e estados comprovados. Não declare deploy ou publicação pública sem evidência.

## Prioridade do escopo explícito da coleção

1. Se o solicitante especificar o título de uma coleção, esse título determina o destino do capítulo ou material solicitado, mesmo que exista capítulo com o mesmo número ou título em outra coleção.
2. Resolva o destino nesta ordem: (a) título explicitamente indicado no pedido atual; (b) título explicitamente estabelecido anteriormente e ainda vigente na sequência editorial; (c) vínculo inferido por bloco, tema, referências e capítulos vizinhos; (d) esclarecimento apenas se ainda houver mais de um destino plausível.
3. Preserve esse contexto em pedidos subsequentes que claramente continuem a mesma sequência até que outro título seja indicado ou o contexto seja encerrado.
4. Se a coleção nomeada já existir, atualize-a e o bloco correto. Se não existir e a instrução pedir uma nova coleção, crie-a conforme o modelo existente. Nunca crie outra coleção apenas porque um número de capítulo já existe em outra série.

## Regra de qualificação de duplicatas: limiar fixo de 90%

1. Antes de inserir, compare o texto completo proposto com o acervo completo, não apenas títulos, IDs, trechos, primeiros parágrafos ou a coleção mais próxima.
2. A comparação abrange publicações individuais, texto integral das coleções, cada capítulo e os posts editoriais existentes. Normalize apenas diferenças de caixa, acentuação, pontuação e espaços para comparação, mantendo a ordem das letras.
3. Calcule similaridade textual por distância de edição de caracteres: similaridade = 1 − (distância de Levenshtein / comprimento do maior texto normalizado).
4. Similaridade **igual ou superior a 90%** qualifica a correspondência como duplicata e bloqueia uma nova inserção até resolver a duplicação. Similaridade **inferior a 90% nunca pode bloquear** a solicitação por duplicidade, mesmo que o tema, título, personagem ou referências sejam parecidos.
5. Compare o texto integral de cada unidade. Não use uma coincidência de título isolada como substituto da comparação de conteúdo. Para coleções, compare também o texto agregado de todos os capítulos, além dos capítulos individualmente.
6. Execute `node scripts/check-editorial-duplicate.mjs caminho/solicitacao.json` antes de gravar. A solicitação deve fornecer `item.content` ou `item.sourceText`; para uma coleção, forneça os blocos e capítulos com seus conteúdos completos. O verificador compara o conteúdo com o acervo e bloqueia apenas correspondências >=90%.
7. Não transforme colisões históricas, coincidências temáticas ou similaridade abaixo do limiar em impedimento. Preserve os registros existentes e informe qual unidade e percentual acionaram um bloqueio real.

## Regra crítica: o pedido atual é a fonte do conteúdo

1. Leia a mensagem atual integralmente antes de concluir que algum texto, capítulo, título ou metadado está ausente.
2. Não confunda ausência no repositório com ausência no pedido. A mensagem atual determina o que foi solicitado.
3. Quando houver texto integral, trate-o como fonte soberana. Confira início, fim, títulos, referências, parágrafos e sequência antes de editar.
4. Não parafraseie, encurte, omita, complete nem substitua conteúdo fornecido. Se não for possível obter a fonte completa para uma comparação verificável, não declare fidelidade confirmada nem publique uma reconstrução como se fosse original.
5. Não declare publicação concluída sem verificar commit, dados, rotas, workflow de validação/deploy e resultado efetivo do site. Separe commit, validação, deploy e inspeção pública.

## Procedimento obrigatório

1. Inspecione `index.html`, `editorial/posts/`, os scripts de sincronização, os validadores e os workflows.
2. Inventarie título, subtítulos, texto integral, referências, estrutura e instruções de mídia da solicitação atual.
3. Escolha o caminho canônico: `editorial/posts/*.md` + sincronização para `DATA.pubs`, ou `DATA.series[]` para coleções estruturadas.
4. Execute a checagem de duplicatas com limiar de 90% sobre todo o texto aplicável.
5. Transcreva integralmente o conteúdo e use IDs/slugs únicos, categorias existentes e metadados válidos.
6. Atualize os dados que alimentam a interface; não altere apenas contadores ou listas visuais.
7. Execute as validações disponíveis, incluindo sitemap, dados, sistema, assets, comentários e continuidade editorial.
8. Confira o diff final e confirme que não houve perda de conteúdo, duplicação >=90%, rota concorrente ou alteração acidental.
9. Relate precisamente arquivos alterados, commit/PR, resultados de validação e eventuais pendências. Não confunda issue criada com inserção realizada.

## Regra de comunicação

Evite perguntas desnecessárias. Só interrompa quando houver ambiguidade real ou faltar o próprio conteúdo que precisa ser publicado. Se cometer um erro de leitura, reconheça-o e corrija o processo, sem transferir ao solicitante a responsabilidade por um texto fornecido.


## Protocolo Promptária–Nocturna: recuperação sob demanda e execução verificável

Estas instruções orientam o trabalho realizado neste repositório e devem ser aplicadas conforme a pertinência de cada solicitação. Não afirmam nem configuram, por si mesmas, memória global do ChatGPT, automação externa ou persistência entre sessões.

### Ciclo operacional por demanda

1. **Delimitar a tarefa.** Identifique objeto, finalidade, escopo, pressupostos, entregável e critério de conclusão. Determine se a solicitação exige consultar o acervo Nocturna ou se apenas menciona o projeto incidentalmente.
2. **Recuperar instrumentos pertinentes.** Consulte primeiro as instruções e ferramentas operacionais já disponíveis no repositório e escolha somente os procedimentos necessários à tarefa. Não invente ferramentas, integrações, memória ou capacidades.
3. **Decidir sobre recuperação documental.** Consulte publicações, coleções, capítulos e documentos Nocturna quando o usuário solicitar essa consulta ou quando ela for necessária, de modo justificável, para cumprir a tarefa. A simples disponibilidade ou menção do acervo não autoriza leitura preventiva.
4. **Definir e registrar o escopo.** Quando houver pesquisa documental, registre o universo pertinente, os documentos localizados e os efetivamente examinados. Diferencie leitura integral, leitura parcial, excertos, páginas apenas identificadas e itens inacessíveis.
5. **Examinar proporcionalmente.** Em tarefas delimitadas, leia as unidades pertinentes e amplie o escopo somente quando uma necessidade concreta surgir. Se a tarefa exigir reconstrução abrangente, defina o universo documental abrangido e examine todas as unidades acessíveis desse universo; não confunda esse universo com todo o acervo por padrão.
6. **Analisar com fidelidade.** Distinga conteúdo verificado, interpretação, hipótese e questão em aberto. Preserve as estruturas e os fundamentos pertinentes; adapte a função ao contexto sem adulterar arbitrariamente a fonte.
7. **Verificar cobertura e resultado.** Antes de declarar completude, compare o escopo definido com as unidades efetivamente examinadas. Não declare cobertura integral quando existirem lacunas de acesso, anexos não recuperados ou inventário insuficiente.
8. **Apresentar ostensivamente.** Informe, conforme a complexidade, fontes, escopo, métodos realmente executados, resultados e limitações. Transparência significa demonstrar o trabalho necessário, não executar procedimentos irrelevantes nem expor raciocínio interno privado.
9. **Concluir sem monitoramento autônomo.** Não iniciar varreduras recorrentes, leituras preventivas, inventários contínuos ou vigilância do acervo sem solicitação e finalidade operacional concreta.

### Referência filosófica normativa

Quando a tarefa for pertinente à arquitetura filosófica da Nocturna, use como referência metodológica o instrumento fornecido pelo solicitante: “Conservar o Fundamento, Transformar a Função, Reconstruir a Necessidade, Revelar o Todo em Cada Parte e Reconhecer na Origem a Presença Integral de Todas as Consequências Legítimas.” Trate essa formulação como orientação para investigar necessidade, relações entre escalas, causalidade, coerência e fechamento arquitetônico; não a apresente como prova de conteúdo documental que não tenha sido consultado.

### Regra de evidência e limites

- Identifique o endereço oficial e as unidades documentais relevantes quando uma demanda requerer recuperação documental e os recursos permitirem confirmá-los.
- Não confunda catálogo ou índice com leitura do documento; abertura de página com exame integral; excerto com obra completa; amostra com universo completo.
- Preserve divergências entre documentos e versões quando forem encontradas; não presuma uniformidade conceitual.
- Quando o acesso ou a capacidade de recuperação forem insuficientes, trabalhe em etapas verificáveis e registre pendências.
- Só afirme que um procedimento foi executado quando houver evidência de execução. Diferencie diretriz registrada, alteração commitada, validação, merge, deploy e publicação pública.
- Estas instruções orientam ferramentas que efetivamente as leem no contexto deste repositório. Não instalam automaticamente uma configuração global em outras conversas, produtos ou sessões.
