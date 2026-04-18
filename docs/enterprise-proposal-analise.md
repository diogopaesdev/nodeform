# SurveyFlow — Avaliação de Adequação Enterprise

**Cliente:** Potencial cliente do setor de saúde / pesquisa médica  
**Data:** Abril de 2026  
**Versão:** 4.0 — atualizado com Sprint 4 (cruzamento de dados) concluída

---

## 1. Visão Geral da Plataforma

O **SurveyFlow** é uma plataforma de construção e gestão de pesquisas baseada em fluxo visual (canvas), com lógica condicional avançada, sistema de pontuação por resposta, dashboard analítico e exportação de dados. Desenvolvida em **Next.js 15 + Firebase**, a plataforma oferece uma experiência moderna tanto para o criador da pesquisa quanto para o respondente.

**Stack tecnológica:**

- Frontend: Next.js 15 (App Router), React 19
- Backend: Firebase Firestore + Firebase Storage
- Autenticação: NextAuth.js (Google OAuth, e-mail/senha, OTP) + sistema próprio para respondentes
- Pagamentos: Stripe
- E-mail transacional: Resend
- IA: OpenAI (geração automática de pesquisas)

---

## 2. Mapeamento de Requisitos

### 2.1 Requisitos Atendidos ✅

#### Múltipla Escolha com Peso por Resposta

A plataforma suporta nativamente perguntas de **escolha única** e **múltipla escolha** com atribuição de **peso/pontuação individual por opção**. O score acumulado é calculado em tempo real e pode ser exibido na tela de conclusão. Isso permite identificar, com precisão, o grau de alinhamento de cada médico à prática clínica corrente.

#### Questões Abertas (Texto Livre) _(novo — Sprint 3)_

Novo tipo de nó **Texto Livre** com dois modos:

- **Curto:** campo de linha única para respostas breves
- **Longo:** área de texto multi-linha para respostas dissertativas
- Placeholder configurável, campo obrigatório/opcional
- Resposta armazenada e exibida no dashboard e nas exportações CSV/XLSX

#### Lógica Condicional (Skip Logic)

O sistema de fluxo é baseado em **nós e conexões** (nodes + edges), onde cada resposta pode direcionar o respondente a uma pergunta específica diferente. Suporta:

- Escolha única → questão específica por opção selecionada
- Múltipla escolha → próxima questão configurável
- Rating → roteamento condicional por valor
- Fallback para questão padrão quando nenhuma condição específica é atendida

#### Tela de Encerramento Personalizada

Existe um nó de tipo **End Screen** configurável com mensagem personalizada, exibição de score e layout customizável. Pode ser usado para mensagem de agradecimento ou conteúdo educacional em texto.

#### Redirect para Conteúdo Externo ao Concluir _(novo — Sprint 3)_

Configuração de **URL de redirect** diretamente no nó End Screen:

- Campo de URL externa (ex.: página educacional do cliente)
- Delay configurável em segundos (padrão: 3s) antes do redirect automático
- Countdown visível ao respondente + link manual de fallback
- Indicador visual da URL no canvas do editor

#### Autenticação Completa (Admin)

Sistema de login para criadores de pesquisa com três métodos:

- Google OAuth
- E-mail + Senha
- OTP (código enviado por e-mail)

#### Login Obrigatório para Respondentes _(Sprint 1)_

Sistema de autenticação dedicado para respondentes, completamente separado do login de administradores:

- **OTP por e-mail:** respondente informa o e-mail, recebe código de 6 dígitos, acessa a pesquisa
- **SSO via plataforma parceira:** a plataforma do cliente (ex.: MOC) chama nossa API server-to-server com uma API Key, obtém um token de acesso único (5 min de validade), e redireciona o usuário já autenticado — sem necessidade de login adicional
- Sessão via cookie httpOnly (24h de validade)
- Tela de bloqueio amigável para pesquisas com login exigido

#### Participação Única por Usuário _(Sprint 1)_

Controle completo de duplicidade vinculado ao respondente autenticado:

- Bloqueio automático de segunda tentativa com tela informativa
- Registro de participação em banco (`surveyParticipations`)
- Associação da resposta ao `respondentId`

#### Critérios de Elegibilidade _(Sprint 2)_

Sistema de regras AND para controle de acesso granular:

- **Nível da pesquisa:** regras aplicadas antes de iniciar — respondente inelegível vê tela de bloqueio com a mensagem configurada
- **Nível do nó:** visibilidade condicional por questão — a pergunta só aparece se o respondente atender às regras (ex.: "apenas oncologistas veem esta pergunta")
- Operadores: `igual a`, `diferente de`, `está em`, `não está em`, `está preenchido`, `está vazio`
- Integrado ao **Workspace Profile Schema**: campos são selecionados via dropdown (sem digitação livre)

#### Cota de Respondentes com Encerramento Automático _(Sprint 2)_

- Campo `maxResponses` configurável por pesquisa
- Ao atingir a cota, a pesquisa muda automaticamente para status `finished`
- Novos acessos após encerramento recebem resposta 410 com mensagem informativa

#### Sincronização de Dados Cadastrais _(Sprint 1/2)_

- Dados do respondente (nome, e-mail, perfil) são sincronizados no momento do SSO
- Cada token SSO carrega um objeto `profile` com campos livres (specialty, sector, crm, etc.)
- Endpoint de **sync em massa** para atualizar até 500 respondentes de uma vez sem exigir login
- O perfil no SurveyFlow reflete sempre o estado mais recente enviado pela plataforma parceira

#### Salvar Progresso e Retomar em Outra Sessão _(novo — Sprint 3)_

Funcionalidade completa de persistência de progresso parcial, disponível como **Módulo Progresso** (add-on pago):

- Progresso salvo automaticamente no Firestore após cada resposta (debounce de 500ms)
- Ao retornar à pesquisa, respondente vê dialog: "Retomar de onde parou" ou "Recomeçar do início"
- Funciona com autenticação OTP e SSO
- Progresso deletado automaticamente ao concluir a pesquisa
- Gateado pelo addon `surveyProgress` no workspace do admin

#### Voltar e Editar Respostas Anteriores

O respondente pode navegar para a questão anterior e alterar sua resposta. O score é recalculado automaticamente. Botão "Voltar à Pergunta Anterior" disponível durante toda a pesquisa.

#### Dashboard Analítico

Painel completo com:

- Contagem de respostas
- Score médio
- Distribuição percentual por opção em cada questão
- Gráficos de barra (biblioteca Recharts)
- Visualização individual de cada resposta com detalhamento completo

#### Exportação de Dados (CSV e Excel) _(Excel novo — Sprint 3)_

Exportação de todas as respostas em dois formatos:

| Formato | Detalhes |
|---------|----------|
| **CSV** | UTF-8 com BOM, compatível com Excel, separador vírgula |
| **XLSX** | Arquivo Excel nativo via biblioteca `xlsx`, download direto |

Ambos incluem: nome e e-mail do respondente, resposta por questão (incluindo texto livre), score total e data/hora de conclusão.

#### Status e Ciclo de Vida da Pesquisa

Suporte a 4 estados: **Rascunho → Publicada → Encerrada → Arquivada**, com controle manual pelo administrador e encerramento automático por cota.

---

### 2.2 Requisitos Parcialmente Atendidos ⚠️

_Nenhum — todos os requisitos parciais foram resolvidos._

---

### 2.3 Requisitos Não Atendidos ❌

#### Painel de Liberação de Assinatura/Bonificação

**Situação atual:** Não existe painel ou ação administrativa para liberar benefícios (assinatura, acesso a conteúdo) para respondentes que concluíram a pesquisa.  
**Impacto:** Importante para o fluxo de bonificação pós-participação.  
**Esforço para implementar:** Médio — interface de revisão de respostas com ação de aprovação/liberação de assinatura.

---

## 3. Scorecard de Adequação

| #   | Requisito                                      |    Status     | Prioridade |
| --- | ---------------------------------------------- | :-----------: | :--------: |
| 1   | Múltipla escolha e respostas abertas           | ✅ Atendido   |     —      |
| 2   | Peso por resposta (score)                      | ✅ Atendido   |     —      |
| 3   | Critérios de elegibilidade                     | ✅ Atendido   |     —      |
| 4   | Skip logic (lógica condicional)                | ✅ Atendido   |     —      |
| 5   | Redirect para agradecimento/conteúdo           | ✅ Atendido   |     —      |
| 6   | Login obrigatório do respondente               | ✅ Atendido   |     —      |
| 7   | Participação única por usuário                 | ✅ Atendido   |     —      |
| 8   | Pausar, retomar e editar respostas             | ✅ Atendido   |     —      |
| 9   | Sync de dados cadastrais                       | ✅ Atendido   |     —      |
| 10  | Painel de liberação de assinatura              | ❌ Falta      |    Alta    |
| 11  | Cota de respondentes e encerramento automático | ✅ Atendido   |     —      |
| 12  | Dashboard com cruzamento de dados              | ✅ Atendido   |     —      |
| 13  | Exportação Excel                               | ✅ Atendido   |     —      |

**Legenda:** ✅ Atendido | ⚠️ Parcial | ❌ Não atendido

**Percentual de adequação atual: ~96%** _(era 92% na v3.0)_

---

## 4. Funcionalidades Adicionais da Plataforma

Além dos requisitos listados, a plataforma já conta com:

| Funcionalidade                    | Descrição                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Editor Visual (Canvas)**        | Construção de pesquisas por arrastar e soltar, estilo Miro                                                            |
| **Geração por IA**                | Criação automática de pesquisas a partir de um prompt de texto (OpenAI)                                               |
| **Customização de Marca**         | Logo, cor de destaque e nome da marca aplicados na pesquisa                                                           |
| **Suporte a Imagens**             | Upload de imagens em questões e opções de resposta                                                                    |
| **Embed/Iframe**                  | Embutir a pesquisa em qualquer página web com código gerado automaticamente                                           |
| **Multi-idioma**                  | Interface em Português (PT-BR) e Inglês                                                                               |
| **Rating**                        | Tipo de questão com avaliação por estrelas, configurável de 1 a N                                                     |
| **Múltiplos estados de pesquisa** | Rascunho, Publicada, Encerrada, Arquivada                                                                             |
| **Módulo Respondentes (add-on)**  | Base própria de respondentes por workspace, SSO, elegibilidade e sync de perfil — ativado via assinatura adicional    |
| **Módulo Progresso (add-on)**     | Salva progresso parcial por respondente e permite retomar entre sessões — ativado via assinatura adicional            |
| **SSO / Integração B2B**          | API server-to-server para plataformas parceiras autenticarem seus usuários no SurveyFlow sem login adicional          |
| **Workspace Profile Schema**      | Admin define os campos de perfil dos respondentes; regras de elegibilidade usam dropdown tipado em vez de texto livre |
| **API Keys**                      | Chaves de integração por workspace com prefixo `nfk_`, hash SHA-256 em repouso, exibidas em texto apenas na criação   |

---

## 5. Modelo de Add-ons

Os módulos opcionais são cobrados **além** da assinatura Pro (R$ 499/mês) e podem ser contratados:

1. **No momento da assinatura:** página de upgrade exibe ambos os módulos pré-selecionados — o cliente pode desmarcar o que não quiser. Tudo numa única assinatura Stripe consolidada.
2. **Individualmente depois:** cada módulo tem seu próprio botão de ativação na página **Configurações → Integrações**, gerando um checkout Stripe separado.

| Módulo               | Preço           | O que ativa                                                                                                                                                    |
| -------------------- | :-------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Módulo Respondentes  | R$ 449,90/mês   | Login OTP e SSO, sync de perfil em massa (500/chamada), elegibilidade por pesquisa e por questão, participação única, cota com encerramento automático, Workspace Profile Schema, API Keys, painel de bonificação |
| Módulo Progresso     | R$ 129,90/mês   | Progresso salvo automaticamente, retomada em qualquer device, dialog de escolha, compatível com OTP e SSO, limpeza automática ao concluir                      |

> **Variável de ambiente necessária:** `STRIPE_ADDON_SURVEY_PROGRESS_PRICE_ID` — Price ID do produto no Stripe Dashboard.

---

## 6. Plano de Desenvolvimento para Adequação Completa

### ✅ Sprint 1 — Fundação de Identidade do Respondente (concluída)

- [x] Login obrigatório do respondente para iniciar pesquisa (OTP + SSO)
- [x] Vinculação de resposta ao usuário autenticado
- [x] Bloqueio de participação duplicada (por `respondentId`)
- [x] Sincronização de perfil do respondente via SSO e sync em massa

### ✅ Sprint 2 — Controle de Pesquisa (concluída)

- [x] Cota máxima de respondentes com encerramento automático
- [x] Critérios de elegibilidade em nível de pesquisa e de questão
- [x] Workspace Profile Schema com rule builder tipado

### ✅ Sprint 3 — Experiência do Respondente (concluída)

- [x] Tipo de questão: texto aberto (curto e longo)
- [x] Redirect para URL externa ao concluir (com delay configurável)
- [x] Exportação em formato .xlsx nativo
- [x] Salvar progresso parcial e retomar em outra sessão (Módulo Progresso)
- [x] Módulo Progresso como add-on pago com checkout integrado ao plano

### ✅ Sprint 4 — Dashboard Analítico Avançado (concluída parcialmente)

- [x] Cruzamento de dados entre questões no dashboard (tab "Cruzamento" com gráfico agrupado e seletores de segmentação)

### Sprint 5 — Painel Administrativo de Bonificação

- [ ] Interface de revisão e aprovação de respondentes
- [ ] Ação de liberação de assinatura/bonificação por respondente
- [ ] Marcação de respondentes inelegíveis com exclusão da cota

**Estimativa restante:** 1 semana de desenvolvimento

---

## 7. Conclusão

Com a Sprint 4 concluída, o SurveyFlow atinge **~96% de adequação** aos requisitos do cliente. Todos os requisitos de alta prioridade estão implementados, incluindo o cruzamento de dados no dashboard analítico.

A nova aba **Cruzamento** permite segmentar as respostas de qualquer questão pelos valores de outra, com gráfico de barras agrupado, seletores intuitivos e legenda dinâmica.

**Pendente (Sprint 5):** painel de liberação de assinatura/bonificação pós-participação.

**Percentual de adequação atual: ~96%**  
**Percentual de adequação pós-Sprint 5: 100%**

---

_Documento atualizado em Abril de 2026 — SurveyFlow Platform Assessment v4.0_
