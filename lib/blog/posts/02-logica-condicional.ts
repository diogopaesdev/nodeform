import type { BlogPost } from "../types"

export const post: BlogPost = {
  slug: "formulario-com-logica-condicional",
  enSlug: "conditional-logic-form-builder",
  category: "funcionalidade",
  date: "2026-05-10",
  readTime: 4,
  pt: {
    title: "Formulário com Lógica Condicional: o que é e como criar pesquisas inteligentes",
    description:
      "Aprenda o que é lógica condicional em formulários, para que serve e como criar pesquisas que se adaptam às respostas dos participantes — sem abandonos e com dados de qualidade.",
    content: `<p>Um <strong>formulário com lógica condicional</strong> é aquele que muda de comportamento conforme o usuário responde. Se alguém marca "Sim" numa pergunta, vê as perguntas seguintes; se marca "Não", vai direto para outra parte do formulário. Parece simples, mas essa funcionalidade muda completamente a qualidade dos dados coletados — e a experiência de quem responde.</p>

<h2>Por que lógica condicional importa</h2>
<p>Imagine uma pesquisa de 20 perguntas onde 12 são relevantes apenas para um subgrupo. Sem lógica condicional, todos os respondentes enfrentam as 20 perguntas — e a taxa de abandono dispara. Com lógica condicional, cada pessoa vê apenas o que é relevante para ela.</p>
<p>Os resultados práticos são claros:</p>
<ul>
  <li>Taxas de conclusão mais altas</li>
  <li>Dados mais precisos (menos respostas aleatórias por frustração)</li>
  <li>Experiência mais profissional para o respondente</li>
  <li>Segmentação automática baseada nas respostas</li>
</ul>

<h2>Como funciona a lógica condicional no SurveyFlow</h2>
<p>O SurveyFlow usa um <strong>editor visual baseado em nós</strong>. Cada pergunta é um bloco (nó) no canvas, e as conexões entre eles definem o fluxo. Para criar uma lógica condicional:</p>
<ul>
  <li>Crie um nó de <strong>escolha única</strong> com as opções desejadas</li>
  <li>Conecte cada opção a um nó diferente — a conexão sai de uma opção específica</li>
  <li>O respondente é direcionado automaticamente para o caminho correto</li>
</ul>
<p>O fluxo inteiro fica visível no canvas. Você consegue ver de relance quais caminhos existem, onde estão os pontos de convergência e se alguma pergunta ficou sem saída.</p>

<h2>Além do roteamento simples: elegibilidade e pontuação</h2>
<p>No SurveyFlow, a lógica condicional vai além do roteamento. Você pode configurar <strong>regras de elegibilidade</strong> que bloqueiam respondentes que não atendem a critérios específicos — por exemplo, apenas pessoas acima de 25 anos com determinado perfil. Também é possível atribuir <strong>pontuação por opção</strong> e exibir um resultado final baseado no score total.</p>
<p>Isso é especialmente útil para <a href="/pesquisa-de-mercado">pesquisas de mercado</a>, <a href="/healthcare">triagem na área da saúde</a> e <a href="/infoprodutores">diagnósticos de audiência para infoprodutores</a>.</p>

<h2>Casos de uso comuns</h2>
<ul>
  <li><strong>Qualificação de leads:</strong> redirecione leads frios para uma página informativa e leads quentes para um formulário de contato</li>
  <li><strong>Pesquisas segmentadas:</strong> mostre perguntas específicas para cada persona ou perfil de cliente</li>
  <li><strong>Triagem de elegibilidade:</strong> bloqueie respondentes que não se enquadram nos critérios antes de iniciar a pesquisa</li>
  <li><strong>Quizzes com resultado:</strong> calcule um score ao final e exiba uma tela personalizada por faixa de pontuação</li>
</ul>

<h2>Como criar seu primeiro formulário condicional</h2>
<p>No SurveyFlow, você começa no editor de nós: arrasta um bloco de escolha única, cria as opções e conecta cada uma ao próximo nó correspondente. Não há código, não há configurações escondidas — tudo é visual e intuitivo.</p>
<p><a href="/">Experimente o editor gratuitamente por 7 dias →</a></p>`,
  },
  en: {
    title: "Conditional Logic Form Builder: What It Is and How to Create Smart Surveys",
    description:
      "Learn what conditional logic is in forms, how it works, and how to build surveys that adapt based on participant responses — reducing dropouts and improving data quality.",
    content: `<p>A <strong>conditional logic form</strong> changes its behavior based on how users respond. If someone selects "Yes" on a question, they see the relevant follow-up questions; if they select "No", they skip to a different section. This feature fundamentally changes both the quality of data collected and the respondent experience.</p>

<h2>Why conditional logic matters</h2>
<p>Picture a 20-question survey where 12 questions are only relevant to a specific subgroup. Without conditional logic, every respondent faces all 20 questions — and dropout rates skyrocket. With conditional logic, each person only sees what's relevant to them.</p>
<ul>
  <li>Higher completion rates</li>
  <li>More accurate data (fewer random answers from frustrated respondents)</li>
  <li>A more professional experience for respondents</li>
  <li>Automatic segmentation based on responses</li>
</ul>

<h2>How conditional logic works in SurveyFlow</h2>
<p>SurveyFlow uses a <strong>visual node-based editor</strong>. Each question is a block (node) on the canvas, and the connections between them define the flow. To set up conditional logic: create a single choice node, connect each option to a different node — the connection leaves from a specific answer — and the respondent is automatically routed to the correct path.</p>
<p>The entire flow is visible on the canvas. You can see at a glance which paths exist, where they converge, and whether any question has no exit.</p>

<h2>Beyond routing: eligibility and scoring</h2>
<p>In SurveyFlow, conditional logic goes beyond simple routing. You can set up <strong>eligibility rules</strong> that block respondents who don't meet specific criteria. You can also assign <strong>per-option scores</strong> and display a final result screen based on the total score — ideal for quizzes, diagnostic tools, and lead scoring.</p>

<h2>Common use cases</h2>
<ul>
  <li><strong>Lead qualification:</strong> redirect cold leads to an informational page and hot leads to a contact form</li>
  <li><strong>Segmented surveys:</strong> show specific questions to each persona or customer profile</li>
  <li><strong>Eligibility screening:</strong> block respondents who don't meet criteria before the survey begins</li>
  <li><strong>Scored quizzes:</strong> calculate a score and display a personalized end screen per score range</li>
</ul>

<p><a href="/">Try the visual editor free for 7 days →</a></p>`,
  },
}
