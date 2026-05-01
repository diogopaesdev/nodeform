# Templates Pré-definidos por Segmento

Templates são surveys completos com nodes + edges pré-configurados, prontos para uso imediato. O usuário abre, ajusta os textos conforme sua realidade, e publica — sem partir do zero e sem precisar usar créditos de IA.

---

## Como funciona tecnicamente

Cada template é um objeto que segue a interface `Survey` em `types/survey.ts`. O núcleo são dois arrays:

- **`nodes`** — perguntas e telas, cada uma com `id`, `type`, `position` e `data`
- **`edges`** — conexões entre nodes; para `singleChoice` há uma edge por opção (`data.optionId`); para os demais tipos, uma única edge com `sourceHandle: "source"`

O layout padrão dos nodes usa `x: 400` e `y: index * 220` (espaçamento vertical de 220px entre cada node).

Regras obrigatórias:
- Primeiro node: sempre `presentation`
- Último node: sempre `endScreen`
- Total de nodes: entre 3 e 8

---

## Onde registrar os templates

Criar o arquivo `lib/templates/index.ts` exportando um array de `SurveyTemplate`:

```ts
export interface SurveyTemplate {
  id: string;           // slug único: "clinicas-esteticas-triagem"
  segment: string;      // segmento de exibição: "clinicas-esteticas"
  title: string;        // nome do template no picker
  description: string;  // uma linha descrevendo o caso de uso
  nodes: SurveyNode[];
  edges: SurveyEdge[];
}
```

Na criação de survey, o usuário escolhe um template → o sistema clona os arrays `nodes` e `edges` (gerando novos IDs) e cria um survey novo no Firestore com `status: "draft"`.

---

## Templates por segmento

---

### 1. Clínicas Estéticas — Triagem de Pacientes

**Caso de uso:** Qualificar leads antes do primeiro contato humano, identificando procedimento de interesse, histórico e disponibilidade.

**Fluxo:**

```
[Apresentação]
    ↓
[Qual procedimento te interessa?]  ← singleChoice (4 opções)
    ↓ (todas as opções levam ao próximo)
[Você já fez algum procedimento estético antes?]  ← singleChoice
    ↓
[Qual a sua disponibilidade para agendamento?]  ← singleChoice
    ↓
[Telefone para contato]  ← textInput
    ↓
[Tela final]
```

**Nodes:**

| # | Tipo | Título | Detalhe |
|---|------|--------|---------|
| 1 | `presentation` | Bem-vindo à nossa triagem | `collectName: true`, `collectEmail: true` |
| 2 | `singleChoice` | Qual procedimento você tem interesse? | Harmonização facial · Limpeza de pele · Laser / fototerapia · Outro |
| 3 | `singleChoice` | Você já realizou algum procedimento estético antes? | Sim, tenho experiência · Não, seria minha primeira vez |
| 4 | `singleChoice` | Qual a sua disponibilidade preferida? | Manhã · Tarde · Noite · Qualquer horário |
| 5 | `textInput` | Informe seu telefone ou WhatsApp | `placeholder: "(11) 9 0000-0000"`, `required: true` |
| 6 | `endScreen` | Recebemos sua solicitação! | "Nossa equipe entrará em contato em até 24h para confirmar seu horário." |

**Edges:** todas sequenciais; no node 2 (singleChoice) cada opção tem sua edge com `data.optionId` apontando para o node 3.

---

### 2. Imobiliárias — Qualificação de Lead

**Caso de uso:** Segmentar leads por intenção (compra vs. aluguel), perfil de imóvel e urgência para priorizar o atendimento do corretor.

**Fluxo:**

```
[Apresentação]
    ↓
[Comprar ou alugar?]  ← singleChoice
    ↓
[Tipo de imóvel]  ← singleChoice
    ↓
[Faixa de valor]  ← singleChoice
    ↓
[Urgência]  ← singleChoice
    ↓
[Região de interesse]  ← textInput
    ↓
[Tela final]
```

**Nodes:**

| # | Tipo | Título | Detalhe |
|---|------|--------|---------|
| 1 | `presentation` | Encontre o imóvel ideal | `collectName: true`, `collectEmail: true` |
| 2 | `singleChoice` | Você busca comprar ou alugar? | Comprar · Alugar |
| 3 | `singleChoice` | Qual tipo de imóvel? | Apartamento · Casa · Comercial · Terreno |
| 4 | `singleChoice` | Qual a sua faixa de valor? | Até R$ 300 mil · R$ 300–600 mil · R$ 600 mil–1 mi · Acima de R$ 1 mi |
| 5 | `singleChoice` | Qual a sua urgência? | Imediata (até 30 dias) · Curto prazo (até 3 meses) · Sem pressa (6 meses+) |
| 6 | `textInput` | Qual bairro ou região você prefere? | `placeholder: "Ex: Pinheiros, Barra da Tijuca..."` |
| 7 | `endScreen` | Perfeito! Um corretor vai entrar em contato | "Selecionaremos os melhores imóveis para o seu perfil." |

---

### 3. Pesquisa de Mercado — Hábitos do Consumidor

**Caso de uso:** Coletar dados quantitativos e qualitativos sobre comportamento de compra para análise de segmento.

**Fluxo:**

```
[Apresentação]
    ↓
[Faixa etária]  ← singleChoice
    ↓
[Frequência de compra]  ← singleChoice
    ↓
[Fatores de decisão]  ← multipleChoice
    ↓
[Satisfação com produto atual]  ← rating (1–5)
    ↓
[Sugestões]  ← textInput (longo)
    ↓
[Tela final]
```

**Nodes:**

| # | Tipo | Título | Detalhe |
|---|------|--------|---------|
| 1 | `presentation` | Pesquisa rápida — 2 minutos | `collectName: false`, `collectEmail: true` |
| 2 | `singleChoice` | Qual a sua faixa etária? | 18–24 · 25–34 · 35–44 · 45–54 · 55+ |
| 3 | `singleChoice` | Com que frequência você compra nessa categoria? | Semanalmente · Mensalmente · A cada 3 meses · Raramente |
| 4 | `multipleChoice` | O que mais influencia sua decisão de compra? | Preço · Qualidade · Indicação · Marca · Conveniência |
| 5 | `rating` | Qual seu nível de satisfação com o produto que usa hoje? | `minValue: 1`, `maxValue: 5`, `minLabel: "Insatisfeito"`, `maxLabel: "Muito satisfeito"` |
| 6 | `textInput` | Tem alguma sugestão ou comentário? | `isLong: true`, `required: false`, `placeholder: "Escreva o que quiser..."` |
| 7 | `endScreen` | Obrigado pela sua participação! | "Suas respostas são muito importantes para nós." |

---

### 4. Infoprodutores — Diagnóstico do Público

**Caso de uso:** Entender o nível, dores e objetivos da audiência para segmentar leads e personalizar a comunicação.

**Fluxo:**

```
[Apresentação]
    ↓
[Maior desafio hoje]  ← singleChoice
    ↓
[Nível de experiência]  ← singleChoice
    ↓
[Ferramentas que usa]  ← multipleChoice
    ↓
[Objetivo nos próximos 3 meses]  ← singleChoice
    ↓
[O que te impede de chegar lá?]  ← textInput (longo)
    ↓
[Tela final]
```

**Nodes:**

| # | Tipo | Título | Detalhe |
|---|------|--------|---------|
| 1 | `presentation` | Diagnóstico gratuito | `collectName: true`, `collectEmail: true` |
| 2 | `singleChoice` | Qual o seu maior desafio hoje? | Gerar audiência · Converter vendas · Criar conteúdo · Escalar receita |
| 3 | `singleChoice` | Em qual nível você se encontra? | Iniciante (começando do zero) · Intermediário (já tenho resultados) · Avançado (quero escalar) |
| 4 | `multipleChoice` | Quais ferramentas você já usa? | Instagram · YouTube · E-mail marketing · Tráfego pago · Nenhuma ainda |
| 5 | `singleChoice` | Qual o seu objetivo nos próximos 3 meses? | Lançar meu primeiro produto · Dobrar minha receita · Construir minha audiência · Automatizar processos |
| 6 | `textInput` | O que te impede de alcançar esse objetivo? | `isLong: true`, `placeholder: "Seja específico — isso nos ajuda a personalizar sua jornada"` |
| 7 | `endScreen` | Diagnóstico recebido! | "Analisaremos suas respostas e enviaremos um conteúdo personalizado para você." |

---

### 5. Healthcare — Triagem Clínica

**Caso de uso:** Coletar dados do paciente antes da consulta para direcionar ao especialista correto e reduzir o tempo de atendimento.

**Fluxo:**

```
[Apresentação + aceite LGPD]
    ↓
[Motivo da consulta]  ← singleChoice
    ↓
[Sintomas presentes]  ← multipleChoice
    ↓
[Tratamento anterior]  ← singleChoice
    ↓
[Estado de saúde geral]  ← rating (1–10)
    ↓
[Histórico relevante]  ← textInput (longo)
    ↓
[Tela final]
```

**Nodes:**

| # | Tipo | Título | Detalhe |
|---|------|--------|---------|
| 1 | `presentation` | Triagem clínica | `collectName: true`, `collectEmail: true`, `collectTerms: true`, `termsRequired: true` |
| 2 | `singleChoice` | Qual o principal motivo da consulta? | Acompanhamento de rotina · Sintoma novo · Retorno · Segunda opinião |
| 3 | `multipleChoice` | Você apresenta algum destes sintomas? | Dor persistente · Fadiga · Alterações de humor · Insônia · Nenhum dos acima |
| 4 | `singleChoice` | Já realizou tratamento para este problema antes? | Sim, com boa resposta · Sim, sem melhora · Não, é a primeira vez |
| 5 | `rating` | Como você avalia seu estado de saúde geral? | `minValue: 1`, `maxValue: 10`, `minLabel: "Muito ruim"`, `maxLabel: "Excelente"` |
| 6 | `textInput` | Descreva brevemente seu histórico médico relevante | `isLong: true`, `placeholder: "Cirurgias, alergias, medicamentos em uso..."` |
| 7 | `endScreen` | Triagem concluída | "Suas informações foram registradas. O profissional revisará antes da consulta." |

---

### 6. Eventos — Inscrição e Segmentação

**Caso de uso:** Capturar inscrições com dados de segmentação para personalizar a comunicação pré-evento e organizar trilhas.

**Fluxo:**

```
[Apresentação]
    ↓
[Perfil profissional]  ← singleChoice
    ↓
[Motivo de participação]  ← singleChoice
    ↓
[Temas de interesse]  ← multipleChoice
    ↓
[Como ficou sabendo]  ← singleChoice
    ↓
[Necessidades especiais]  ← textInput
    ↓
[Tela final + confirmação]
```

**Nodes:**

| # | Tipo | Título | Detalhe |
|---|------|--------|---------|
| 1 | `presentation` | Inscrição no evento | `collectName: true`, `collectEmail: true` |
| 2 | `singleChoice` | Qual o seu perfil profissional? | Empresário / Empreendedor · Profissional CLT · Freelancer / Autônomo · Estudante |
| 3 | `singleChoice` | Qual o principal motivo para participar? | Networking · Aprendizado · Negócios · Conhecer palestrantes |
| 4 | `multipleChoice` | Quais temas mais te interessam? | Marketing · Tecnologia · Finanças · Liderança · Vendas · Inovação |
| 5 | `singleChoice` | Como ficou sabendo do evento? | Instagram · Indicação de amigo · E-mail · LinkedIn · Google |
| 6 | `textInput` | Alguma necessidade especial ou observação? | `required: false`, `placeholder: "Acessibilidade, restrição alimentar, etc."` |
| 7 | `endScreen` | Inscrição confirmada! | "Você receberá um e-mail com todos os detalhes. Até lá!" |

---

## Implementação sugerida

### 1. Criar os dados dos templates

```
lib/
  templates/
    index.ts          ← exporta SURVEY_TEMPLATES: SurveyTemplate[]
    clinicas-esteticas.ts
    imobiliarias.ts
    pesquisa-de-mercado.ts
    infoprodutores.ts
    healthcare.ts
    eventos.ts
```

Cada arquivo exporta um objeto `SurveyTemplate` com nodes e edges prontos, IDs fixos (ex: `"tpl_ce_node_1"`).

### 2. Clonar na criação de survey

Quando o usuário escolhe um template, a API de criação deve:

1. Receber `templateId` no body
2. Buscar o template em `SURVEY_TEMPLATES`
3. Gerar novos IDs para todos os nodes e edges (para evitar conflito entre surveys)
4. Criar o survey no Firestore com `status: "draft"`

```ts
// Exemplo simplificado
function cloneTemplate(template: SurveyTemplate, newSurveyId: string) {
  const idMap = new Map<string, string>();
  const nodes = template.nodes.map((n, i) => {
    const newId = `node_${Date.now()}_${i}`;
    idMap.set(n.id, newId);
    return { ...n, id: newId };
  });
  const edges = template.edges.map((e, i) => ({
    ...e,
    id: `edge_${Date.now()}_${i}`,
    source: idMap.get(e.source)!,
    target: idMap.get(e.target)!,
  }));
  return { nodes, edges };
}
```

### 3. UI no editor

No modal "Criar survey", adicionar uma aba **"Começar com template"** listando os templates disponíveis agrupados por segmento. Um clique já abre o editor com os nodes carregados.

---

## Próximos passos

- [ ] Criar `lib/templates/` com os 6 arquivos de dados
- [ ] Atualizar `POST /api/surveys` para aceitar `templateId` como alternativa ao survey vazio
- [ ] Adicionar aba de templates no modal de criação de survey
- [ ] (Futuro) Permitir que usuários salvem surveys próprios como templates privados
