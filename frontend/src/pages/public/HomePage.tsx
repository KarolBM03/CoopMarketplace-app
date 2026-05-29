import { Link } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  Percent,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 font-bold text-white">
            C
          </div>
          <h2 className="text-xl font-bold">CoopMarket</h2>
        </div>

        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link to="/marketplace">Productos</Link>
          <Link to="/login">Iniciar Sesión</Link>
          <Link
            to="/register"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
          >
            Registrarte
          </Link>
        </nav>
      </header>

      <section className="bg-gradient-to-br from-emerald-50 to-orange-50 px-5 py-28 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-black leading-tight md:text-6xl">
          Compra ahora, <span className="text-emerald-600">paga en cuotas</span>{" "}
          accesibles
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">
          Buscas un mercado con financiamiento, ¡Te paraste bien! Llegaste a
          la app que es. Explora miles de productos, elige lo que te gusta y
          págalo en cómodas cuotas. Sin complicaciones y sin sorpresas. ¡Entra y
          estrena hoy mismo!
        </p>

        <div className="mt-9 flex justify-center gap-4">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
          >
            Ver productos <ArrowRight size={17} />
          </Link>

          <a
            href="#financiamiento"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold"
          >
            ¿Cómo funciona?
          </a>
        </div>
      </section>

      <section className="px-5 py-20">
        <h2 className="mb-12 text-center text-3xl font-black">
          ¿Por qué tienes que elegirnos?
        </h2>

        <div className="grid gap-8 md:grid-cols-4">
          <FeatureCard
            icon={<CreditCard size={25} />}
            title="Financiamiento Flexible"
            text="Paga en 3, 6 o 12 cuotas con tasas competitivas"
          />

          <FeatureCard
            icon={<Percent size={25} />}
            title="Tasas Justas"
            text="Respaldado por cooperativa con tasas transparentes"
          />

          <FeatureCard
            icon={<ShieldCheck size={25} />}
            title="Compra Segura"
            text="Transacciones protegidas y garantía de compra"
          />

          <FeatureCard
            icon={<Truck size={25} />}
            title="Envío Gratis"
            text="En todas tus compras sin monto mínimo"
          />
        </div>
      </section>

      <section
        id="financiamiento"
        className="border-y border-slate-200 bg-sky-50 px-5 py-24 text-center"
      >
        <h2 className="mb-14 text-3xl font-black">
          ¿Cómo funciona nuestro financiamiento?
        </h2>

        <div className="mb-14 grid gap-12 md:grid-cols-3">
          <Step
            number="1"
            title="Elige tu producto"
            text="Navega nuestro catálogo y selecciona lo que necesitas"
          />

          <Step
            number="2"
            title="Solicita financiamiento"
            text="Completa tu información y elige el plan de cuotas"
          />

          <Step
            number="3"
            title="Recibe tu producto"
            text="Aprobación rápida y envío inmediato a tu domicilio"
          />
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
        >
          Empieza a comprar <ArrowRight size={17} />
        </Link>
      </section>

      <section className="mx-5 my-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 px-5 py-20 text-center text-white">
        <h2 className="text-3xl font-black">
          ¿Estas listo para comenzar ahora mismo?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-lg">
          Regístrate ahora y obtén acceso a financiamiento inmediato en miles de
          productos.
        </p>

        <Link
          to="/register"
          className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-600"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <footer className="grid gap-10 border-t border-slate-200 bg-white px-5 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 font-bold text-white">
              C
            </div>
            <h2 className="text-xl font-bold">CoopMarket</h2>
          </div>

          <p className="mt-5 max-w-xs leading-7 text-slate-500">
            Tu mercado con financiamiento cooperativo. Compra ahora, paga en
            cuotas accesibles.
          </p>
        </div>

        <FooterColumn
          title="Comprar"
          links={["Todos los productos", "Electrónica", "Accesorios"]}
        />

        <FooterColumn
          title="Financiamiento"
          links={[
            "¿Cómo funciona?",
            "Mis financiamientos",
            "Calculadora de cuotas",
          ]}
        />

        <FooterColumn
          title="Ayuda"
          links={["Preguntas frecuentes", "Contacto", "Términos y condiciones"]}
        />
      </footer>

      <div className="border-t border-slate-100 bg-white py-6 text-center text-sm text-slate-500">
        © 2026 Mercado Cooperativa. Todos los derechos reservados.
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        {icon}
      </div>
      <h3 className="mb-3 font-bold">{title}</h3>
      <p className="leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-2xl font-black text-white">
        {number}
      </div>
      <h3 className="mb-3 font-bold">{title}</h3>
      <p className="text-slate-500">{text}</p>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-5 font-bold">{title}</h3>
      <div className="flex flex-col gap-3 text-slate-500">
        {links.map((link) => (
          <a key={link} href="#" className="text-sm">
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}
