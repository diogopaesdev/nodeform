# NodeForm — Avaliação de Adequação Enterprise
**Cliente:** Potencial cliente do setor de saúde / pesquisa médica  
**Data:** Abril de 2026  
**Versão:** 1.0  

---

## 1. Visão Geral da Plataforma

O **NodeForm** é uma plataforma de construção e gestão de pesquisas baseada em fluxo visual (canvas), com lógica condicional avançada, sistema de pontuação por resposta, dashboard analítico e exportação de dados. Desenvolvida em **Next.js 15 + Firebase**, a plataforma oferece uma experiência moderna tanto para o criador da pesquisa quanto para o respondente.

**Stack tecnológica:**
- Frontend: Next.js 15 (App Router), React 19
- Backend: Firebase Firestore + Firebase Storage
- Autenticação: NextAuth.js (Google OAuth, e-mail/senha, OTP)
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

#### Autenticação Completa
Sistema de login implementado com três métodos:
- Google OAuth
- E-mail + Senha
- OTP (código enviado por e-mail)

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
Suporte a 4 estados: **Rascunho → Publicada → Encerrada → Arquivada**, com controle manual pelo administrador.

---

### 2.2 Requisitos Parcialmente Atendidos ⚠️

#### Questões Abertas (Texto Livre)
**Situação atual:** A plataforma suporta escolha única, múltipla escolha, rating e tela de apresentação. Questões de texto aberto (resposta dissertativa curta ou longa) **não estão implementadas**.  
**Esforço para implementar:** Baixo — adição de novo tipo de nó ao editor.

#### Critérios de Elegibilidade
**Situação atual:** Há validação básica de campos obrigatórios (nome, e-mail, aceite de termos). Não existe um mecanismo de triagem/elegibilidade que descarte ou redirecione respondentes inelegíveis nas primeiras questões.  
**Esforço para implementar:** Médio — requer lógica de marcação de resposta como "inelegível" e redirecionamento específico.

#### Redirect para Conteúdo Externo ao Concluir
**Situação atual:** A tela de conclusão é interna à plataforma. Redirect para URL externa (ex.: página educacional do cliente) não está implementado.  
**Esforço para implementar:** Baixo — configuração de URL de redirect por pesquisa.

#### Salvar Progresso e Retomar em Outra Sessão
**Situação atual:** O sistema permite voltar respostas **dentro da mesma sessão**. Se o respondente fechar o navegador, o progresso é perdido.  
**Esforço para implementar:** Médio — persistir estado parcial no banco por usuário + lógica de retomada.

#### Exportação em Excel (.xlsx)
**Situação atual:** Exportação disponível em CSV (abrível no Excel). Arquivo nativo .xlsx com formatação, abas e tabelas dinâmicas não está implementado.  
**Esforço para implementar:** Baixo — integração com biblioteca `xlsx` ou `exceljs`.

#### Dashboard com Cruzamento de Dados
**Situação atual:** Analytics por questão individualmente. Cruzamento entre respostas de diferentes questões (ex.: segmentação por perfil) não está disponível.  
**Esforço para implementar:** Alto — requer motor de análise cruzada e interface de construção de relatórios.

---

### 2.3 Requisitos Não Atendidos ❌

#### Login Obrigatório para Respondentes
**Situação atual:** A pesquisa pública é acessível sem autenticação. O login implementado é apenas para criadores de pesquisa (administradores).  
**Impacto:** Crítico para garantir que apenas médicos cadastrados respondam.  
**Esforço para implementar:** Médio — habilitar autenticação no fluxo do respondente e associar resposta ao usuário logado.

#### Participação Única por Usuário
**Situação atual:** Não há controle de duplicidade. O mesmo usuário (ou mesmo e-mail) pode submeter múltiplas respostas.  
**Impacto:** Crítico para integridade dos dados da pesquisa.  
**Esforço para implementar:** Baixo (após login obrigatório) — validação por `userId` antes de permitir iniciar.

#### Sincronização de Dados Cadastrais
**Situação atual:** Os dados coletados na pesquisa (ex.: setor público vs. privado) são armazenados na resposta mas **não atualizam o perfil do usuário** no banco de dados.  
**Impacto:** Importante para manter o cadastro do médico atualizado a partir das respostas.  
**Esforço para implementar:** Médio — mapeamento de questões para campos de perfil e trigger de atualização na conclusão.

#### Painel de Liberação de Assinatura/Bonificação
**Situação atual:** Não existe painel ou ação administrativa para liberar benefícios (assinatura, acesso a conteúdo) para respondentes que concluíram a pesquisa.  
**Impacto:** Importante para o fluxo de bonificação pós-participação.  
**Esforço para implementar:** Médio — interface de revisão de respostas com ação de aprovação/liberação de assinatura.

#### Cota de Respondentes com Encerramento Automático
**Situação atual:** O campo `responseCount` existe no banco, mas não há lógica de encerramento automático ao atingir o número máximo de respondentes. O encerramento é manual.  
**Impacto:** Importante para gestão de campanhas com número definido de participantes.  
**Esforço para implementar:** Baixo — verificação de cota no início do fluxo + status automático `finished`.

---

## 3. Scorecard de Adequação

| # | Requisito | Status | Prioridade |
|---|---|:---:|:---:|
| 1 | Múltipla escolha e respostas abertas | ⚠️ Parcial | Alta |
| 2 | Peso por resposta (score) | ✅ Atendido | — |
| 3 | Critérios de elegibilidade | ⚠️ Parcial | Alta |
| 4 | Skip logic (lógica condicional) | ✅ Atendido | — |
| 5 | Redirect para agradecimento/conteúdo | ⚠️ Parcial | Média |
| 6 | Login obrigatório do respondente | ❌ Falta | Crítica |
| 7 | Participação única por usuário | ❌ Falta | Crítica |
| 8 | Pausar, retomar e editar respostas | ⚠️ Parcial | Alta |
| 9 | Sync de dados cadastrais | ❌ Falta | Alta |
| 10 | Painel de liberação de assinatura | ❌ Falta | Alta |
| 11 | Cota de respondentes e encerramento automático | ❌ Falta | Alta |
| 12 | Dashboard com cruzamento de dados | ⚠️ Parcial | Média |
| 13 | Exportação Excel | ⚠️ Parcial | Média |

**Legenda:** ✅ Atendido | ⚠️ Parcial | ❌ Não atendido

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

---

## 5. Plano de Desenvolvimento para Adequação Completa

Para atender 100% dos requisitos apresentados, estimamos o seguinte plano de trabalho:

### Sprint 1 — Fundação de Identidade do Respondente (2 semanas)
- [ ] Login obrigatório do respondente para iniciar pesquisa
- [ ] Vinculação de resposta ao usuário autenticado
- [ ] Bloqueio de participação duplicada (por `userId`)
- [ ] Tipo de questão: texto aberto (curto e longo)

### Sprint 2 — Controle de Pesquisa (1–2 semanas)
- [ ] Cota máxima de respondentes com encerramento automático
- [ ] Critérios de elegibilidade (triagem nas primeiras questões)
- [ ] Redirect para URL externa ao concluir
- [ ] Exportação em formato .xlsx nativo

### Sprint 3 — Experiência do Respondente (2 semanas)
- [ ] Salvar progresso parcial e retomar em outra sessão
- [ ] Sincronização de campos da pesquisa com perfil do usuário no banco

### Sprint 4 — Painel Administrativo Avançado (2–3 semanas)
- [ ] Interface de revisão e aprovação de respondentes
- [ ] Ação de liberação de assinatura/bonificação por respondente
- [ ] Marcação de respondentes inelegíveis com exclusão da cota
- [ ] Cruzamento de dados entre questões no dashboard

**Estimativa total:** 7 a 9 semanas de desenvolvimento

---

## 6. Conclusão

O NodeForm possui uma base técnica sólida e moderna, com as funcionalidades mais complexas (lógica condicional, scoring, analytics, exportação) já implementadas e funcionando. Os requisitos em falta são bem-definidos, de escopo controlado, e não exigem mudanças estruturais na arquitetura — são evoluções naturais sobre a plataforma existente.

**Percentual de adequação atual: ~50%**  
**Percentual de adequação pós-desenvolvimento: 100%**

A plataforma está apta a atender o caso de uso de pesquisas médicas com autenticação, controle de participação e análise de dados após o ciclo de desenvolvimento descrito acima.

---

*Documento gerado em Abril de 2026 — NodeForm Platform Assessment v1.0*
