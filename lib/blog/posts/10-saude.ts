import type { BlogPost } from "../types"

export const post: BlogPost = {
  slug: "formulario-triagem-elegibilidade-saude",
  enSlug: "patient-eligibility-screening-form-healthcare",
  category: "caso-de-uso",
  date: "2026-03-18",
  readTime: 4,
  pt: {
    title: "Formulário de Triagem e Elegibilidade para a Área da Saúde",
    description:
      "Como criar formulários digitais de triagem e elegibilidade para pesquisas clínicas, protocolos de atendimento e estudos de saúde — com bloqueio automático de inelegíveis e conformidade com a LGPD.",
    content: `<p>Na área da saúde, o formulário de triagem não é apenas uma formalidade — é um instrumento clínico e regulatório. Um <strong>formulário de elegibilidade e triagem digital</strong> bem construído pode reduzir erros de protocolo, economizar tempo das equipes e garantir que apenas os participantes adequados avancem em estudos clínicos ou protocolos de atendimento.</p>

<h2>Diferença entre triagem e anamnese digital</h2>
<ul>
  <li><strong>Triagem (screening):</strong> avalia se o paciente ou participante atende a critérios mínimos para participar de um estudo, programa ou protocolo de atendimento. Ocorre antes do primeiro contato clínico presencial.</li>
  <li><strong>Anamnese digital:</strong> coleta o histórico de saúde detalhado do paciente para apoiar o atendimento. Ocorre no início ou como preparação para a consulta.</li>
</ul>
<p>O SurveyFlow suporta ambos os fluxos — e permite que critérios de exclusão bloqueiem automaticamente participantes inelegíveis, sem necessidade de revisão manual caso a caso.</p>

<h2>Elegibilidade com bloqueio automático</h2>
<p>No SurveyFlow, você configura <strong>regras de elegibilidade</strong> diretamente em cada nó da pesquisa. Se um participante marca uma condição de exclusão — por exemplo, uso de medicamento contraindicado ou faixa etária fora do critério do estudo — a pesquisa exibe automaticamente uma tela de inelegibilidade com a mensagem apropriada. O participante não é exposto às perguntas seguintes, e a equipe não precisa revisar manualmente cada resposta.</p>

<h2>Fluxo condicional para critérios múltiplos</h2>
<p>Estudos clínicos e protocolos de saúde frequentemente têm critérios de inclusão e exclusão complexos e combinados. Com o editor visual do SurveyFlow, você mapeia cada critério como um nó e conecta os caminhos de forma clara e auditável:</p>
<ul>
  <li>Critério 1 não atendido → tela de exclusão com justificativa específica</li>
  <li>Critério 1 atendido → prossegue para verificação do critério 2</li>
  <li>Todos os critérios atendidos → formulário de consentimento informado ou agendamento</li>
</ul>

<h2>Aceite de termos e consentimento informado no fluxo</h2>
<p>O nó de apresentação do SurveyFlow suporta coleta de nome, e-mail e aceite de termos. Para pesquisas clínicas, você pode incluir o Termo de Consentimento Livre e Esclarecido (TCLE) diretamente no fluxo da pesquisa — com registro da aceitação explícita pelo participante antes de prosseguir.</p>

<h2>Privacidade e conformidade com a LGPD</h2>
<p>Dados de saúde são dados sensíveis sob a LGPD (Lei nº 13.709/2018) e exigem base legal específica para coleta e tratamento. O SurveyFlow atua como <strong>operadora de dados</strong> nesse contexto: armazena e processa as informações exclusivamente conforme as instruções do controlador (a instituição de saúde ou pesquisador), com isolamento por workspace, transmissão via HTTPS e cookies de sessão com expiração automática.</p>
<p>A responsabilidade pela definição da base legal, comunicação ao participante e atendimento dos direitos dos titulares é do controlador — que pode usar o SurveyFlow como ferramenta de coleta, com garantias técnicas de segurança e isolamento.</p>
<p>Saiba como a área da saúde usa o SurveyFlow: <a href="/healthcare">casos de uso para healthcare →</a></p>
<p><a href="/">Crie seu formulário de triagem gratuitamente →</a></p>`,
  },
  en: {
    title: "Patient Eligibility Screening Forms for Healthcare",
    description:
      "How to create digital eligibility and screening forms for clinical research, health studies, and care protocols — with automatic ineligibility blocking and LGPD compliance.",
    content: `<p>In healthcare, a screening form isn't just a formality — it's a clinical and regulatory instrument. A well-built <strong>digital eligibility and screening form</strong> can reduce protocol errors, save team time, and ensure only appropriate participants advance in clinical studies or care protocols.</p>

<h2>Screening vs. digital health history</h2>
<ul>
  <li><strong>Screening:</strong> evaluates whether a patient or participant meets minimum criteria to participate in a study, program, or care protocol — before the first in-person clinical contact.</li>
  <li><strong>Digital health history (anamnesis):</strong> collects the patient's detailed health history to support the care visit.</li>
</ul>
<p>SurveyFlow supports both flows — and lets exclusion criteria automatically block ineligible participants, without manual case-by-case review.</p>

<h2>Automatic ineligibility blocking</h2>
<p>In SurveyFlow, you configure <strong>eligibility rules</strong> directly on each survey node. If a participant marks an exclusion condition — e.g., a contraindicated medication or age outside the study criteria — the survey automatically displays an ineligibility screen with the appropriate message. The participant isn't exposed to subsequent questions, and the team doesn't need to review each response manually.</p>

<h2>Informed consent in the flow</h2>
<p>SurveyFlow's presentation node supports name, email, and terms acceptance collection. For clinical research, you can include the Informed Consent Form directly in the survey flow — with a record of explicit acceptance before the participant proceeds.</p>

<h2>Privacy and LGPD compliance</h2>
<p>Health data is sensitive data under Brazil's LGPD. SurveyFlow acts as a <strong>data processor</strong> in this context: storing and processing information exclusively per the controller's instructions, with workspace isolation, HTTPS transmission, and auto-expiring session cookies.</p>

<p>See how healthcare organizations use SurveyFlow: <a href="/healthcare">healthcare use cases →</a></p>
<p><a href="/">Create your screening form for free →</a></p>`,
  },
}
