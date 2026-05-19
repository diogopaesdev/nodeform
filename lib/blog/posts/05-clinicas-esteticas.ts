import type { BlogPost } from "../types"

export const post: BlogPost = {
  slug: "pesquisa-satisfacao-clinicas-esteticas",
  enSlug: "patient-satisfaction-survey-aesthetic-clinic",
  category: "caso-de-uso",
  date: "2026-04-22",
  readTime: 4,
  pt: {
    title: "Pesquisa de Satisfação para Clínicas Estéticas: como coletar feedback de pacientes de forma inteligente",
    description:
      "Como clínicas estéticas usam formulários com lógica condicional para coletar feedback pós-procedimento, identificar detratores cedo e aumentar a retenção de pacientes.",
    content: `<p>Clínicas estéticas têm um desafio único na coleta de feedback: os procedimentos são pessoais, os resultados são percebidos de forma subjetiva e o momento certo de pedir uma avaliação faz toda a diferença. Uma <strong>pesquisa de satisfação bem estruturada</strong> pode ser a diferença entre um paciente que não volta e um que se torna embaixador da clínica.</p>

<h2>Quando coletar feedback de pacientes</h2>
<p>O timing ideal varia por tipo de procedimento e objetivo da pesquisa:</p>
<ul>
  <li><strong>Imediatamente após o procedimento:</strong> percepção do atendimento, conforto durante o procedimento e clareza nas explicações</li>
  <li><strong>7 a 14 dias depois:</strong> satisfação com os resultados iniciais e processo de recuperação</li>
  <li><strong>30 dias depois:</strong> resultado final consolidado, intenção de retorno e probabilidade de indicação</li>
</ul>
<p>Enviar a mesma pesquisa genérica em todos os momentos desperdiça a oportunidade. Com um formulário condicional, você adapta as perguntas ao timing e ao tipo de procedimento realizado.</p>

<h2>Como usar lógica condicional na pesquisa de clínicas estéticas</h2>
<p>No SurveyFlow, você constrói o fluxo visualmente:</p>
<ul>
  <li>A primeira pergunta identifica o procedimento realizado (limpeza de pele, botox, preenchimento, laser, etc.)</li>
  <li>Com base na resposta, o paciente é direcionado para perguntas específicas daquele procedimento</li>
  <li>Uma escala de satisfação (NPS de 0 a 10) captura o índice geral</li>
  <li>Detratores (notas 0–6) recebem uma pergunta aberta específica para colher o problema com detalhes</li>
  <li>Promotores (notas 9–10) recebem um convite sutil para indicar a clínica a amigos</li>
</ul>

<h2>Controle de respondentes: autenticidade dos dados</h2>
<p>Com o Módulo de Respondentes do SurveyFlow, cada paciente recebe um link único e só pode responder uma vez. Isso elimina duplicatas na base de dados e garante que o feedback coletado reflete opiniões reais — não respostas repetidas ou de pessoas que nunca realizaram o procedimento.</p>

<h2>O impacto real na retenção de pacientes</h2>
<p>Clínicas que coletam feedback sistematicamente conseguem identificar pontos de atrito antes que se tornem cancelamentos. Um paciente que dá nota 6 numa escala de 0 a 10 está em risco de não retornar — uma pesquisa que captura esse sinal a tempo permite uma ação proativa da equipe de atendimento, como um retorno personalizado ou uma consulta de acompanhamento.</p>

<h2>Personalização por procedimento</h2>
<p>Diferentes procedimentos têm diferentes critérios de satisfação. A pesquisa de satisfação para um procedimento de laser tem perguntas específicas sobre desconforto e tempo de recuperação que não fazem sentido para uma limpeza de pele. A lógica condicional do SurveyFlow garante que cada paciente responda apenas o que é relevante para a sua experiência.</p>
<p>Quer ver como clínicas estéticas usam o SurveyFlow? <a href="/clinicas-esteticas">Veja os casos de uso para clínicas estéticas →</a></p>
<p><a href="/">Comece sua pesquisa de satisfação gratuitamente →</a></p>`,
  },
  en: {
    title: "Patient Satisfaction Survey for Aesthetic Clinics: Smarter Feedback Collection",
    description:
      "How aesthetic clinics use conditional logic forms to collect post-procedure feedback, identify detractors early, and improve patient retention rates.",
    content: `<p>Aesthetic clinics face a unique challenge in collecting feedback: procedures are personal, results are perceived subjectively, and the timing of feedback requests makes all the difference. A well-structured <strong>patient satisfaction survey</strong> can turn an at-risk patient into a loyal advocate for your clinic.</p>

<h2>When to collect patient feedback</h2>
<ul>
  <li><strong>Immediately after the procedure:</strong> service quality, comfort, and clarity of explanations</li>
  <li><strong>7–14 days later:</strong> satisfaction with initial results and recovery process</li>
  <li><strong>30 days later:</strong> final consolidated results, likelihood of return, and referral intent</li>
</ul>
<p>Sending the same generic survey at every touchpoint wastes the opportunity. With a conditional form, you adapt questions to the timing and type of procedure performed.</p>

<h2>Using conditional logic in clinic satisfaction surveys</h2>
<p>In SurveyFlow, you build the flow visually: the first question identifies the procedure performed, then routes the patient to procedure-specific questions. An NPS scale (0–10) captures the overall rating. Detractors (0–6) receive a specific open question to capture the issue; Promoters (9–10) receive a subtle invitation to refer the clinic to friends.</p>

<h2>Respondent control: authentic data</h2>
<p>With SurveyFlow's Respondents module, each patient receives a unique link and can only respond once — eliminating duplicates and ensuring feedback reflects real opinions.</p>

<h2>The real impact on patient retention</h2>
<p>Clinics that systematically collect feedback can identify friction points before they become cancellations. A patient giving a 6/10 is at risk of not returning — a survey that captures this signal in time enables proactive outreach from the care team.</p>

<p>Want to see how aesthetic clinics use SurveyFlow? <a href="/clinicas-esteticas">See use cases for aesthetic clinics →</a></p>
<p><a href="/">Start your satisfaction survey for free →</a></p>`,
  },
}
