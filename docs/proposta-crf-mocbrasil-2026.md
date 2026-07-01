# Proposta Comercial — Módulo CRF para MocBrasil

**SurveyFlow · Junho de 2026**

---

## Apresentação

A MocBrasil já utiliza o SurveyFlow como plataforma de coleta de dados e pesquisas. Esta proposta apresenta o desenvolvimento de funcionalidades específicas para uso da plataforma como **sistema de Fichas Clínicas (CRF — Case Report Form)**, permitindo que profissionais de saúde registrem dados clínicos de pacientes de forma estruturada, rastreável e segura.

O SurveyFlow já conta com a base necessária: fluxo condicional, identificação de respondentes via SSO, schema de perfil de paciente, armazenamento com snapshot histórico e integração server-to-server por API. As funcionalidades descritas nesta proposta complementam essa base para o contexto clínico.

---

## Escopo do Desenvolvimento

### 1. Campo Numérico com Validação de Range

**5 horas · R$ 500,00**

Novo tipo de nó no editor visual com entrada numérica. Permite configurar valor mínimo e máximo (ex: pressão arterial entre 60–200 mmHg, glicemia entre 20–600 mg/dL). Inclui mensagem de erro personalizada para valores fora do intervalo e armazenamento no snapshot histórico da ficha.

---

### 2. Campo de Data com Seletor

**4 horas · R$ 400,00**

Novo tipo de nó com date picker nativo no preenchimento, formatação em padrão brasileiro (DD/MM/AAAA) e armazenamento em ISO 8601. Suporta configuração de data mínima e máxima (ex: não permitir datas futuras para data de nascimento). Exibição formatada no dashboard de respostas.

---

### 3. Multi-Visita — Múltiplos Preenchimentos por Paciente

**8 horas · R$ 800,00**

Atualmente a plataforma bloqueia que o mesmo paciente preencha a mesma pesquisa mais de uma vez. Esta funcionalidade adiciona a opção **"Permitir múltiplas visitas"** no survey, numerando cada preenchimento como Visita 1, Visita 2, etc. O dashboard exibe o histórico completo de visitas por paciente, com data e pontuação de cada uma. Fundamental para acompanhamento longitudinal de pacientes.

---

### 4. Identificação do Profissional de Saúde

**5 horas · R$ 500,00**

Mecanismo para registrar qual profissional (médico, enfermeiro, pesquisador) preencheu a ficha, separado da identidade do paciente. Implementado via campo fixo no início da ficha (nome/CRM/matrícula) ou integração SSO com o sistema de profissionais da MocBrasil. O nome do profissional é salvo junto à resposta e exibido no dashboard.

---

### 5. Tela de Revisão e Confirmação

**4 horas · R$ 400,00**

Antes da submissão final, o profissional visualiza um resumo de todas as respostas preenchidas na ficha. A confirmação exige um checkbox explícito ("Confirmo que os dados estão corretos e completos"). Garante que nenhuma ficha seja enviada por acidente e reduz erros de preenchimento.

---

### 6. Auditoria de Respostas

**10 horas · R$ 1.000,00**

Registro completo de criação e edição de fichas: autor, data/hora e valores anteriores em caso de alteração. O dashboard exibe o histórico de auditoria de cada resposta. Funcionalidade essencial para conformidade com regulatórios do CFM e protocolos de ensaios clínicos.

---

## Resumo Financeiro

| #   | Funcionalidade                        | Horas   | Valor           |
| --- | ------------------------------------- | ------- | --------------- |
| 1   | Campo numérico com validação de range | 5h      | R$ 500,00       |
| 2   | Campo de data com seletor             | 4h      | R$ 400,00       |
| 3   | Multi-visita por paciente             | 8h      | R$ 800,00       |
| 4   | Identificação do profissional         | 5h      | R$ 500,00       |
| 5   | Tela de revisão e confirmação         | 4h      | R$ 400,00       |
| 6   | Auditoria de respostas                | 10h     | R$ 1.000,00     |
|     | **Total**                             | **36h** | **R$ 3.600,00** |

> **Taxa horária:** R$ 100,00/hora  
> **Prazo estimado:** 3–4 semanas após aprovação

---

## O Que Já Está Incluso na Assinatura Atual

A MocBrasil já dispõe, sem custo adicional, de:

- Editor visual de fichas com lógica condicional
- Identificação do paciente via SSO (sem tela de login)
- Schema de perfil do paciente (nome, CPF, especialização, plano, etc.)
- Campos de texto, escolha única, múltipla escolha e escala
- Máscaras de entrada (CPF, data, telefone, CEP)
- Armazenamento histórico imutável das respostas com snapshot dos campos
- API de integração com autenticação por API Key
- Dashboard de respostas com exportação CSV e XLSX
- Painel de participações com histórico por paciente

---

## Condições Comerciais

- **Pagamento:** 30% na aprovação da proposta, 70% na entrega
- **Prazo:** Início imediato após aprovação e primeiro pagamento
- **Garantia:** 30 dias de correção de bugs sem custo adicional após entrega

---

## Contato

**Jhow Paes**  
SurveyFlow / NodeForm  
jhowcrpaes@gmail.com

---

_Proposta válida por 30 dias a partir da data de emissão._
