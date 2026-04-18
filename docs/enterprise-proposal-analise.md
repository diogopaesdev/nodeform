# NodeForm — Avaliação de Adequação Enterprise
**Cliente:** Potencial cliente do setor de saúde / pesquisa médica  
**Data:** Abril de 2026  
**Versão:** 2.0 — atualizado com Sprint 1 e Sprint 2 concluídas

---

## 1. Visão Geral da Plataforma

O **NodeForm** é uma plataforma de construção e gestão de pesquisas baseada em fluxo visual (canvas), com lógica condicional avançada, sistema de pontuação por resposta, dashboard analítico e exportação de dados. Desenvolvida em **Next.js 15 + Firebase**, a plataforma oferece uma experiência moderna tanto para o criador da pesquisa quanto para o respondente.

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

#### Lógica Condicional (Skip Logic)
O sistema de fluxo é baseado em **nós e conexões** (nodes + edges), onde cada resposta pode direcionar o respondente a uma pergunta específica diferente. Suporta:
- Escolha única → questão específica por opção selecionada
- Múltipla escolha → próxima questão configurável
- Rating → roteamento condicional por valor
- Fallback para questão padrão quando nenhuma condição específica é atendida

#### Tela de Encerramento Personalizada
Existe um nó de tipo **End Screen** configurável com mensagem personalizada, exibição de score e layout customizável. Pode ser usado para mensagem de agradecimento ou conteúdo educacional em texto.

#### Autenticação Completa (Admin)
Sistema de login para criadores de pesquisa com três métodos:
- Google OAuth
- E-mail + Senha
- OTP (código enviado por e-mail)

#### Login Obrigatório para Respondentes *(novo — Sprint 1)*
Sistema de autenticação dedicado para respondentes, completamente separado do login de administradores:
- **OTP por e-mail:** respondente informa o e-mail, recebe código de 6 dígitos, acessa a pesquisa
- **SSO via plataforma parceira:** a plataforma do cliente (ex.: MOC) chama nossa API server-to-server com uma API Key, obtém um token de acesso único (5 min de validade), e redireciona o usuário já autenticado — sem necessidade de login adicional
- Sessão via cookie httpOnly (24h de validade)
- Tela de bloqueio amigável para pesquisas com login exigido

#### Participação Única por Usuário *(novo — Sprint 1)*
Controle completo de duplicidade vinculado ao respondente autenticado:
- Bloqueio automático de segunda tentativa com tela informativa
- Registro de participação em banco (`surveyParticipations`)
- Associação da resposta ao `respondentId`

#### Critérios de Elegibilidade *(novo — Sprint 2)*
Sistema de regras AND para controle de acesso granular:
- **Nível da pesquisa:** regras aplicadas antes de iniciar — respondente inelegível vê tela de bloqueio com a mensagem configurada
- **Nível do nó:** visibilidade condicional por questão — a pergunta só aparece se o respondente atender às regras (ex.: "apenas oncologistas veem esta pergunta")
- Operadores: `igual a`, `diferente de`, `está em`, `não está em`, `está preenchido`, `está vazio`
- Integrado ao **Workspace Profile Schema**: campos são selecionados via dropdown (sem digitação livre)

#### Cota de Respondentes com Encerramento Automático *(novo — Sprint 2)*
- Campo `maxResponses` configurável por pesquisa
- Ao atingir a cota, a pesquisa muda automaticamente para status `finished`
- Novos acessos após encerramento recebem resposta 410 com mensagem informativa

#### Sincronização de Dados Cadastrais *(novo — Sprint 1/2)*
- Dados do respondente (nome, e-mail, perfil) são sincronizados no momento do SSO
- Cada token SSO carrega um objeto `profile` com campos livres (specialty, sector, crm, etc.)
- Endpoint de **sync em massa** para atualizar até 500 respondentes de uma vez sem exigir login
- O perfil no NodeForm reflete sempre o estado mais recente enviado pela plataforma parceira

#### Voltar e Editar Respostas Anteriores
O respondente pode navegar para a questão anterior e alterar sua resposta. O score é recalculado automaticamente. Botão "Voltar à Pergunta Anterior" disponível durante toda a pesquisa.

#### Dashboard Analítico
Painel completo com:
- Contagem de respostas
- Score médio
- Distribuição percentual por opção em cada questão
- Gráficos de barra (biblioteca Recharts)
- Visualização individual de cada resposta com detalhamento completo

#### Exportação de Dados (CSV)
Exportação de todas as respostas em formato CSV com:
- Nome e e-mail do respondente
- Resposta por questão
- Score total (quando habilitado)
- Data/hora de conclusão
- Codificação UTF-8 com BOM (compatível com Excel)

#### Status e Ciclo de Vida da Pesquisa
Suporte a 4 estados: **Rascunho → Publicada → Encerrada → Arquivada**, com controle manual pelo administrador e encerramento automático por cota.

---

### 2.2 Requisitos Parcialmente Atendidos ⚠️

#### Questões Abertas (Texto Livre)
**Situação atual:** A plataforma suporta escolha única, múltipla escolha, rating e tela de apresentação. Questões de texto aberto (resposta dissertativa curta ou longa) **não estão implementadas**.  
**Esforço para implementar:** Baixo — adição de novo tipo de nó ao editor.

#### Redirect para Conteúdo Externo ao Concluir
**Situação atual:** A tela de conclusão é interna à plataforma. Redirect para URL externa (ex.: página educacional do cliente) não está implementado.  
**Esforço para implementar:** Baixo — configuração de URL de redirect por pesquisa.

#### Salvar Progresso e Retomar em Outra Sessão
**Situação atual:** O sistema permite voltar respostas **dentro da mesma sessão**. Se o respondente fechar o navegador, o progresso é perdido.  
**Esforço para implementar:** Médio — persistir estado parcial no banco por respondente + lógica de retomada.

#### Exportação em Excel (.xlsx)
**Situação atual:** Exportação disponível em CSV (abrível no Excel). Arquivo nativo .xlsx com formatação, abas e tabelas dinâmicas não está implementado.  
**Esforço para implementar:** Baixo — integração com biblioteca `xlsx` ou `exceljs`.

#### Dashboard com Cruzamento de Dados
**Situação atual:** Analytics por questão individualmente. Cruzamento entre respostas de diferentes questões (ex.: segmentação por perfil) não está disponível.  
**Esforço para implementar:** Alto — requer motor de análise cruzada e interface de construção de relatórios.

---

### 2.3 Requisitos Não Atendidos ❌

#### Painel de Liberação de Assinatura/Bonificação
**Situação atual:** Não existe painel ou ação administrativa para liberar benefícios (assinatura, acesso a conteúdo) para respondentes que concluíram a pesquisa.  
**Impacto:** Importante para o fluxo de bonificação pós-participação.  
**Esforço para implementar:** Médio — interface de revisão de respostas com ação de aprovação/liberação de assinatura.

---

## 3. Scorecard de Adequação

| # | Requisito | Status | Prioridade |
|---|---|:---:|:---:|
| 1 | Múltipla escolha e respostas abertas | ⚠️ Parcial | Alta |
| 2 | Peso por resposta (score) | ✅ Atendido | — |
| 3 | Critérios de elegibilidade | ✅ Atendido | — |
| 4 | Skip logic (lógica condicional) | ✅ Atendido | — |
| 5 | Redirect para agradecimento/conteúdo | ⚠️ Parcial | Média |
| 6 | Login obrigatório do respondente | ✅ Atendido | — |
| 7 | Participação única por usuário | ✅ Atendido | — |
| 8 | Pausar, retomar e editar respostas | ⚠️ Parcial | Alta |
| 9 | Sync de dados cadastrais | ✅ Atendido | — |
| 10 | Painel de liberação de assinatura | ❌ Falta | Alta |
| 11 | Cota de respondentes e encerramento automático | ✅ Atendido | — |
| 12 | Dashboard com cruzamento de dados | ⚠️ Parcial | Média |
| 13 | Exportação Excel | ⚠️ Parcial | Média |

**Legenda:** ✅ Atendido | ⚠️ Parcial | ❌ Não atendido

**Percentual de adequação atual: ~77%** *(era 50% na v1.0)*

---

## 4. Funcionalidades Adicionais da Plataforma

Além dos requisitos listados, a plataforma já conta com:

| Funcionalidade | Descrição |
|---|---|
| **Editor Visual (Canvas)** | Construção de pesquisas por arrastar e soltar, estilo Miro |
| **Geração por IA** | Criação automática de pesquisas a partir de um prompt de texto (OpenAI) |
| **Customização de Marca** | Logo, cor de destaque e nome da marca aplicados na pesquisa |
| **Suporte a Imagens** | Upload de imagens em questões e opções de resposta |
| **Embed/Iframe** | Embutir a pesquisa em qualquer página web com código gerado automaticamente |
| **Multi-idioma** | Interface em Português (PT-BR) e Inglês |
| **Rating** | Tipo de questão com avaliação por estrelas, configurável de 1 a N |
| **Múltiplos estados de pesquisa** | Rascunho, Publicada, Encerrada, Arquivada |
| **Módulo Respondentes (add-on)** | Base própria de respondentes por workspace, SSO, elegibilidade e sync de perfil — ativado via assinatura adicional |
| **SSO / Integração B2B** | API server-to-server para plataformas parceiras autenticarem seus usuários no NodeForm sem login adicional |
| **Workspace Profile Schema** | Admin define os campos de perfil dos respondentes; regras de elegibilidade usam dropdown tipado em vez de texto livre |
| **API Keys** | Chaves de integração por workspace com prefixo `nfk_`, hash SHA-256 em repouso, exibidas em texto apenas na criação |

---

## 5. Plano de Desenvolvimento para Adequação Completa

### ✅ Sprint 1 — Fundação de Identidade do Respondente (concluída)
- [x] Login obrigatório do respondente para iniciar pesquisa (OTP + SSO)
- [x] Vinculação de resposta ao usuário autenticado
- [x] Bloqueio de participação duplicada (por `respondentId`)
- [x] Sincronização de perfil do respondente via SSO e sync em massa
- [ ] Tipo de questão: texto aberto (curto e longo) *(pendente)*

### ✅ Sprint 2 — Controle de Pesquisa (concluída)
- [x] Cota máxima de respondentes com encerramento automático
- [x] Critérios de elegibilidade em nível de pesquisa e de questão
- [x] Workspace Profile Schema com rule builder tipado
- [ ] Redirect para URL externa ao concluir *(pendente)*
- [ ] Exportação em formato .xlsx nativo *(pendente)*

### Sprint 3 — Experiência do Respondente (próxima)
- [ ] Tipo de questão: texto aberto (curto e longo)
- [ ] Redirect para URL externa ao concluir
- [ ] Exportação em formato .xlsx nativo
- [ ] Salvar progresso parcial e retomar em outra sessão

### Sprint 4 — Painel Administrativo Avançado
- [ ] Interface de revisão e aprovação de respondentes
- [ ] Ação de liberação de assinatura/bonificação por respondente
- [ ] Marcação de respondentes inelegíveis com exclusão da cota
- [ ] Cruzamento de dados entre questões no dashboard

**Estimativa restante:** 3 a 4 semanas de desenvolvimento

---

## 6. Conclusão

O NodeForm evoluiu significativamente desde a avaliação inicial. Com as sprints 1 e 2 concluídas, os requisitos mais críticos para o caso de uso médico estão atendidos: autenticação de respondentes, participação única, elegibilidade por perfil (nível pesquisa e nível questão), cota automática e sincronização de dados cadastrais via SSO.

A arquitetura B2B2C implementada permite que a plataforma parceira (ex.: MOC) conecte sua base de médicos ao NodeForm de forma transparente — o médico logado na plataforma do cliente acessa a pesquisa já autenticado, sem fricção adicional.

**Percentual de adequação atual: ~77%**  
**Percentual de adequação pós-Sprint 3 e 4: 100%**

---

*Documento atualizado em Abril de 2026 — NodeForm Platform Assessment v2.0*
