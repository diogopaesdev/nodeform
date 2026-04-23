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
| **Escolha Única** | Uma opção selecionável com peso/pontuação por resposta |
| **Múltipla Escolha** | Várias opções selecionáveis com peso individual |
| **Rating (Estrelas)** | Avaliação de 1 a N estrelas, configurável |
| **Texto Livre — Curto** | Campo de linha única para respostas breves |
| **Texto Livre — Longo** | Área de texto multi-linha para respostas dissertativas |

### Sistema de Pontuação (Score)

- Peso configurável por opção de resposta
- Score acumulado calculado em tempo real durante a pesquisa
- Exibição do score final na tela de encerramento
- Score por respondente disponível no dashboard e nas exportações

### Lógica Condicional (Skip Logic)

- Cada resposta pode direcionar o respondente a uma pergunta específica
- Suporte a roteamento por: opção escolhida, valor de rating, fallback padrão
- Questões só aparecem para respondentes que atendem às regras de visibilidade

### Tela de Encerramento

- Mensagem de agradecimento personalizada
- Exibição do score final
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
- Obtém token de acesso único (5 minutos de validade)
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
- Campos tipados usados nas regras de elegibilidade
- Perfil atualizado automaticamente via SSO ou sync em massa

---

## Integração com a Plataforma da MOC

### SSO — Autenticação Transparente

```
1. Usuário clica em acessar pesquisa no portal MOC
2. Backend da MOC chama: POST /api/sso/token
   com API Key + surveyId + email + perfil do usuário
3. SurveyFlow retorna token de acesso único
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
- Progresso deletado automaticamente ao concluir

### Voltar e Editar Respostas

- Respondente pode navegar à pergunta anterior a qualquer momento
- Score recalculado automaticamente ao alterar resposta

### Embed/Iframe

- Código de embed gerado automaticamente
- Pesquisa pode ser incorporada em qualquer página web
- Suporte a resize dinâmico via postMessage

---

## Dashboard Analítico

### Visão Geral

- Contagem total de respostas
- Score médio dos respondentes
- Datas de criação e última resposta
- Status da pesquisa em tempo real

### Análise por Questão

- Distribuição percentual por opção em cada questão
- Gráficos de barra horizontais
- Score médio e distribuição para questões de rating

### Cruzamento de Dados

- Seletor de questão base e questão de segmentação
- Gráfico de barras agrupado por valor da segmentação
- Legenda dinâmica com cores por segmento
- Ex.: "ver respostas da questão X segmentadas pela especialidade do respondente"

### Visualização Individual

- Lista de todos os respondentes com nome, e-mail, score e data
- Expansão de cada resposta com detalhamento questão a questão

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
- Disponível para pesquisas com login obrigatório ativado

---

## Exportação de Dados

| Formato | Detalhes |
|---------|----------|
| **CSV** | UTF-8 com BOM, compatível com Excel, separador vírgula |
| **Excel (.xlsx)** | Arquivo nativo Excel via biblioteca especializada |

Ambos incluem: nome e e-mail do respondente, resposta por questão (incluindo texto livre), score total e data/hora de conclusão.

---

## Customização de Marca

- Upload de logotipo do cliente
- Cor de destaque configurável
- Nome da marca exibido na pesquisa
- Aplicados automaticamente em toda a experiência do respondente

---

## Ciclo de Vida da Pesquisa

| Status | Descrição |
|--------|-----------|
| **Rascunho** | Em construção, não acessível publicamente |
| **Publicada** | Aceita respostas |
| **Encerrada** | Não aceita novas respostas (manual ou por cota) |
| **Arquivada** | Removida da listagem ativa |

---

## Geração por IA

- Criação automática de pesquisas a partir de um prompt de texto
- Powered by OpenAI
- Gera questões, opções e fluxo completo em segundos

---

## Multi-idioma

- Interface disponível em **Português (PT-BR)** e **Inglês**

---

## Modelo de Contratação

### Plano Pro — R$ 499/mês

Base da plataforma com editor visual, dashboard, exportação, lógica condicional, geração por IA, embed e customização de marca.

### Módulo Respondentes — R$ 449,90/mês

Necessário para a integração com a MOC. Inclui:

- Login obrigatório para respondentes (OTP e SSO)
- SSO transparente — usuários da MOC entram sem nova tela de login
- Sync de perfil em massa (até 500 respondentes por chamada)
- Critérios de elegibilidade por perfil (pesquisa e questão)
- Participação única com bloqueio automático
- Cota máxima com encerramento automático
- Workspace Profile Schema com rule builder tipado
- API Keys seguras para integração server-to-server
- Painel de bonificação pós-participação

### Módulo Progresso — R$ 129,90/mês

Funcionalidade adicional para pesquisas longas:

- Progresso salvo automaticamente
- Retomada em qualquer device ou sessão
- Dialog de escolha: retomar ou recomeçar
- Compatível com OTP e SSO

---

## Segurança

- Autenticação de administradores via NextAuth (Google OAuth, e-mail/senha, OTP)
- Sessão de respondentes via cookie httpOnly (24h)
- API Keys com hash SHA-256 em repouso
- Tokens SSO de uso único com 5 minutos de validade
- Isolamento de dados por workspace

---

_SurveyFlow — Abril de 2026_
