import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — SurveyFlow",
  description: "Termos e condições de uso da plataforma SurveyFlow.",
};

function Logo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <rect x="3" y="19" width="18" height="10" rx="3" fill="white" />
      <rect x="28" y="8" width="17" height="10" rx="3" fill="white" />
      <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55" />
      <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
      <circle cx="21" cy="24" r="3" fill="white" />
      <circle cx="28" cy="13" r="2.5" fill="white" />
      <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55" />
    </svg>
  );
}

const LAST_UPDATED = "12 de março de 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen text-gray-900 antialiased">

      {/* Navbar */}
      <header className="sticky top-0 z-50 h-[60px] flex items-center border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-[28px] h-[28px] bg-gray-900 rounded-[8px] flex items-center justify-center">
              <Logo />
            </div>
            <span className="text-[15px] font-bold tracking-tight">SurveyFlow</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[14px] text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-[40px] sm:text-[52px] font-extrabold tracking-[-0.03em] leading-[1.05] text-gray-950 mb-4">
            Termos de Uso
          </h1>
          <p className="text-[15px] text-gray-500">
            Última atualização: <span className="text-gray-700 font-medium">{LAST_UPDATED}</span>
          </p>
        </div>

        {/* Body */}
        <div className="prose-custom space-y-10">

          <Section title="1. Aceitação dos Termos">
            <p>
              Ao acessar ou utilizar a plataforma SurveyFlow ("Serviço"), você concorda em ficar vinculado a estes
              Termos de Uso. Caso não concorde com algum ponto, não utilize o Serviço.
            </p>
            <p>
              O uso continuado após alterações nos Termos constitui aceitação das novas condições. Recomendamos
              revisar este documento periodicamente.
            </p>
          </Section>

          <Section title="2. Descrição do Serviço">
            <p>
              O SurveyFlow é uma plataforma de criação de pesquisas e formulários baseada em editor visual node-based,
              que permite criar fluxos condicionais, coletar respostas e visualizar resultados.
            </p>
            <p>O Serviço inclui, mas não se limita a:</p>
            <ul>
              <li>Editor visual de fluxo com arrasto e conexão de nós</li>
              <li>Publicação de pesquisas via link ou embed</li>
              <li>Coleta e armazenamento de respostas</li>
              <li>Dashboard de análise de resultados</li>
              <li>Sistema de pontuação e scoring</li>
            </ul>
          </Section>

          <Section title="3. Conta de Usuário">
            <p>
              Para usar o Serviço, você deve criar uma conta utilizando autenticação Google OAuth. Você é responsável
              por manter a confidencialidade das credenciais e por todas as atividades realizadas na sua conta.
            </p>
            <p>
              Você concorda em notificar imediatamente a SurveyFlow sobre qualquer uso não autorizado da sua conta.
              A SurveyFlow não será responsável por perdas decorrentes de uso não autorizado.
            </p>
            <p>
              Reservamo-nos o direito de encerrar contas que violem estes Termos ou que estejam inativas por
              período superior a 12 meses, com aviso prévio por e-mail sempre que possível.
            </p>
          </Section>

          <Section title="4. Uso Aceitável">
            <p>Você concorda em utilizar o Serviço somente para fins lícitos e de acordo com estes Termos. É expressamente proibido:</p>
            <ul>
              <li>Coletar dados pessoais sem o consentimento dos respondentes</li>
              <li>Criar pesquisas com conteúdo ilegal, ofensivo, discriminatório ou enganoso</li>
              <li>Utilizar o Serviço para envio de spam ou comunicações não solicitadas</li>
              <li>Tentar acessar sistemas ou dados não autorizados</li>
              <li>Fazer engenharia reversa, descompilar ou reproduzir qualquer parte do Serviço</li>
              <li>Revender ou sublicenciar o acesso ao Serviço sem autorização expressa</li>
              <li>Sobrecarregar intencionalmente a infraestrutura da plataforma</li>
            </ul>
            <p>
              A violação dessas regras pode resultar na suspensão imediata da conta, sem direito a reembolso
              proporcional ao período não utilizado.
            </p>
          </Section>

          <Section title="5. Propriedade Intelectual">
            <p>
              O SurveyFlow e todo o seu conteúdo, recursos e funcionalidades (incluindo código-fonte, design,
              logotipos e textos) são de propriedade exclusiva da SurveyFlow e protegidos por leis de
              propriedade intelectual.
            </p>
            <p>
              Você retém todos os direitos sobre o conteúdo que criar no Serviço, como títulos de pesquisas,
              perguntas e configurações. Ao usar o Serviço, você concede à SurveyFlow uma licença limitada,
              não exclusiva e não transferível para processar e armazenar esse conteúdo com o único propósito
              de fornecer o Serviço.
            </p>
          </Section>

          <Section title="6. Pagamento e Assinatura">
            <p>
              O SurveyFlow opera no modelo de assinatura mensal. Os valores e condições são exibidos na página
              de preços. Todo pagamento é processado de forma segura via Stripe.
            </p>
            <p>
              O período de teste gratuito de 7 dias não requer cartão de crédito. Após o período de teste,
              a assinatura é cobrada mensalmente de forma recorrente.
            </p>
            <p>
              Em caso de falha no pagamento, o acesso ao Serviço poderá ser suspenso após notificação por e-mail.
              Não realizamos reembolsos por períodos parcialmente utilizados, exceto quando exigido por lei.
            </p>
          </Section>

          <Section title="7. Cancelamento">
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento disponível
              em Configurações. O acesso permanece ativo até o fim do período já pago.
            </p>
            <p>
              Após o cancelamento, os dados da conta ficam disponíveis por 30 dias para exportação. Após esse prazo,
              os dados podem ser permanentemente excluídos.
            </p>
          </Section>

          <Section title="8. Disponibilidade e SLA">
            <p>
              Buscamos manter o Serviço disponível 24 horas por dia, 7 dias por semana, mas não garantimos
              disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre
              que possível.
            </p>
            <p>
              A SurveyFlow não se responsabiliza por perdas decorrentes de indisponibilidades temporárias,
              falhas de terceiros (como Firebase, Stripe ou provedores de nuvem) ou eventos fora do nosso controle.
            </p>
          </Section>

          <Section title="9. Limitação de Responsabilidade">
            <p>
              Na máxima extensão permitida por lei, a SurveyFlow não será responsável por danos indiretos,
              incidentais, especiais, consequenciais ou punitivos, incluindo perda de dados, lucros cessantes
              ou interrupção de negócios.
            </p>
            <p>
              A responsabilidade total da SurveyFlow não excederá o valor pago pelo usuário nos últimos 3 meses
              de serviço.
            </p>
          </Section>

          <Section title="10. Alterações nos Termos">
            <p>
              Podemos modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas
              por e-mail com pelo menos 15 dias de antecedência. O uso continuado após a vigência das
              alterações constitui aceitação.
            </p>
          </Section>

          <Section title="11. Lei Aplicável">
            <p>
              Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será submetida ao foro da
              comarca de São Paulo — SP, com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
          </Section>

          <Section title="12. Contato">
            <p>
              Dúvidas sobre estes Termos? Entre em contato pelo e-mail:{" "}
              <span className="font-medium text-gray-800">suporte@surveyflow.com.br</span>
            </p>
          </Section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-8 px-6 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] bg-gray-900 rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Logo />
            </div>
            <span className="text-[14px] font-bold">SurveyFlow</span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-gray-400">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Política de Privacidade</Link>
            <span>·</span>
            <Link href="/" className="hover:text-gray-700 transition-colors">Voltar ao início</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 sm:p-8">
      <h2 className="text-[18px] font-bold text-gray-950 mb-4 pb-4 border-b border-gray-100">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] text-gray-600 leading-relaxed [&_ul]:space-y-2 [&_ul]:mt-2 [&_ul]:ml-1 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:before:content-['–'] [&_li]:before:text-gray-400 [&_li]:before:flex-shrink-0 [&_li]:before:mt-0.5">
        {children}
      </div>
    </section>
  );
}
