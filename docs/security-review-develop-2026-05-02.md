# Security Review — Branch `develop` (2026-05-02)

Revisão focada nas mudanças introduzidas nesta branch. Apenas vulnerabilidades com confiança ≥ 8/10 foram incluídas.

---

## Vuln 1: `planId` não é resetado ao cancelar assinatura — restrições de plano permanentemente bypassadas

**Arquivo:** `app/api/stripe/webhook/route.ts` (handler `customer.subscription.deleted`)

- **Severidade:** Alta
- **Confiança:** 9/10
- **Categoria:** `authorization_bypass`

### Descrição

O handler `customer.subscription.deleted` reseta `subscriptionStatus` para `"inactive"` mas **nunca reseta `planId`**. Todas as rotas de enforcement de plano adicionadas nesta PR (`/api/surveys`, `/api/surveys/[id]`, `/api/user/brand`, `/api/user/logo`) verificam `planId` **sem validar `subscriptionStatus`**. Como `planId` permanece `"pro"` no Firestore após o cancelamento, todas as restrições de plano são bypassadas permanentemente para qualquer assinante que cancele.

```ts
// webhook — customer.subscription.deleted (trecho atual)
await userDoc.ref.update({
  subscriptionStatus: "inactive",
  stripeSubscriptionId: null,
  // ❌ planId nunca é resetado — permanece "pro" para sempre
});

// app/api/surveys/route.ts — verifica planId sem checar status
const planId = (session.user.planId ?? "pro") as keyof typeof PLANS;
const planLimits = PLANS[planId]?.limits;
// planLimits.surveys = null para "pro" → sem limite aplicado
```

### Cenário de exploit

1. Usuário assina o Pro → `planId: "pro"`, `subscriptionStatus: "active"` no Firestore
2. Usuário cancela a assinatura → `subscriptionStatus: "inactive"`, mas `planId: "pro"` permanece
3. O layout do dashboard redireciona a UI para `/upgrade`, mas o cookie de sessão ainda é válido
4. Usuário chama `POST /api/surveys` diretamente → `planId = "pro"` → sem limite de surveys → surveys ilimitadas
5. O mesmo bypass se aplica a scoring (`/api/surveys/[id]`), branding (`/api/user/brand`, `/api/user/logo`) e acesso a templates complexos

### Correção

Resetar `planId` para `"growth"` no webhook de deleção:

```ts
// app/api/stripe/webhook/route.ts — customer.subscription.deleted
await userDoc.ref.update({
  subscriptionStatus: "inactive",
  planId: "growth",           // ← adicionar esta linha
  stripeSubscriptionId: null,
  subscriptionCurrentPeriodEnd: null,
  trialEnd: null,
});
```

---

## Vuln 2: Enforcement de plano confia no `planId` do JWT (pode estar desatualizado)

**Arquivos:** `app/api/surveys/route.ts`, `app/api/surveys/[id]/route.ts`, `app/api/user/brand/route.ts`, `app/api/user/logo/route.ts`

- **Severidade:** Média
- **Confiança:** 8/10
- **Categoria:** `authorization_bypass`

### Descrição

Todo o novo código de enforcement de plano lê `session.user.planId` do JWT do NextAuth. O JWT só é renovado no login ou quando o cliente chama `update()` explicitamente. O campo `planId` no Firestore pode mudar a qualquer momento via webhook. Durante o TTL do JWT (até 30 dias por padrão), o plano aplicado pode divergir do plano real do usuário.

O vetor que importa para segurança: um usuário Growth com JWT ainda carregando `"pro"` bypassa limites de surveys, enforcement de scoring e restrições de branding durante todo o tempo de vida do JWT.

```ts
// app/api/surveys/route.ts — planId lido do JWT ❌
const planId = (session.user.planId ?? "pro") as keyof typeof PLANS;

// app/api/user/brand/route.ts — mesmo padrão ❌
if ((session.user.planId ?? "pro") === "growth") { return 403; }
```

Contraste com o padrão já usado corretamente na mesma PR:

```ts
// app/api/stripe/addon-checkout/route.ts — lê do Firestore ✅
const userDoc = await db.collection("users").doc(session.user.id).get();
const currentPlanId: string = userData?.planId ?? "pro";
```

### Cenário de exploit

1. Usuário está no Pro; JWT contém `planId: "pro"`
2. Assinatura é cancelada; Firestore reseta para `"growth"` (após Vuln 1 corrigida)
3. JWT ainda mostra `"pro"` por até 30 dias
4. Usuário chama `PATCH /api/surveys/[id]` com `enableScoring: true` → planId do JWT é `"pro"` → scoring não bloqueado
5. Usuário chama `PATCH /api/user/brand` → verificação de planId passa → branding atualizado indevidamente

### Correção

Para verificações de plano críticas para segurança, ler `planId` e `subscriptionStatus` diretamente do Firestore — o mesmo padrão já estabelecido em `addon-checkout`:

```ts
// lib/services/plan.ts (já scaffolded nesta PR — expandir)
export async function getActiveUserPlan(userId: string) {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(userId).get();
  const data = doc.data();
  return {
    planId: (data?.planId ?? "growth") as PlanId,
    status: (data?.subscriptionStatus ?? "inactive") as string,
  };
}
```

Substituir `session.user.planId` por uma chamada a `getActiveUserPlan()` em `brand`, `logo`, `surveys/[id]` PATCH e `surveys` POST.

---

## Vuln 3: Limite mensal de respostas usa leitura não-atômica — bypass por requisições simultâneas

**Arquivos:** `app/api/public/surveys/[id]/responses/route.ts`, `lib/services/surveys.ts` (`countWorkspaceResponsesThisMonth`)

- **Severidade:** Média
- **Confiança:** 8/10
- **Categoria:** `authorization_bypass`

### Descrição

O limite de 500 respostas/mês para workspaces Growth é aplicado com um padrão check-then-act: conta as respostas existentes, compara ao limite, depois salva. A contagem e o salvamento não são atômicos. Sob carga concorrente, múltiplas requisições podem passar na verificação `monthlyCount >= 500` antes que qualquer uma delas commite sua escrita, permitindo que o limite seja ultrapassado pelo número de requisições que chegam simultaneamente ao guard.

```ts
// Padrão não-atômico (check-then-act):
const monthlyCount = await countWorkspaceResponsesThisMonth(survey.userId);
if (monthlyCount >= planLimits.responsesPerMonth) {
  return NextResponse.json({ error: "..." }, { status: 429 });
}
// ← 100 requisições simultâneas passam aqui antes de qualquer escrita ser commitada
await saveResponse(...);
```

### Cenário de exploit

Um survey de workspace Growth é submetido por um bot com 100 requisições paralelas quando `monthlyCount = 498`. Todas as 100 passam pelo guard `< 500` antes que qualquer escrita seja commitada. O workspace termina com 598 respostas em vez de 500.

### Correção

Usar um campo de contador mensal no documento do usuário com uma transação Firestore:

```ts
const userRef = db.collection("users").doc(survey.userId);
await db.runTransaction(async (tx) => {
  const userDoc = await tx.get(userRef);
  const count = userDoc.data()?.monthlyResponseCount ?? 0;
  if (count >= limit) throw new Error("MONTHLY_LIMIT_EXCEEDED");
  tx.update(userRef, { monthlyResponseCount: FieldValue.increment(1) });
  // escrever o doc de resposta dentro da mesma transação
});
```

Se transações forem muito custosas para surveys de alto volume, uma tolerância de burst moderada (ex: até 10% acima do limite) pode ser aceitável como decisão de negócio, mas a race condition atualmente é ilimitada.

---

## Resumo

| # | Arquivo principal | Severidade | Categoria | Status |
|---|---|---|---|---|
| 1 | `app/api/stripe/webhook/route.ts` | Alta | authorization_bypass | Aberto |
| 2 | `app/api/surveys/route.ts` e outros | Média | authorization_bypass | Aberto |
| 3 | `app/api/public/surveys/[id]/responses/route.ts` | Média | authorization_bypass | Aberto |
