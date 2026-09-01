import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Termos de Uso — OLHAÍ" };

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-12 pt-5 md:max-w-3xl md:px-8 md:pt-10">
      <Link
        href="/"
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-line"
        aria-label="Voltar"
      >
        <ChevronLeft className="h-5 w-5 text-navy" />
      </Link>

      <h1 className="mb-1 text-[20px] font-extrabold text-ink">Termos de Uso</h1>
      <p className="mb-6 text-[12px] text-muted">Última atualização: agosto de 2026</p>

      <div className="flex flex-col gap-5 text-[14px] leading-relaxed text-ink/85">
        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">1. O que é o OLHAÍ</h2>
          <p>
            O OLHAÍ é um marketplace regional de classificados: um espaço digital
            que aproxima pessoas que querem vender produtos novos ou usados de
            pessoas que querem comprar, na mesma região. Compradores podem
            navegar e entrar em contato com vendedores sem precisar de
            cadastro; vendedores precisam de uma conta para publicar e
            gerenciar anúncios.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            2. O papel do OLHAÍ na negociação
          </h2>
          <p className="mb-2">
            <strong>O OLHAÍ é apenas uma ferramenta de aproximação entre
            comprador e vendedor.</strong> A negociação, o combinado de preço,
            forma de pagamento, entrega e qualquer outro detalhe da compra e
            venda acontece diretamente entre as partes — geralmente pelo
            WhatsApp — sem qualquer participação, intermediação ou supervisão
            do OLHAÍ.
          </p>
          <p className="mb-2">Por isso, o OLHAÍ não é responsável por:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>a existência, qualidade, origem, legalidade ou estado real do produto anunciado;</li>
            <li>a veracidade das informações, fotos ou preço publicados pelo vendedor;</li>
            <li>o pagamento feito entre comprador e vendedor, inclusive em caso de golpe, fraude ou não recebimento do valor combinado;</li>
            <li>a entrega, troca, devolução ou garantia do produto;</li>
            <li>qualquer prejuízo financeiro, material ou de outra natureza decorrente da negociação.</li>
          </ul>
          <p className="mt-2">
            O OLHAÍ não participa da transação financeira em nenhuma etapa —
            não existe pagamento dentro do aplicativo, nem qualquer forma de
            intermediação de valores.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            3. Responsabilidades do vendedor
          </h2>
          <p>
            Ao publicar um anúncio, o vendedor declara que as informações são
            verdadeiras, que tem o direito de vender o produto anunciado, e
            que o item não é proibido, roubado, falsificado ou de origem
            ilícita. O vendedor é o único responsável pelo conteúdo do próprio
            anúncio.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            4. Denúncias e moderação
          </h2>
          <p>
            Qualquer pessoa pode denunciar um anúncio suspeito, enganoso ou
            proibido. O OLHAÍ pode remover anúncios, suspender ou banir contas
            que violem estes termos, a seu critério, sem aviso prévio quando
            necessário para a segurança da comunidade.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            5. Recomendações de segurança
          </h2>
          <p>Para negociar com mais segurança, recomendamos:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>preferir encontros em locais públicos e movimentados;</li>
            <li>conferir o produto pessoalmente antes de pagar;</li>
            <li>desconfiar de preços muito abaixo do mercado ou pressão para pagar antecipado;</li>
            <li>denunciar qualquer anúncio ou comportamento suspeito.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">
            6. Alterações nestes termos
          </h2>
          <p>
            Podemos atualizar estes Termos de Uso periodicamente. Mudanças
            relevantes serão comunicadas dentro do aplicativo.
          </p>
        </section>

        <section>
          <h2 className="mb-1.5 text-[15px] font-bold text-ink">7. Contato</h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <span className="font-medium text-ink">contato@olhaiapp.com.br</span>.
          </p>
        </section>
      </div>
    </main>
  );
}
