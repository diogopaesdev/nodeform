import type { BlogPost } from "../types"

export const post: BlogPost = {
  slug: "como-criar-pesquisa-nps-online",
  enSlug: "how-to-create-nps-survey-online",
  category: "funcionalidade",
  date: "2026-05-05",
  readTime: 4,
  pt: {
    title: "Como Criar uma Pesquisa NPS Online (e o que fazer com os resultados)",
    description:
      "Guia completo para criar uma pesquisa Net Promoter Score online, segmentar Promotores e Detratores com lógica condicional e interpretar os dados para melhorar a experiência do cliente.",
    content: `<p>O <strong>Net Promoter Score (NPS)</strong> é uma das métricas mais usadas para medir a lealdade e satisfação de clientes. A pergunta central é simples: <em>"Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossa empresa a um amigo ou colega?"</em> — mas o que você faz com as respostas é o que realmente importa.</p>

<h2>Como calcular o NPS</h2>
<p>Os respondentes são classificados em três grupos com base na nota fornecida:</p>
<ul>
  <li><strong>Promotores (9–10):</strong> clientes leais que recomendam ativamente sua marca</li>
  <li><strong>Neutros (7–8):</strong> satisfeitos, mas não entusiastas — podem migrar para concorrentes</li>
  <li><strong>Detratores (0–6):</strong> clientes insatisfeitos que podem prejudicar sua reputação</li>
</ul>
<p>O cálculo é direto: <strong>NPS = % Promotores − % Detratores</strong>. O resultado varia de −100 a +100. Empresas com NPS acima de 50 são consideradas excelentes em seu segmento.</p>

<h2>Por que criar uma pesquisa NPS online dedicada</h2>
<p>Pesquisas NPS em planilhas têm vida curta: são difíceis de escalar, não capturam o contexto qualitativo e não permitem análise automatizada. Uma <strong>pesquisa NPS online</strong> com ferramenta dedicada resolve todos esses problemas — especialmente quando combinada com lógica condicional.</p>

<h2>Como construir uma pesquisa NPS no SurveyFlow</h2>
<p>No editor de nós, você cria o fluxo em poucos passos:</p>
<ul>
  <li>Adicione um nó de <strong>avaliação numérica</strong> com escala de 0 a 10</li>
  <li>Conecte notas 9–10 (Promotores) a uma pergunta aberta: <em>"O que mais te agradou?"</em></li>
  <li>Conecte notas 7–8 (Neutros) a uma pergunta: <em>"O que poderíamos melhorar para superar suas expectativas?"</em></li>
  <li>Conecte notas 0–6 (Detratores) a uma pergunta específica: <em>"O que aconteceu? Como podemos resolver?"</em></li>
  <li>Configure uma tela final personalizada com mensagem de agradecimento por perfil</li>
</ul>

<h2>A vantagem do fluxo condicional no NPS</h2>
<p>A maioria das ferramentas de NPS mostra a mesma pergunta de acompanhamento para todos os respondentes. Com o fluxo condicional do SurveyFlow, Promotores, Neutros e Detratores recebem perguntas de acompanhamento completamente diferentes — o que eleva muito a qualidade do feedback qualitativo coletado e permite ações mais precisas por segmento.</p>

<h2>Quando enviar a pesquisa NPS</h2>
<p>Os momentos mais eficazes para coleta de NPS variam por tipo de negócio:</p>
<ul>
  <li>Após a conclusão de um serviço ou entrega</li>
  <li>30 e 90 dias após a primeira compra (NPS relacional)</li>
  <li>Após interações com o suporte ao cliente</li>
  <li>Antes da renovação de contrato ou assinatura</li>
</ul>

<h2>Analise os resultados no dashboard</h2>
<p>O SurveyFlow centraliza todas as respostas no dashboard, com visualização dos textos abertos agrupados por perfil — essencial para entender o "porquê" por trás do número e priorizar melhorias.</p>
<p>Isso é valioso para equipes de <a href="/pesquisa-de-mercado">pesquisa de mercado</a> e para <a href="/clinicas-esteticas">clínicas estéticas</a> que medem satisfação de pacientes após procedimentos.</p>
<p><a href="/">Crie sua pesquisa NPS gratuitamente →</a></p>`,
  },
  en: {
    title: "How to Create an NPS Survey Online (and What to Do With the Results)",
    description:
      "Complete guide to creating a Net Promoter Score survey online, segmenting Promoters and Detractors with conditional logic, and interpreting results to improve customer experience.",
    content: `<p>The <strong>Net Promoter Score (NPS)</strong> is one of the most widely used metrics for measuring customer loyalty and satisfaction. The core question is simple: <em>"On a scale of 0–10, how likely are you to recommend our company to a friend or colleague?"</em> — but what you do with the responses is what really matters.</p>

<h2>How to calculate NPS</h2>
<ul>
  <li><strong>Promoters (9–10):</strong> loyal customers who actively recommend your brand</li>
  <li><strong>Passives (7–8):</strong> satisfied but not enthusiastic — may switch to competitors</li>
  <li><strong>Detractors (0–6):</strong> unhappy customers who may harm your reputation</li>
</ul>
<p><strong>NPS = % Promoters − % Detractors</strong>. The score ranges from −100 to +100. Companies with NPS above 50 are considered excellent in their segment.</p>

<h2>Why use a dedicated online NPS survey tool</h2>
<p>Spreadsheet-based NPS surveys are hard to scale, don't capture qualitative context, and don't allow automated analysis. A <strong>dedicated online NPS survey</strong> solves all of this — especially when combined with conditional logic.</p>

<h2>Building an NPS survey in SurveyFlow</h2>
<p>In the node editor, create the flow in a few steps: add a numeric rating node (0–10); connect scores 9–10 (Promoters) to "What did you like most?"; connect 7–8 (Passives) to "What could we improve?"; connect 0–6 (Detractors) to "What happened? How can we make it right?"; add a personalized end screen per profile.</p>

<h2>The conditional flow advantage in NPS</h2>
<p>Most NPS tools show the same follow-up question to everyone. With SurveyFlow's conditional flow, Promoters, Passives, and Detractors each receive different follow-up questions — significantly improving the qualitative feedback quality and enabling more targeted actions per segment.</p>

<h2>When to send your NPS survey</h2>
<ul>
  <li>After service completion or delivery</li>
  <li>30 and 90 days post-first-purchase (relational NPS)</li>
  <li>After support interactions</li>
  <li>Before contract or subscription renewal</li>
</ul>

<p><a href="/">Create your NPS survey for free →</a></p>`,
  },
}
