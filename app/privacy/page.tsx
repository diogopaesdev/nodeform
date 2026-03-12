import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — SurveyFlow",
  description: "Como a SurveyFlow coleta, usa e protege seus dados pessoais.",
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

export default function PrivacyPage() {
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
            Política de Privacidade
          </h1>
          <p className="text-[15px] text-gray-500">
            Última atualização: <span className="text-gray-700 font-medium">{LAST_UPDATED}</span>
          </p>
        </div>

        {/* Intro callout */}
        <div className="mb-10 p-5 bg-orange-50 border border-orange-200 rounded-2xl">
          <p className="text-[14px] text-orange-800 leading-relaxed">
            <span className="font-semibold">Resumo simples:</span> coletamos apenas o necessário para fornecer o
            Serviço, nunca vendemos seus dados e você tem controle total sobre eles. Leia abaixo para os detalhes.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-10">

          <Section title="1. Quem somos">
            <p>
              A SurveyFlow é a controladora dos dados pessoais tratados nesta política. Operamos a plataforma
              de criação de pesquisas acessível em <span className="font-medium text-gray-800">surveyflow.com.br</span>.
            </p>
            <p>
              Para dúvidas sobre privacidade, entre em contato com nosso encarregado de dados (DPO) em{" "}
              <span className="font-medium text-gray-800">privacidade@surveyflow.com.br</span>.
            </p>
          </Section>

          <Section title="2. Dados que coletamos">
            <p>Coletamos as seguintes categorias de dados:</p>
            <Subsection label="Dados de conta">
              <ul>
                <li>Nome e endereço de e-mail (via autenticação Google OAuth)</li>
                <li>Foto de perfil (fornecida pelo Google, opcional)</li>
                <li>Data e hora de criação da conta</li>
              </ul>
            </Subsection>
            <Subsection label="Dados de uso">
              <ul>
                <li>Pesquisas criadas (título, nós, configurações)</li>
                <li>Respostas coletadas nas suas pesquisas (respondentes)</li>
                <li>Logs de acesso e atividade na plataforma</li>
              </ul>
            </Subsection>
            <Subsection label="Dados de pagamento">
              <ul>
                <li>Informações de assinatura e status de pagamento (gerenciados pelo Stripe)</li>
                <li>Não armazenamos dados de cartão de crédito diretamente</li>
              </ul>
            </Subsection>
            <Subsection label="Dados técnicos">
              <ul>
                <li>Endereço IP, tipo de navegador e sistema operacional</li>
                <li>Cookies de sessão e autenticação</li>
                <li>Dados de desempenho e erros (para melhoria do serviço)</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="3. Como usamos seus dados">
            <p>Utilizamos seus dados para:</p>
            <ul>
              <li>Fornecer, operar e manter o Serviço</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Enviar comunicações essenciais (confirmações, alertas de conta, alterações nos Termos)</li>
              <li>Melhorar a plataforma com base em padrões de uso anônimos</li>
              <li>Responder a solicitações de suporte</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
            <p>
              Não utilizamos seus dados para publicidade de terceiros, não compartilhamos com anunciantes
              e não criamos perfis comportamentais para venda.
            </p>
          </Section>

          <Section title="4. Base legal para o tratamento (LGPD)">
            <p>
              O tratamento dos seus dados é fundamentado nas seguintes bases legais previstas na Lei Geral de
              Proteção de Dados (Lei nº 13.709/2018):
            </p>
            <ul>
              <li><span className="font-medium text-gray-800">Execução de contrato:</span> para fornecer os serviços contratados</li>
              <li><span className="font-medium text-gray-800">Legítimo interesse:</span> para melhorias da plataforma e segurança</li>
              <li><span className="font-medium text-gray-800">Cumprimento de obrigação legal:</span> quando exigido por lei</li>
              <li><span className="font-medium text-gray-800">Consentimento:</span> para comunicações opcionais de marketing</li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de dados">
            <p>
              Compartilhamos dados apenas com os seguintes prestadores de serviço, estritamente necessários
              para o funcionamento da plataforma:
            </p>
            <Table
              headers={["Provedor", "Finalidade", "País"]}
              rows={[
                ["Google (Firebase)", "Autenticação e banco de dados", "EUA / Global"],
                ["Stripe", "Processamento de pagamentos", "EUA / Global"],
                ["Google Cloud", "Armazenamento de arquivos", "EUA / Global"],
                ["Vercel", "Hospedagem da aplicação", "EUA / Global"],
              ]}
            />
            <p>
              Todos os provedores estão sujeitos a acordos de proteção de dados adequados e operam em
              conformidade com o GDPR e/ou legislação equivalente.
            </p>
            <p>
              Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins comerciais próprios.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>Utilizamos os seguintes tipos de cookies:</p>
            <ul>
              <li><span className="font-medium text-gray-800">Essenciais:</span> necessários para autenticação e funcionamento do Serviço (não podem ser desativados)</li>
              <li><span className="font-medium text-gray-800">De sessão:</span> mantêm você autenticado durante a navegação</li>
              <li><span className="font-medium text-gray-800">De preferências:</span> armazenam configurações do editor no localStorage do navegador</li>
            </ul>
            <p>
              Não utilizamos cookies de rastreamento de terceiros nem tecnologias de publicidade comportamental.
            </p>
          </Section>

          <Section title="7. Seus direitos (LGPD)">
            <p>
              Como titular de dados, você tem os seguintes direitos garantidos pela LGPD, exercíveis a
              qualquer momento pelo e-mail <span className="font-medium text-gray-800">privacidade@surveyflow.com.br</span>:
            </p>
            <ul>
              <li><span className="font-medium text-gray-800">Confirmação e acesso:</span> confirmar se tratamos seus dados e solicitar cópia</li>
              <li><span className="font-medium text-gray-800">Correção:</span> solicitar a atualização de dados incorretos ou incompletos</li>
              <li><span className="font-medium text-gray-800">Exclusão:</span> solicitar a remoção de dados tratados com base em consentimento</li>
              <li><span className="font-medium text-gray-800">Portabilidade:</span> receber seus dados em formato estruturado</li>
              <li><span className="font-medium text-gray-800">Revogação de consentimento:</span> retirar consentimento dado anteriormente</li>
              <li><span className="font-medium text-gray-800">Oposição:</span> opor-se a tratamentos realizados com base em legítimo interesse</li>
            </ul>
            <p>
              Respondemos às solicitações em até 15 dias úteis. Podemos solicitar comprovação de identidade
              antes de processar o pedido.
            </p>
          </Section>

          <Section title="8. Retenção de dados">
            <p>Mantemos seus dados pelos seguintes períodos:</p>
            <ul>
              <li>Dados de conta ativa: durante toda a vigência da conta</li>
              <li>Dados após cancelamento: 30 dias para exportação, depois excluídos</li>
              <li>Logs de transação: 5 anos (obrigação fiscal)</li>
              <li>Logs de segurança: 12 meses</li>
            </ul>
            <p>
              Você pode solicitar a exclusão antecipada dos seus dados a qualquer momento, respeitadas as
              obrigações legais de retenção.
            </p>
          </Section>

          <Section title="9. Segurança">
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:</p>
            <ul>
              <li>Transmissão de dados via HTTPS/TLS</li>
              <li>Autenticação via OAuth 2.0 (Google)</li>
              <li>Dados armazenados no Firebase com regras de segurança</li>
              <li>Acesso restrito a dados por colaboradores com necessidade funcional</li>
              <li>Monitoramento contínuo de vulnerabilidades</li>
            </ul>
            <p>
              Em caso de incidente de segurança que afete seus dados, notificaremos conforme exigido pela
              LGPD e pela ANPD.
            </p>
          </Section>

          <Section title="10. Transferência internacional">
            <p>
              Alguns dos nossos prestadores de serviço estão localizados fora do Brasil (principalmente nos EUA).
              Realizamos essas transferências com base em cláusulas contratuais padrão e mecanismos adequados
              de proteção de dados, garantindo nível de proteção equivalente ao da LGPD.
            </p>
          </Section>

          <Section title="11. Menores de idade">
            <p>
              O Serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores.
              Se você acredita que um menor utilizou o Serviço, entre em contato conosco para remoção imediata.
            </p>
          </Section>

          <Section title="12. Alterações nesta Política">
            <p>
              Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas
              por e-mail com antecedência mínima de 15 dias. A versão mais recente estará sempre disponível
              nesta página.
            </p>
          </Section>

          <Section title="13. Contato e DPO">
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato:
            </p>
            <ul>
              <li>E-mail geral: <span className="font-medium text-gray-800">suporte@surveyflow.com.br</span></li>
              <li>Encarregado de dados (DPO): <span className="font-medium text-gray-800">privacidade@surveyflow.com.br</span></li>
            </ul>
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
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Termos de Uso</Link>
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

function Subsection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="text-[13px] font-semibold text-gray-800 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i < rows.length - 1 ? "border-b border-gray-100" : ""}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-600">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
