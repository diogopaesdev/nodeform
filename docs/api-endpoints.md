# SurveyFlow — API Endpoints

**Base URL:** `https://surveyflowapp.com`  
**Autenticação admin:** NextAuth session (cookie `next-auth.session-token`)  
**Autenticação respondente:** Cookie httpOnly `respondent_session` (24h)  
**Autenticação server-to-server:** API Key no body (`apiKey: "nfk_..."`)

---

## Autenticação (Admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/api/auth/[...nextauth]` | Handler NextAuth (Google OAuth, e-mail/senha, OTP) |
| POST | `/api/auth/check-email` | Verifica se e-mail já está cadastrado |
| POST | `/api/auth/register` | Cadastro com e-mail e senha |
| POST | `/api/auth/send-login-code` | Envia código OTP de 6 dígitos por e-mail |
| GET | `/api/auth/verify-email` | Verifica token de ativação de conta |

---

## Pesquisas (Admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/surveys` | Lista todas as pesquisas do workspace |
| POST | `/api/surveys` | Cria nova pesquisa em branco |
| GET | `/api/surveys/[id]` | Busca pesquisa por ID |
| PATCH | `/api/surveys/[id]` | Atualiza estrutura, conteúdo ou configurações |
| DELETE | `/api/surveys/[id]` | Exclui pesquisa e todas as respostas |
| POST | `/api/surveys/generate` | Gera pesquisa automaticamente via OpenAI |
| GET | `/api/surveys/[id]/responses` | Lista todas as respostas de uma pesquisa |
| DELETE | `/api/surveys/[id]/responses?responseId=[id]` | Exclui resposta individual |
| GET | `/api/surveys/[id]/participations` | Lista participações com dados de perfil e bonificação (requer Módulo Respondentes) |
| PATCH | `/api/surveys/[id]/participations/[participationId]` | Atualiza status de bonificação (`pending` / `released` / `ineligible`) |

---

## Rotas Públicas

> Não requerem autenticação de admin. Usadas pelo front-end do respondente.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/public/surveys/[id]` | Retorna dados públicos da pesquisa |
| GET | `/api/public/users/[userId]/surveys` | Lista pesquisas publicadas de um usuário |
| POST | `/api/public/surveys/[id]/responses` | Submete resposta de um respondente |
| GET | `/api/public/workspace/[userId]/profile-schema` | Retorna schema de perfil público do workspace |

---

## Respondente

> Requerem cookie de sessão do respondente.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/respondent/me` | Retorna dados da sessão ativa do respondente |
| GET | `/api/respondent/survey/[id]/eligibility` | Verifica se o respondente atende às regras de elegibilidade |
| GET | `/api/respondent/survey/[id]/status` | Retorna status de participação (concluído, bloqueado, etc.) |
| GET | `/api/respondent/survey/[id]/progress` | Busca progresso parcial salvo (requer Módulo Progresso) |
| POST | `/api/respondent/survey/[id]/progress` | Salva progresso parcial (requer Módulo Progresso) |
| DELETE | `/api/respondent/survey/[id]/progress` | Remove progresso ao concluir ou recomeçar |

### Autenticação do Respondente

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/respondent/auth/request-otp` | Envia código OTP para o e-mail do respondente |
| POST | `/api/respondent/auth/verify-otp` | Valida o OTP e cria sessão de respondente |
| GET | `/api/respondent/auth/sso?sso_token=[token]` | Autentica respondente via token SSO gerado server-to-server |

---

## Workspace

> Requerem sessão de admin ativa.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/workspace/addons` | Retorna addons ativos do workspace |
| GET | `/api/workspace/api-keys` | Lista API keys do workspace (requer Módulo Respondentes) |
| POST | `/api/workspace/api-keys` | Cria nova API key |
| DELETE | `/api/workspace/api-keys/[id]` | Revoga API key |
| GET | `/api/workspace/profile-schema` | Retorna campos de perfil configurados |
| PUT | `/api/workspace/profile-schema` | Define/atualiza os campos do schema de perfil |
| POST | `/api/workspace/respondents/sync` | Upsert em massa de respondentes (até 500 por chamada) via API key |

---

## SSO (Server-to-Server)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/sso/token` | Gera token de acesso único (TTL 5 min) para autenticar respondente via SSO |

**Body:**
```json
{
  "apiKey": "nfk_sua_chave_aqui",
  "surveyId": "id_da_pesquisa",
  "email": "usuario@email.com",
  "name": "Nome do Usuário",
  "profile": {
    "specialty": "oncologia",
    "sector": "privado",
    "crm": "12345"
  }
}
```

**Resposta:** `{ "token": "eyJ..." }`  
**Uso:** redirecionar para `/survey/[id]?sso_token=[token]`

---

## Usuário

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/user` | Retorna dados do usuário autenticado |
| GET | `/api/user/credits` | Retorna saldo de créditos de IA |
| PATCH | `/api/user/brand` | Atualiza logo, cor de destaque e nome público |
| PATCH | `/api/user/company` | Atualiza razão social e CNPJ |
| POST | `/api/user/logo` | Faz upload do logo para o Firebase Storage |

---

## Stripe

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/stripe/checkout` | Cria sessão de checkout para assinatura Pro (com addons opcionais) |
| POST | `/api/stripe/addon-checkout` | Cria checkout para ativação de addon avulso |
| POST | `/api/stripe/portal` | Gera link para o portal de faturamento do Stripe |
| POST | `/api/stripe/credits` | Cria checkout para compra de créditos de IA |
| POST | `/api/stripe/sync` | Sincroniza status da assinatura com o Stripe |
| POST | `/api/stripe/webhook` | Recebe eventos do Stripe (pagamentos, ativações, cancelamentos) |

---

## Upload

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/upload` | Faz upload de imagens de pesquisas para o Firebase Storage |

---

## Resumo

| Categoria | Endpoints |
|-----------|-----------|
| Auth | 5 |
| Pesquisas | 10 |
| Público | 4 |
| Respondente | 8 |
| Workspace | 7 |
| SSO | 1 |
| Usuário | 5 |
| Stripe | 6 |
| Upload | 1 |
| **Total** | **47** |

---

_Documento gerado em Abril de 2026 — SurveyFlow API Reference v1.0_
