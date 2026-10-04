# Instruções para análise do site Nocturna via ChatGPT

## Regra de uso do GitHub Connector

Quando o usuário mencionar ou enviar apenas o site:

`https://outocarlos003-lang.github.io/Nocturna/`

a análise deve ser feita diretamente a partir do site. **Não usar o conector GitHub em conjunto por padrão.**

O conector GitHub só deve ser usado concomitantemente quando o usuário pedir explicitamente algo equivalente a:
- analisar o site **e** o repositório GitHub;
- usar o conector GitHub junto com a análise do site;
- consultar o código/repositório para complementar a análise do site.

### Regra de precedência

- **Somente o site / análise do site:** consultar o site diretamente e não acionar o conector GitHub apenas por ele estar disponível.
- **Site + pedido explícito para usar GitHub:** consultar o site e o repositório, usando ambos quando forem relevantes.
- **Pedido explícito sobre o repositório/código:** usar o conector GitHub conforme solicitado.
- A simples disponibilidade ou conexão do GitHub não constitui autorização para usá-lo quando o usuário apenas fornecer o endereço do site.

Esta regra existe para evitar que uma análise do site seja indevidamente misturada com informações do repositório e para preservar a distinção entre a versão publicada do site e o conteúdo do código-fonte.

## Escopo

Esta instrução é específica ao projeto **Nocturna** e ao site publicado acima.

---

# Atualização das diretrizes de leitura independente do site Nocturna

Esta atualização complementa e reforça as instruções acima. Deve ser aplicada **somente quando sua execução for solicitada explicitamente**.

Sua finalidade é reforçar a separação entre:

- o conteúdo atualmente publicado e acessível do site Nocturna;
- o código-fonte e demais arquivos existentes no repositório;
- o histórico de commits e versões anteriores;
- informações ou interpretações obtidas em análises anteriores.

A existência de um conector GitHub disponível ou conectado ao projeto não deve, por si só, fazer com que o repositório seja utilizado durante uma análise isolada do site.

## 1. Ênfase principal: o site atual é a fonte da análise isolada

Quando o usuário fornecer, mencionar ou solicitar apenas o site Nocturna, sem pedir explicitamente uma consulta ao repositório GitHub:

**SITE ISOLADO → LEITURA DIRETA DO SITE.**

A análise deve priorizar exclusivamente aquilo que está efetivamente publicado, acessível e observável no site no momento da análise.

O estado atual do site não deve ser reconstruído ou inferido a partir de:

- commits antigos;
- versões anteriores;
- histórico do repositório;
- código que não esteja necessariamente refletido na versão publicada;
- falhas ocorridas em análises anteriores;
- interpretações produzidas anteriormente;
- tentativas anteriores de leitura realizadas pelo conector;
- hipóteses sobre como o site funcionava em outro momento.

**Regra fundamental:** o conteúdo atualmente publicado do site deve prevalecer sobre qualquer contexto histórico do repositório quando o site for solicitado isoladamente.

## 2. O GitHub não deve ser utilizado automaticamente como contexto complementar

A conexão do repositório GitHub com o ChatGPT, sua disponibilidade como fonte ou a existência de instruções relacionadas ao conector não constituem autorização automática para consultar o repositório durante uma análise do site.

Portanto:

- site fornecido isoladamente ≠ autorização para consultar o GitHub;
- GitHub conectado ≠ necessidade de usar o GitHub;
- histórico disponível ≠ contexto atual obrigatório;
- repositório existente ≠ representação automática do site publicado.

Se o usuário não solicitar o uso do GitHub, a análise do site deve permanecer independente do repositório.

## 3. O histórico deve permanecer histórico

O histórico do repositório possui valor próprio e deve continuar preservado integralmente.

Esta diretriz não solicita, não autoriza e não justifica:

- apagar commits;
- reescrever commits;
- alterar mensagens de commits;
- remover versões anteriores;
- alterar branches;
- ocultar o histórico;
- reorganizar o histórico para modificar sua interpretação;
- eliminar registros de análises ou desenvolvimento anteriores.

O objetivo é exclusivamente impedir que o histórico seja tratado como se fosse evidência automática do estado atual do site.

Assim:

- falha histórica de leitura ≠ falha atual do site;
- versão antiga ≠ versão atual;
- commit antigo ≠ conteúdo atualmente publicado;
- interpretação anterior ≠ observação atual;
- tentativa anterior ≠ estado atual;
- histórico do projeto ≠ estado presente do site.

## 4. Ênfase especial sobre erros e falhas anteriores

Uma falha ocorrida durante uma análise anterior não deve ser transformada automaticamente em uma característica permanente do site.

Da mesma forma, uma interpretação incorreta ou incompleta produzida anteriormente não deve ser utilizada como premissa para uma nova análise independente.

Exemplos de informações que não devem contaminar automaticamente uma nova leitura:

- “o site não funcionava anteriormente”;
- “o conector não conseguiu ler determinada página anteriormente”;
- “uma análise anterior encontrou determinado problema”;
- “um commit antigo apresentava determinado comportamento”;
- “uma versão anterior possuía determinada estrutura”;
- “o repositório indicava determinado estado em outro momento”.

Essas informações podem ser historicamente verdadeiras sem necessariamente descrever o estado atual do site.

A análise deve distinguir rigorosamente entre:

**o que aconteceu antes**

e

**o que está publicado agora.**

## 5. Quando o GitHub pode ser usado conjuntamente

O GitHub pode ser consultado juntamente com o site quando o usuário solicitar isso de maneira explícita.

Exemplos:

- “Analise o site e o repositório.”
- “Consulte o GitHub para complementar a análise do site.”
- “Compare o site atual com o código do repositório.”
- “Veja no GitHub como essa parte do site foi implementada.”
- “Analise o código e compare com o que está publicado.”
- “Use o conector GitHub junto com a análise do site.”

Nesse cenário:

**REPOSITÓRIO + SITE, QUANDO EXPLICITAMENTE SOLICITADO → ANÁLISE CONJUNTA.**

A análise conjunta deve manter a distinção entre as fontes.

O repositório pode representar código, documentação, histórico ou versões de desenvolvimento.

O site representa aquilo que está atualmente publicado e acessível.

Uma informação encontrada no repositório não deve ser apresentada como conteúdo atualmente publicado do site sem evidência de que ambos correspondam.

## 6. Distinção entre código-fonte e conteúdo publicado

O fato de determinado código existir no repositório não significa necessariamente que ele esteja atualmente refletido no site publicado.

Da mesma forma, a ausência de determinado elemento em uma versão ou commit antigo não significa que ele esteja ausente da versão atualmente publicada.

Portanto:

- código-fonte ≠ automaticamente site publicado;
- arquivo do repositório ≠ automaticamente página atualmente acessível;
- commit ≠ automaticamente estado atual;
- branch ≠ automaticamente versão efetivamente observada pelo usuário.

Quando houver diferença entre o conteúdo do repositório e aquilo que está publicado, essa diferença deve ser reconhecida, e não artificialmente eliminada por inferência.

## 7. Precedência das evidências

Em uma análise solicitada exclusivamente sobre o site, deve ser adotada a seguinte prioridade:

1. conteúdo atualmente acessível no site;
2. comportamento atualmente observável do site;
3. recursos e páginas efetivamente publicados;
4. informações diretamente apresentadas pela versão atual do site.

Informações históricas do GitHub não devem substituir essas evidências.

Quando houver uma solicitação explícita de análise conjunta, o repositório pode ser utilizado como fonte adicional, mas suas informações devem continuar sendo identificadas como provenientes do repositório.

## 8. Finalidade desta atualização

Esta atualização existe para reforçar uma separação que deve permanecer clara durante futuras análises do projeto Nocturna.

Uma nova análise do site deve começar pelo site que existe agora, e não pelo que o repositório, os commits ou análises anteriores dizem que o site foi em algum momento.

O objetivo não é apagar o passado.

O objetivo é impedir que o passado seja confundido com o presente.

O histórico continua preservado.

As versões anteriores continuam sendo versões anteriores.

As análises anteriores continuam pertencendo ao contexto histórico em que ocorreram.

Mas uma solicitação de análise isolada do site deve ser respondida com base no estado atual do site.

## 9. Limites desta diretriz

Esta atualização possui caráter exclusivamente documental.

Ela não deve resultar em:

- alteração do site público;
- alteração do GitHub Pages;
- alteração da navegação pública;
- alteração de commits;
- reescrita do histórico;
- alteração de branches;
- alteração de workflows;
- alteração de configurações de publicação;
- alteração de arquivos do projeto que não sejam necessários para registrar esta diretriz;
- criação de mecanismos para manipular o conector;
- criação de mecanismos para ocultar informações do repositório;
- criação de mecanismos para fazer o site parecer diferente do que efetivamente está publicado.

A documentação deve apenas registrar a orientação de interpretação e precedência entre fontes.

## 10. Regra operacional resumida

Quando o usuário fornecer apenas o site:

**LEIA O SITE.**

Não consulte automaticamente o GitHub.

Não use automaticamente o histórico do repositório.

Não trate falhas anteriores como características atuais.

Não trate versões anteriores como estado atual.

Não trate código histórico como conteúdo publicado atual.

Quando o usuário fornecer o site e pedir explicitamente o GitHub:

**LEIA O SITE + CONSULTE O REPOSITÓRIO.**

Nesse caso, as duas fontes podem ser comparadas e utilizadas em conjunto.

A distinção entre estado publicado, código-fonte e histórico deve permanecer explícita.

## 11. Princípio central reforçado

> “Quando o site Nocturna for solicitado isoladamente, a análise deve começar e ser fundamentada no site atualmente publicado. O histórico do GitHub não deve ser tratado como o presente do site.”

> “O passado do repositório pode explicar o passado do projeto, mas não deve substituir a observação do presente do site.”

> “GitHub só deve entrar como fonte complementar quando o usuário solicitar explicitamente sua utilização.”

Esta atualização deve ser interpretada em conjunto com o conteúdo já existente em `.github/CHATGPT-CONNECTOR-INSTRUCTIONS.md`, reforçando especialmente a independência entre a leitura atual do site e o histórico do repositório.
