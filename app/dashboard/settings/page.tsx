"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Building2, User, CreditCard, Loader2, Check, Pencil, ExternalLink, Sparkles, KeyRound, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

type SubscriptionStatus = "trialing" | "active" | "past_due" | "inactive" | undefined;

interface UserData {
  name: string;
  email: string;
  image?: string;
  provider: string;
  companyName?: string;
  cnpj?: string;
  subscriptionStatus?: SubscriptionStatus;
  trialEnd?: string;
  subscriptionCurrentPeriodEnd?: string;
  stripeCustomerId?: string;
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const requirePlan = searchParams.get("require_plan") === "true";
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Company form
  const [editing, setEditing] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Billing
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    const isCheckoutSuccess = searchParams.get("checkout") === "success";
    if (isCheckoutSuccess) {
      // Sync com Stripe (fallback ao webhook) → redireciona ao dashboard
      // O layout do dashboard lê o Firestore em tempo real, sem depender do JWT.
      fetch("/api/stripe/sync", { method: "POST" })
        .finally(() => {
          window.location.href = "/dashboard";
        });
    } else {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUserData(data.user);
      setCompanyName(data.user?.companyName || "");
      setCnpj(data.user?.cnpj || "");
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyName.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, cnpj }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t.settings.company.errorGeneric);
        return;
      }

      setUserData((prev) => prev ? { ...prev, companyName, cnpj } : prev);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t.settings.company.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setCompanyName(userData?.companyName || "");
    setCnpj(userData?.cnpj || "");
    setEditing(false);
    setError("");
  };

  const handleCheckout = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silently fail
    } finally {
      setBillingLoading(false);
    }
  };

  const handlePortal = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silently fail
    } finally {
      setBillingLoading(false);
    }
  };

  const getSubscriptionBadge = (status: SubscriptionStatus) => {
    const map: Record<string, { label: string; className: string }> = {
      trialing:  { label: t.settings.subscription.badges.trialing,  className: "bg-blue-50 text-blue-700 border-blue-100" },
      active:    { label: t.settings.subscription.badges.active,    className: "bg-green-50 text-green-700 border-green-100" },
      past_due:  { label: t.settings.subscription.badges.past_due,  className: "bg-amber-50 text-amber-700 border-amber-100" },
      inactive:  { label: t.settings.subscription.badges.inactive,  className: "bg-gray-50 text-gray-500 border-gray-100" },
    };
    const variant = map[status ?? "inactive"];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variant.className}`}>
        {variant.label}
      </span>
    );
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : null;

  const isTrialing =
    userData?.subscriptionStatus === "trialing" ||
    (!userData?.subscriptionStatus && userData?.trialEnd && new Date(userData.trialEnd).getTime() > Date.now());

  const hasActiveSubscription =
    userData?.subscriptionStatus === "active" || isTrialing;

  const trialDaysLeft = userData?.trialEnd
    ? Math.max(0, Math.ceil((new Date(userData.trialEnd).getTime() - Date.now()) / 86400000))
    : null;

  const trialDaysText = trialDaysLeft !== null
    ? trialDaysLeft > 0
      ? (trialDaysLeft === 1
          ? t.settings.subscription.daysLeft.replace("{n}", String(trialDaysLeft))
          : t.settings.subscription.daysLeftPlural.replace("{n}", String(trialDaysLeft)))
      : t.settings.subscription.expiresTODAY
    : null;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{t.settings.title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t.settings.subtitle}</p>
      </div>

      {requirePlan && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Assinatura necessária</p>
            <p className="text-xs text-amber-700 mt-0.5">Os módulos de integração estão disponíveis apenas para assinantes. Ative seu plano abaixo para continuar.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Connected account */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">{t.settings.account.title}</h2>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{userData?.name || session?.user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{userData?.email || session?.user?.email}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs text-gray-500 font-medium">Google</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">{t.settings.subscription.title}</h2>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-40 bg-gray-100 rounded" />
                <div className="h-8 w-36 bg-gray-100 rounded" />
              </div>
            ) : hasActiveSubscription ? (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.subscriptionStatus === "active" ? t.settings.subscription.proPlan : t.settings.subscription.freeTrial}
                    </p>
                    {getSubscriptionBadge(userData?.subscriptionStatus as SubscriptionStatus ?? (isTrialing ? "trialing" : "inactive"))}
                  </div>
                  {isTrialing && trialDaysLeft !== null && (
                    <p className="text-xs text-gray-400">
                      {trialDaysText}
                      {" · "}
                      <button onClick={handleCheckout} className="text-gray-600 underline underline-offset-2">
                        {t.settings.subscription.subscribeNow}
                      </button>
                    </p>
                  )}
                  {userData?.subscriptionStatus === "active" && userData.subscriptionCurrentPeriodEnd && (
                    <p className="text-xs text-gray-400">
                      {t.settings.subscription.renewsAt.replace("{date}", formatDate(userData.subscriptionCurrentPeriodEnd) ?? "")}
                    </p>
                  )}
                  {userData?.subscriptionStatus === "past_due" && (
                    <p className="text-xs text-amber-600">
                      {t.settings.subscription.pastDueWarning}
                    </p>
                  )}
                </div>
                {userData?.subscriptionStatus === "active" || userData?.subscriptionStatus === "past_due" ? (
                  <button
                    onClick={handlePortal}
                    disabled={billingLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {billingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    {t.settings.subscription.manage}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={billingLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {billingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {t.settings.subscription.subscribe}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{t.settings.subscription.trialExpired}</p>
                  <p className="text-xs text-gray-400">{t.settings.subscription.trialExpiredDesc}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={billingLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-md transition-colors"
                >
                  {billingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {t.settings.subscription.subscribe}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Integrations */}
        <Link
          href="/dashboard/settings/integrations"
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors block"
        >
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Integrações</p>
                <p className="text-xs text-gray-400">API Keys, Módulo Respondentes e sync de perfil</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </Link>

        {/* Company details */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">{t.settings.company.title}</h2>
            </div>
            {!editing && !loading && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Pencil className="w-3 h-3" />
                {t.common.edit}
              </button>
            )}
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-48 bg-gray-100 rounded" />
                <div className="h-4 w-36 bg-gray-100 rounded" />
              </div>
            ) : editing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    {t.settings.company.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.settings.company.namePlaceholder}
                    autoFocus
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    {t.settings.company.cnpjLabel} <span className="text-gray-400 font-normal">{t.settings.company.cnpjOptional}</span>
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                    placeholder={t.settings.company.cnpjPlaceholder}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder-gray-400"
                  />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSaveCompany}
                    disabled={saving || !companyName.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {t.common.save}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{t.settings.company.nameLabel}</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {userData?.companyName || <span className="text-gray-400 font-normal">{t.settings.company.notProvided}</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{t.settings.company.cnpjLabel}</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {userData?.cnpj || <span className="text-gray-400 font-normal">{t.settings.company.notProvided}</span>}
                  </p>
                </div>
                {saved && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t.settings.company.savedMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

