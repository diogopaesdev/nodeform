# SurveyFlow — Apresentação de Funcionalidades

**Para:** MOC  
**Data:** Abril de 2026  
**Versão da plataforma:** 5.0

---

## O que é o SurveyFlow

O **SurveyFlow** é uma plataforma de pesquisas enterprise com editor visual estilo canvas (arrastar e soltar), lógica condicional avançada, autenticação dedicada para respondentes e dashboard analítico completo. Desenvolvida para atender fluxos complexos de coleta de dados com rastreamento individual de participantes.

---

## Funcionalidades Principais

### Editor Visual de Pesquisas

- Construção por arrastar e soltar, estilo Miro
- Cada pergunta é um "nó" no canvas; conexões definem o fluxo
- Visualização completa da pesquisa em tempo real
- Suporte a múltiplos tipos de questão em uma mesma pesquisa

### Tipos de Questão Disponíveis

| Tipo | Descrição |
|------|-----------|
| **Tela de Abertura** | Tela inicial com título, descrição e botão customizável. Pode coletar nome, e-mail e aceite de termos do respondente |
| **Escolha Única** | Uma opção selecionável com peso/pontuação por resposta; cada opção pode direcionar a um nó diferente |
| **Múltipla Escolha** | Várias opções selecionáveis com peso individual; todas levam ao mesmo próximo nó |
| **Rating (Escala)** | Avaliação numérica com valores mínimo e máximo configuráveis e rótulos para os extremos |
| **Texto Livre — Curto** | Campo de linha única para respostas breves |
| **Texto Livre — Longo** | Área de texto multi-linha para respostas dissertativas |
| **Tela de Encerramento** | Mensagem final com score opcional, redirect automático com delay e countdown |

### Tela de Abertura (nó Presentation)

A tela de abertura é o primeiro nó da pesquisa e suporta coleta de dados do respondente:

- **Nome** — campo opcional ou obrigatório, com rótulo customizável
- **E-mail** — campo opcional ou obrigatório, com rótulo customizável
- **Aceite de Termos** — checkbox com texto personalizável, link para documento externo e flag de obrigatoriedade

### Sistema de Pontuação (Score)

- Peso configurável por opção de resposta (Escolha Única e Múltipla)
- Score acumulado calculado em tempo real durante a pesquisa
- Recalculado automaticamente quando o respondente volta e altera uma resposta
- Exibição do score final na tela de encerramento (configurável)
- Score por respondente disponível no dashboard e nas exportações

### Lógica Condicional (Skip Logic)

- Cada opção de Escolha Única pode direcionar o respondente a uma pergunta específica
- Questões de Múltipla Escolha, Rating e Texto Livre usam roteamento genérico para o próximo nó
- Questões só aparecem para respondentes que atendem às regras de visibilidade do nó

### Configurações Gerais da Pesquisa

| Campo | Descrição |
|-------|-----------|
| **Tempo Limite** | Duração máxima em minutos (opcional) |
| **Prêmio** | Texto descritivo da bonificação exibido na pesquisa (opcional) |
| **Habilitar Pontuação** | Ativa o sistema de score para a pesquisa |

### Tela de Encerramento

- Mensagem de agradecimento personalizada
- Exibição do score final (configurável)
- Redirect automático para URL externa (ex.: página educacional) com delay configurável e countdown visível

---

## Autenticação e Controle de Acesso

### Login Obrigatório para Respondentes

A pesquisa pode exigir que o respondente se autentique antes de responder. Dois métodos disponíveis:

**OTP por e-mail**
- Respondente informa o e-mail, recebe código de 6 dígitos
- Código válido por 10 minutos
- Sessão mantida por 24 horas via cookie httpOnly

**SSO via plataforma parceira (integração B2B)**
- Plataforma da MOC chama nossa API server-to-server com uma API Key
- Obtém token de acesso único (5 minutos de validade, uso único)
- Redireciona o usuário já autenticado — sem tela de login adicional
- Dados de perfil (especialidade, setor, CRM) sincronizados no mesmo momento

### Participação Única por Usuário

- Bloqueio automático de segunda tentativa com tela informativa
- Vinculação da resposta ao respondente autenticado
- Registro completo de participações em banco de dados

### Critérios de Elegibilidade

**No nível da pesquisa:**
- Regras AND aplicadas antes de iniciar
- Respondente inelegível vê tela de bloqueio com mensagem configurada

**No nível da questão:**
- Cada pergunta pode ter regras de visibilidade próprias
- Ex.: "apenas oncologistas veem esta questão"
- Operadores: `igual a`, `diferente de`, `está em`, `não está em`, `está preenchido`, `está vazio`
- Campos selecionados via dropdown tipado (sem digitação livre)

### Cota de Respondentes

- Campo `Máximo de respostas` configurável por pesquisa
- Ao atingir a cota, pesquisa muda automaticamente para status **Encerrada**
- Novos acessos após encerramento recebem mensagem informativa

### Perfil de Respondentes (Workspace Profile Schema)

- Admin define os campos de perfil do seu workspace (especialidade, setor, CRM etc.)
- Tipos suportados: texto livre (`string`) e lista de valores (`enum`)
- Máximo de 30 campos por workspace
- Campos tipados usados nas regras de elegibilidade
- Perfil atualizado automaticamente via SSO ou sync em massa

---

## Integração com a Plataforma da MOC

### SSO — Autenticação Transparente

```
1. Usuário clica em acessar pesquisa no portal MOC
2. Backend da MOC chama: POST /api/sso/token
   com API Key + surveyId + email + perfil do usuário
3. SurveyFlow retorna token de acesso único (5 min, uso único)
4. MOC redireciona: /survey/{id}?sso_token={token}
5. Usuário entra na pesquisa já autenticado
```

### Sync de Perfil em Massa

- Endpoint para atualizar até **500 respondentes por requisição**
- Não exige login dos usuários
- Mantém os dados de perfil sempre atualizados no SurveyFlow

### API Keys

- Chaves de integração por workspace com prefixo `nfk_`
- Hash SHA-256 em repouso — nunca armazenadas em texto puro
- Exibidas em texto apenas no momento da criação
- Gerenciadas em **Configurações → Integrações**

---

## Experiência do Respondente

### Salvar Progresso e Retomar

- Progresso salvo automaticamente após cada resposta
- Ao retornar, respondente escolhe: **retomar de onde parou** ou **recomeçar do início**
- Funciona com autenticação OTP e SSO
- Progresso deletado automaticamente ao concluir — sem dados residuais

### Voltar e Editar Respostas

- Respondente pode navegar à pergunta anterior a qualquer momento
- Score recalculado automaticamente ao alterar resposta

### Embed/Iframe

- Código de embed gerado automaticamente no dashboard
- Pesquisa pode ser incorporada em qualquer página web
- Suporte a resize dinâmico via `postMessage` — iframe ajusta altura automaticamente

---

## Dashboard Analítico

### Visão Geral

- Contagem total de respostas
- Score médio dos respondentes (quando pontuação habilitada)
- Datas de criação e última atualização
- Status da pesquisa em tempo real

### Análise por Questão

- Distribuição percentual por opção em cada questão (Escolha Única e Múltipla)
- Gráficos de barra horizontais com percentuais por opção
- Score médio e distribuição por valor para questões de Rating

### Cruzamento de Dados

- Seletor de questão base e questão de segmentação (entre questões de escolha)
- Gráfico de barras agrupado por valor da segmentação
- Legenda dinâmica com cores por segmento
- Ex.: "ver respostas da questão X segmentadas pela especialidade do respondente"

### Visualização Individual

- Lista de todos os respondentes com nome, e-mail, score e data
- Expansão de cada resposta com detalhamento questão a questão
- Exclusão individual de respostas

---

## Painel de Bonificação

Painel administrativo para gerenciar benefícios pós-participação:

- Lista de todos os respondentes que concluíram a pesquisa
- Dados exibidos: nome, e-mail, perfil (especialidade, setor, CRM), score e data de conclusão
- **Ações disponíveis por respondente:**
  - **Liberar bonificação** — registra data e hora da liberação
  - **Marcar como inelegível** — exclui da cota automaticamente; reabre a pesquisa se estava encerrada por cota
  - **Reverter para pendente** — restaura a cota se aplicável
- Contadores em tempo real: Total · Pendentes · Liberados · Inelegíveis
- Disponível para pesquisas com login obrigatório ativado e Módulo Respondentes ativo

---

## Exportação de Dados

| Formato | Detalhes |
|---------|----------|
| **CSV** | UTF-8 com BOM, compatível com Excel, separador vírgula |
| **Excel (.xlsx)** | Arquivo nativo Excel via biblioteca especializada |

Ambos incluem: nome e e-mail do respondente, resposta por questão (incluindo texto livre), score total (quando habilitado) e data/hora de conclusão.

Exportação disponível na aba **Respostas** do dashboard da pesquisa.

---

## Customização de Marca

- Upload de logotipo do cliente (máx. 2 MB)
- Cor de destaque configurável
- Nome da marca exibido na pesquisa
- Descrição/tagline da marca
- Aplicados automaticamente em toda a experiência do respondente

---

## Ciclo de Vida da Pesquisa

| Status | Descrição |
|--------|-----------|
| **Rascunho** | Em construção, não acessível publicamente |
| **Publicada** | Aceita respostas |
| **Encerrada** | Não aceita novas respostas (manual ou por cota atingida) |
| **Arquivada** | Removida da listagem ativa |

Transições de status também disponíveis diretamente pelo dropdown no dashboard da pesquisa.

---

## Geração por IA

- Criação automática de pesquisas a partir de um prompt de texto
- Powered by OpenAI (gpt-4o-mini)
- Gera questões, opções, fluxo completo e tela de encerramento em segundos
- Consome 1 crédito por geração; 10 créditos gratuitos por mês (reset automático no dia 1º)
- Créditos adicionais disponíveis para compra

---

## Multi-idioma

- Interface disponível em **Português (PT-BR)** e **Inglês**

---

## Modelo de Contratação

### Plano Pro — R$ 499/mês

Base da plataforma com editor visual, dashboard, exportação, lógica condicional, geração por IA, embed e customização de marca. Inclui 7 dias de trial gratuito na primeira contratação.

### Módulo Respondentes — R$ 449,90/mês

Necessário para a integração com a MOC. Inclui:

- Login obrigatório para respondentes (OTP e SSO)
- SSO transparente — usuários da MOC entram sem nova tela de login
- Sync de perfil em massa (até 500 respondentes por chamada)
- Critérios de elegibilidade por perfil (pesquisa e questão)
- Participação única com bloqueio automático
- Cota máxima com encerramento automático
- Workspace Profile Schema com rule builder tipado (até 30 campos)
- API Keys seguras para integração server-to-server
- Painel de bonificação pós-participação

### Módulo Progresso — R$ 129,90/mês

Funcionalidade adicional para pesquisas longas:

- Progresso salvo automaticamente após cada resposta
- Retomada em qualquer device ou sessão
- Dialog de escolha: retomar ou recomeçar
- Compatível com OTP e SSO
- Progresso deletado automaticamente ao concluir

---

## Segurança

- Autenticação de administradores via NextAuth (Google OAuth, e-mail/senha com OTP)
- Sessão de respondentes via cookie httpOnly (24 h)
- API Keys com hash SHA-256 em repouso
- Tokens SSO de uso único com 5 minutos de validade
- Tokens de verificação de e-mail com 24 horas de validade
- Isolamento completo de dados por workspace

---

_SurveyFlow — Abril de 2026_
