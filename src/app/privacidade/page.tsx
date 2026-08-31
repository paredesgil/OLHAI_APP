import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Política de Privacidade — OLHAÍ" };

export default function PrivacidadePage() {
  return (
    <main className="px-5 pb-12 pt-5">
      <Link
        href="/"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-5 w-5 text-navy" />
      </Link>

      <h1 className="mb-1 text-[20px] font-extrabold text-ink">
        Política de Privacidade
      </h1>
      <p className="mb-6 text-[12px] text-muted">Última atualização: agosto de 2026</p>

      <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-ink/85">
        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            1. Quais dados coletamos
          </h2>
          <p className="mb-2">Ao usar o OLHAÍ, podemos coletar:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>De quem se cadastra (vendedor):</strong> nome, e-mail, WhatsApp, cidade e senha (armazenada de forma criptografada).</li>
            <li><strong>Dos anúncios:</strong> título, descrição, preço, categoria, fotos e localização do produto.</li>
            <li><strong>De navegação:</strong> visualizações de anúncios, cliques no botão do WhatsApp, buscas realizadas e compartilhamentos — registrados de forma anônima, associados a uma sessão do navegador, não à sua identidade, quando você não está logado.</li>
          </ul>
          <p className="mt-2">
            Compradores podem navegar, buscar e entrar em contato com
            vendedores sem criar conta e sem fornecer nenhum dado pessoal.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            2. Para que usamos esses dados
          </h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>viabilizar o cadastro, login e publicação de anúncios;</li>
            <li>conectar compradores interessados aos vendedores via WhatsApp;</li>
            <li>mostrar ao vendedor quantas visualizações e contatos seus anúncios receberam;</li>
            <li>identificar e prevenir fraudes, golpes e anúncios proibidos;</li>
            <li>melhorar a plataforma com base em métricas de uso (nunca vendidas a terceiros).</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            3. Com quem compartilhamos
          </h2>
          <p className="mb-2">
            Não vendemos seus dados. O WhatsApp que você cadastra como
            vendedor fica visível para quem demonstra interesse no seu
            anúncio — essa é a única forma de contato que o OLHAÍ viabiliza,
            e ela é necessária para o próprio funcionamento do serviço.
          </p>
          <p>
            Usamos o Supabase como infraestrutura de banco de dados,
            autenticação e armazenamento de imagens — um prestador de
            serviços que processa os dados em nosso nome, sob as mesmas
            obrigações de proteção de dados.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            4. Cookies e armazenamento local
          </h2>
          <p>
            Guardamos, no seu navegador, um identificador de sessão anônimo
            (para medir visualizações sem te identificar) e a cidade que você
            escolheu ver no app. Nenhum desses dados identifica você
            pessoalmente enquanto estiver deslogado.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            5. Seus direitos (LGPD)
          </h2>
          <p className="mb-2">
            De acordo com a Lei Geral de Proteção de Dados, você pode, a
            qualquer momento:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>solicitar acesso aos dados que temos sobre você;</li>
            <li>pedir a correção de dados incorretos ou desatualizados;</li>
            <li>pedir a exclusão da sua conta e dos seus dados pessoais;</li>
            <li>revogar o consentimento dado, quando aplicável.</li>
          </ul>
          <p className="mt-2">
            Para exercer qualquer um desses direitos, envie um e-mail para{" "}
            <span className="font-medium text-ink">contato@olhai.com.br</span>.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            6. Retenção e segurança
          </h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou enquanto
            forem necessários para as finalidades descritas acima. Adotamos
            medidas técnicas razoáveis (como controle de acesso e criptografia
            de senha) para proteger seus dados, mas nenhum sistema é 100%
            imune a incidentes de segurança.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            7. Alterações nesta política
          </h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente.
            Mudanças relevantes serão comunicadas dentro do aplicativo.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">8. Contato</h2>
          <p>
            Dúvidas sobre privacidade podem ser enviadas para{" "}
            <span className="font-medium text-ink">contato@olhai.com.br</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
