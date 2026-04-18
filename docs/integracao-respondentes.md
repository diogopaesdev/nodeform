# SurveyFlow — Módulo Respondentes & Integração SSO

**Plataforma:** [surveyflowapp.com](https://surveyflowapp.com)  
**Versão do documento:** 1.0 — Abril 2026  
**Audiência:** Time interno + desenvolvedor responsável pela integração

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Como o Módulo Respondentes Funciona](#2-como-o-módulo-respondentes-funciona)
3. [Conceitos Fundamentais](#3-conceitos-fundamentais)
4. [Guia de Integração SSO](#4-guia-de-integração-sso)
5. [Sync de Perfil em Massa](#5-sync-de-perfil-em-massa)
6. [Regras de Elegibilidade](#6-regras-de-elegibilidade)
7. [Referência de API](#7-referência-de-api)
8. [Fluxos Completos](#8-fluxos-completos)
9. [Checklist de Integração](#9-checklist-de-integração)
10. [FAQ](#10-faq)

---

## 1. Visão Geral

O **Módulo Respondentes** do SurveyFlow permite que empresas que possuem sua própria base de usuários conectem essas bases às pesquisas, garantindo:

- Autenticação automática via SSO (o usuário já logado na plataforma cliente chega à pesquisa sem precisar fazer login novamente)
- Dados de perfil sempre sincronizados entre as duas plataformas
- Controle de quem pode responder cada pesquisa (elegibilidade por perfil)
- Participação única por usuário (anti-duplicidade automática)

### Arquitetura em três camadas (B2B2C)

```
┌─────────────────────┐     API Key      ┌──────────────────────┐
│  SurveyFlow          │ ←──────────────→ │  Plataforma Cliente   │
│  (surveyflowapp.com) │                  │  (ex: MOC, Pfizer)    │
└─────────────────────┘                  └──────────────────────┘
           ↑                                         ↑
           │ acessa pesquisa                         │ já logado
           │                                         │
    ┌──────────────┐                         ┌──────────────┐
    │  Respondente  │                         │  Respondente  │
    │  (via SSO)    │                         │  (na plat.)   │
    └──────────────┘                         └──────────────┘
```

**O respondente nunca precisa criar uma conta no SurveyFlow.** Ele existe como respondente dentro do workspace do cliente.

---

## 2. Como o Módulo Respondentes Funciona

### Ativação

O Módulo Respondentes é um **add-on pago** sobre a assinatura base do SurveyFlow. Para ativar:

1. Acesse **Dashboard → Configurações → Integrações**
2. Clique em **"Ativar módulo"**
3. Conclua o pagamento via Stripe
4. O módulo é ativado automaticamente após confirmação do pagamento

### O que é desbloqueado após ativação

| Funcionalidade | Descrição |
|---|---|
| API Keys | Gerar e gerenciar chaves para integração server-to-server |
| SSO Token Exchange | Endpoint para autenticar usuários da plataforma cliente |
| Sync de Perfil | Endpoint para manter dados dos respondentes atualizados |
| Login por OTP | Respondentes podem autenticar via e-mail + código |
| Participação única | Controle automático de duplicatas por usuário |
| Elegibilidade | Regras de acesso baseadas no perfil do respondente |
| Cota de respondentes | Encerramento automático ao atingir o limite |

---

## 3. Conceitos Fundamentais

### Workspace

Cada conta no SurveyFlow é um **workspace**. Todas as pesquisas, API keys e respondentes pertencem a um workspace. O `workspaceId` é o `userId` do administrador do SurveyFlow.

### Respondente

Um respondente é um usuário que **responde** pesquisas — diferente do administrador que as **cria**. Respondentes são armazenados por workspace e têm um perfil com campos livres:

```json
{
  "id": "resp_abc123",
  "workspaceId": "ws_xyz",
  "name": "Dr. João Silva",
  "email": "joao@hospital.com",
  "specialty": "oncologia",
  "sector": "privado",
  "crm": "SP-123456",
  "createdAt": "2026-04-17T10:00:00Z",
  "updatedAt": "2026-04-17T10:00:00Z"
}
```

Os campos `name` e `email` são obrigatórios. Todos os outros são livres e definidos pelo cliente.

### API Key

Chave de autenticação usada para chamadas **server-to-server** (backend da plataforma cliente → SurveyFlow). **Nunca deve ser exposta no frontend.**

- Formato: `nfk_` + 64 caracteres hexadecimais
- Armazenada como hash no banco (não é possível recuperar após criação)
- Deve ser copiada no momento da criação

### SSO Token

Token de curta duração (5 minutos, uso único) que permite autenticar um usuário na pesquisa sem tela de login. Gerado pelo backend da plataforma cliente e consumido pelo browser do respondente.

---

## 4. Guia de Integração SSO

### Pré-requisitos

1. Módulo Respondentes ativo no workspace SurveyFlow
2. API Key gerada em **Dashboard → Integrações**
3. Acesso ao backend da plataforma cliente (Node.js, PHP, Python, etc.)

### Como funciona o fluxo SSO

```
1. Usuário está logado na Plataforma Cliente
2. Usuário clica em "Responder Pesquisa"
3. Backend da Plataforma Cliente chama SurveyFlow:
   POST https://surveyflowapp.com/api/sso/token
   { apiKey, surveyId, email, name, profile }
4. SurveyFlow retorna um token de uso único (válido por 5 min)
5. Backend redireciona o usuário para:
   https://surveyflowapp.com/survey/{surveyId}?sso_token={token}
6. SurveyFlow valida o token, cria a sessão do respondente
7. Usuário vê a pesquisa já autenticado — sem tela de login
```

### Implementação em Node.js / TypeScript

```typescript
import express from 'express';

const SURVEYFLOW_API_KEY = process.env.SURVEYFLOW_API_KEY; // nfk_...
const SURVEYFLOW_BASE_URL = 'https://surveyflowapp.com';

// Rota que redireciona o usuário logado para a pesquisa
app.get('/pesquisa/:surveyId', requireAuth, async (req, res) => {
  const { surveyId } = req.params;
  const usuario = req.user; // usuário autenticado na sua plataforma

  // 1. Gerar token SSO no SurveyFlow
  const response = await fetch(`${SURVEYFLOW_BASE_URL}/api/sso/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: SURVEYFLOW_API_KEY,
      surveyId: surveyId,
      email: usuario.email,
      name: usuario.nomeCompleto,
      profile: {
        specialty: usuario.especialidade,  // ex: 'oncologia'
        sector: usuario.setor,             // ex: 'privado' | 'publico'
        crm: usuario.crm,                  // ex: 'SP-123456'
        // qualquer outro campo relevante
      }
    })
  });

  if (!response.ok) {
    const erro = await response.json();
    return res.status(500).send(`Erro ao gerar acesso: ${erro.error}`);
  }

  const { token } = await response.json();

  // 2. Redirecionar o usuário com o token
  res.redirect(`${SURVEYFLOW_BASE_URL}/survey/${surveyId}?sso_token=${token}`);
});
```

### Implementação em PHP

```php
<?php
define('SURVEYFLOW_API_KEY', getenv('SURVEYFLOW_API_KEY'));
define('SURVEYFLOW_BASE_URL', 'https://surveyflowapp.com');

function gerarSSOToken(string $surveyId, array $usuario): string
{
    $payload = json_encode([
        'apiKey'   => SURVEYFLOW_API_KEY,
        'surveyId' => $surveyId,
        'email'    => $usuario['email'],
        'name'     => $usuario['nome'],
        'profile'  => [
            'specialty' => $usuario['especialidade'],
            'sector'    => $usuario['setor'],
            'crm'       => $usuario['crm'],
        ]
    ]);

    $ch = curl_init(SURVEYFLOW_BASE_URL . '/api/sso/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    ]);

    $resposta = json_decode(curl_exec($ch), true);
    curl_close($ch);

    return $resposta['token'];
}

// No controller da pesquisa:
$token = gerarSSOToken($_GET['surveyId'], $_SESSION['usuario']);
header("Location: " . SURVEYFLOW_BASE_URL . "/survey/{$_GET['surveyId']}?sso_token={$token}");
exit;
```

### Implementação em Python

```python
import os
import requests
from flask import redirect, session

SURVEYFLOW_API_KEY = os.environ['SURVEYFLOW_API_KEY']
SURVEYFLOW_BASE_URL = 'https://surveyflowapp.com'

@app.route('/pesquisa/<survey_id>')
@login_required
def acessar_pesquisa(survey_id):
    usuario = session['usuario']

    # 1. Gerar token SSO
    resp = requests.post(f'{SURVEYFLOW_BASE_URL}/api/sso/token', json={
        'apiKey': SURVEYFLOW_API_KEY,
        'surveyId': survey_id,
        'email': usuario['email'],
        'name': usuario['nome'],
        'profile': {
            'specialty': usuario.get('especialidade'),
            'sector': usuario.get('setor'),
            'crm': usuario.get('crm'),
        }
    })

    resp.raise_for_status()
    token = resp.json()['token']

    # 2. Redirecionar com o token
    return redirect(f'{SURVEYFLOW_BASE_URL}/survey/{survey_id}?sso_token={token}')
```

### Pontos de atenção

> ⚠️ **A API Key NUNCA deve aparecer no frontend** (HTML, JavaScript do browser, app mobile). Toda chamada ao endpoint `/api/sso/token` deve ser feita exclusivamente pelo backend da plataforma cliente.

> ⚠️ **O token SSO expira em 5 minutos** e só pode ser usado uma vez. Não armazene nem reutilize tokens.

> ℹ️ Ao gerar um token SSO, o SurveyFlow automaticamente cria ou atualiza o perfil do respondente com os dados enviados no campo `profile`. Não é necessário sincronizar separadamente.

---

## 5. Sync de Perfil em Massa

Quando o perfil de um usuário é atualizado na plataforma cliente (ex: médico muda de setor público para privado), é possível sincronizar sem exigir que o usuário acesse uma pesquisa.

### Endpoint de sync

```
POST https://surveyflowapp.com/api/workspace/respondents/sync
```

### Corpo da requisição

```json
{
  "apiKey": "nfk_sua_chave_aqui",
  "respondents": [
    {
      "email": "dr.joao@hospital.com",
      "name": "Dr. João Silva",
      "profile": {
        "specialty": "oncologia",
        "sector": "privado",
        "crm": "SP-123456"
      }
    },
    {
      "email": "dra.maria@clinica.com",
      "name": "Dra. Maria Santos",
      "profile": {
        "specialty": "clinico_geral",
        "sector": "publico",
        "crm": "RJ-789012"
      }
    }
  ]
}
```

### Resposta

```json
{
  "synced": 2,
  "failed": 0
}
```

### Limites

- Máximo de **500 respondentes por requisição**
- Sem limite de frequência de chamadas

### Exemplo de uso — job noturno (Node.js)

```typescript
// Executado diariamente via cron para manter perfis atualizados
async function syncRespondentes() {
  const usuarios = await db.query('SELECT * FROM medicos WHERE updated_at > ?', [ontem]);

  const respondents = usuarios.map(u => ({
    email: u.email,
    name: u.nome_completo,
    profile: {
      specialty: u.especialidade,
      sector: u.setor,
      crm: u.crm,
      institution: u.instituicao,
    }
  }));

  await fetch('https://surveyflowapp.com/api/workspace/respondents/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: process.env.SURVEYFLOW_API_KEY,
      respondents
    })
  });
}
```

---

## 6. Regras de Elegibilidade

As regras de elegibilidade permitem controlar **quem pode responder** uma pesquisa e **quais perguntas cada perfil vê**.

### Nível 1 — Elegibilidade da pesquisa

Configurada pelo administrador no editor de pesquisa. Se o respondente não atender às regras, ele vê uma tela de "fora do perfil elegível" e não pode responder.

**Casos de uso:**
- Pesquisa exclusiva para oncologistas: `specialty = oncologia`
- Pesquisa para médicos do setor privado: `sector = privado`
- Pesquisa para qualquer especialista (campo deve existir): `specialty existe`

### Nível 2 — Elegibilidade de nó (pergunta individual)

Algumas perguntas são configuradas com regras que determinam se aquele nó é exibido para o respondente. Se as regras não forem atendidas, o runtime **pula automaticamente** o nó e segue para a próxima pergunta compatível.

**Caso de uso:**
- Pergunta sobre protocolo quimioterápico → visível apenas para `specialty = oncologia`
- Pergunta sobre atendimento SUS → visível apenas para `sector = publico`

### Operadores disponíveis

| Operador | Descrição | Exemplo |
|---|---|---|
| `equals` | Campo igual ao valor | `specialty = oncologia` |
| `not_equals` | Campo diferente do valor | `sector ≠ estudante` |
| `in` | Campo está na lista | `specialty ∈ [oncologia, hematologia]` |
| `not_in` | Campo não está na lista | `specialty ∉ [residente, estudante]` |
| `exists` | Campo possui valor | `crm existe` |
| `not_exists` | Campo não possui valor | `institution não existe` |

### Campos comuns de perfil

Os campos abaixo são convenções recomendadas para facilitar a configuração de regras:

| Campo | Tipo | Exemplos de valor |
|---|---|---|
| `specialty` | string | `oncologia`, `clinico_geral`, `cardiologia`, `hematologia` |
| `sector` | string | `privado`, `publico`, `misto` |
| `crm` | string | `SP-123456` |
| `institution` | string | `Hospital Sírio-Libanês` |
| `role` | string | `medico`, `residente`, `estudante` |
| `region` | string | `sudeste`, `nordeste` |

> ℹ️ Os nomes dos campos são livres — o que importa é que os valores enviados no `profile` via SSO ou sync correspondam aos valores configurados nas regras da pesquisa.

---

## 7. Referência de API

### Autenticação

Todas as rotas server-to-server requerem a API Key no corpo da requisição (campo `apiKey`). As rotas do browser usam cookie `respondent-session` gerenciado pelo SurveyFlow.

---

### `POST /api/sso/token`

Gera um token de acesso único para autenticar um respondente. **Chamada exclusivamente server-to-server.**

**Request:**
```json
{
  "apiKey": "nfk_...",
  "surveyId": "abc123",
  "email": "respondente@email.com",
  "name": "Nome Completo",
  "profile": {
    "specialty": "oncologia",
    "sector": "privado"
  }
}
```

**Response 200:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "expiresAt": "2026-04-17T10:05:00Z"
}
```

**Erros:**
| Código | Motivo |
|---|---|
| 401 | API Key inválida |
| 403 | Módulo Respondentes não ativo |
| 404 | Pesquisa não encontrada ou não pertence ao workspace |
| 400 | Dados inválidos (email malformado, campos faltando) |

---

### `POST /api/workspace/respondents/sync`

Sincroniza perfis de respondentes sem exigir login. **Chamada server-to-server.**

**Request:**
```json
{
  "apiKey": "nfk_...",
  "respondents": [
    {
      "email": "dr@email.com",
      "name": "Dr. Nome",
      "profile": { "specialty": "oncologia" }
    }
  ]
}
```

**Response 200:**
```json
{ "synced": 1, "failed": 0 }
```

---

### `GET /survey/{id}?sso_token={token}`

URL de acesso do respondente com autenticação SSO automática. Não é uma API — é a URL para onde o backend da plataforma cliente redireciona o navegador do usuário.

**Parâmetros:**
- `id` — ID da pesquisa no SurveyFlow
- `sso_token` — Token gerado pelo endpoint `/api/sso/token`

**Comportamento:**
1. SurveyFlow valida o token
2. Cria sessão do respondente via cookie httpOnly
3. Remove o `?sso_token=` da URL (sem reload)
4. Exibe a pesquisa

**Se o token expirou ou já foi usado:** o respondente vê a tela de login por OTP e pode se autenticar pelo e-mail.

---

### `GET /api/respondent/me`

Retorna o respondente autenticado na sessão atual. **Chamada do browser.**

**Response 200:**
```json
{
  "respondent": {
    "id": "resp_abc",
    "name": "Dr. João",
    "email": "joao@email.com",
    "workspaceId": "ws_xyz"
  }
}
```

Se não houver sessão ativa: `{ "respondent": null }`

---

### `GET /api/respondent/survey/{id}/status`

Verifica se o respondente autenticado já participou da pesquisa. **Chamada do browser.**

**Response 200:**
```json
{ "status": "not_started" }
// ou
{ "status": "in_progress", "participationId": "..." }
// ou
{ "status": "completed", "participationId": "..." }
// ou
{ "status": "unauthenticated" }
```

---

### `GET /api/respondent/survey/{id}/eligibility`

Verifica se o respondente autenticado é elegível para a pesquisa. **Chamada do browser.**

**Response 200:**
```json
{ "eligible": true }
// ou
{
  "eligible": false,
  "failedRule": {
    "id": "rule_1",
    "field": "specialty",
    "operator": "equals",
    "value": "oncologia",
    "label": "Pesquisa exclusiva para médicos oncologistas"
  }
}
```

---

## 8. Fluxos Completos

### Fluxo 1 — SSO com perfil novo

```
1. Usuário logado na MOC clica em "Pesquisa de Prática Clínica"
2. Backend da MOC chama POST /api/sso/token com dados do médico
3. SurveyFlow: cria respondente no workspace (primeira vez)
4. SurveyFlow: retorna token
5. MOC redireciona: /survey/abc?sso_token=xyz
6. SurveyFlow: valida token (uso único, 5 min)
7. SurveyFlow: cria sessão do respondente
8. Remove sso_token da URL
9. Verifica participação → não participou → inicia pesquisa
10. Médico responde → participação registrada
11. SurveyFlow bloqueia segunda tentativa
```

### Fluxo 2 — SSO com perfil atualizado

```
1. Médico mudou de setor público para privado na MOC
2. Backend da MOC chama POST /api/sso/token (ou /sync)
3. SurveyFlow: encontra respondente pelo e-mail
4. SurveyFlow: ATUALIZA perfil (setor = privado)
5. Regras de elegibilidade baseadas no perfil atualizado ✓
```

### Fluxo 3 — Elegibilidade por especialidade

```
1. Admin cria pesquisa no SurveyFlow
2. Configura regra: specialty = oncologia
3. Também marca pergunta 5 como: eligibilityRules = [specialty = oncologia]
4. Médico oncologista → passa elegibilidade → responde todas as perguntas
5. Clínico geral → bloqueado na elegibilidade da pesquisa → vê tela de "fora do perfil"
6. (Se a regra fosse só no nó) → clínico geral responderia a pesquisa
   mas a pergunta 5 seria pulada automaticamente pelo runtime
```

### Fluxo 4 — Cota de respondentes

```
1. Admin define maxResponses = 200 na pesquisa
2. 200º respondente conclui → pesquisa muda para status "finished" automaticamente
3. Novos respondentes que tentam acessar recebem: "Esta pesquisa foi encerrada"
4. Admin pode revisar respondentes inelegíveis e reabrir manualmente
```

---

## 9. Checklist de Integração

Para o desenvolvedor responsável pela integração na plataforma cliente:

### Configuração inicial

- [ ] Confirmar que o Módulo Respondentes está ativo no SurveyFlow
- [ ] Gerar API Key em Dashboard → Integrações → "Nova chave"
- [ ] Salvar a API Key como variável de ambiente (`SURVEYFLOW_API_KEY`)
- [ ] **Nunca** versionar a API Key em repositórios

### Implementação do SSO

- [ ] Criar rota backend para intermediar o acesso à pesquisa
- [ ] Implementar chamada `POST /api/sso/token` com dados do usuário logado
- [ ] Mapear campos do perfil do usuário para campos do `profile` (specialty, sector, crm, etc.)
- [ ] Redirecionar o navegador do usuário para a URL com `?sso_token=`
- [ ] Testar com usuário de teste em ambiente de desenvolvimento

### Sync de perfil (recomendado)

- [ ] Implementar job de sync diário ou por evento de atualização
- [ ] Mapear campos atualizáveis do usuário para o formato do SurveyFlow
- [ ] Testar atualização de campo e verificar reflexo nas regras de elegibilidade

### Ambiente de produção

- [ ] Confirmar variável de ambiente da API Key em produção
- [ ] Testar fluxo completo com usuário real
- [ ] Verificar comportamento em caso de token expirado (deve cair no login por OTP)
- [ ] Confirmar que usuário que já respondeu não consegue responder de novo

---

## 10. FAQ

**P: O respondente precisa criar uma conta no SurveyFlow?**  
R: Não. O respondente existe apenas dentro do workspace do cliente. Ele nunca interage diretamente com o SurveyFlow além de responder a pesquisa.

**P: O que acontece se o token SSO expirar antes do usuário clicar no link?**  
R: O SurveyFlow exibe a tela de login por OTP. O médico digita o e-mail, recebe um código de 6 dígitos e acessa normalmente. A experiência é levemente degradada (não seamless), mas funcional.

**P: Um respondente pode responder a mesma pesquisa duas vezes?**  
R: Não. O SurveyFlow registra a participação vinculada ao `respondentId`. Qualquer nova tentativa retorna uma tela de "Você já participou". Mesmo que o respondente acesse por diferentes dispositivos ou navegadores, o bloqueio é pelo perfil, não pela sessão.

**P: O que é enviado no campo `profile`? É obrigatório?**  
R: O campo `profile` é opcional, mas altamente recomendado. Ele contém qualquer dado relevante do respondente que será armazenado no perfil dele no SurveyFlow. Esses dados são usados para as regras de elegibilidade. Se não enviado, o respondente terá apenas `name` e `email`.

**P: Se o respondente atualizar seus dados em uma pesquisa (ex: responde que é do setor privado), isso atualiza o perfil dele?**  
R: Este comportamento (sync de resposta → perfil) está no roadmap como Sprint 3. Atualmente, o sync é unidirecional: da plataforma cliente para o SurveyFlow.

**P: É possível ter múltiplas API Keys?**  
R: Sim. Recomendamos uma chave por ambiente (desenvolvimento, staging, produção) e uma por integração diferente se houver múltiplas plataformas.

**P: Como revogar uma API Key comprometida?**  
R: Acesse Dashboard → Integrações, clique no ícone de lixeira ao lado da chave. O efeito é imediato — qualquer chamada com aquela chave passa a retornar 401. Em seguida, crie uma nova chave e atualize nas integrações.

**P: Qual o limite de respondentes por workspace?**  
R: Não há limite de respondentes armazenados. O limite que importa é o `maxResponses` configurado por pesquisa (opcional), que controla quantas pessoas podem responder aquela pesquisa específica.

**P: Os dados dos respondentes ficam armazenados no SurveyFlow permanentemente?**  
R: Sim, enquanto o workspace existir. Em caso de cancelamento do Módulo Respondentes, os dados são mantidos mas o acesso às funcionalidades é suspenso.

---

## Suporte e contato

Para dúvidas técnicas durante a integração, entre em contato com o time SurveyFlow informando:

- `workspaceId` (visível em Dashboard → Configurações → URL)
- Descrição do comportamento esperado e observado
- Se possível, o `surveyId` e o e-mail do respondente de teste

---

*Documentação SurveyFlow — Módulo Respondentes v1.0 — Abril 2026*
