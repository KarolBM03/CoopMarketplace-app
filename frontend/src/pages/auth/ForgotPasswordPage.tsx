import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { forgotPassword } from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Escribe tu correo");
      return;
    }

    try {
      await forgotPassword(email.trim());
      toast.success("Te enviamos un correo para recuperar tu contrasena");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error enviando recuperacion");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl">
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
          Recuperacion
        </span>

        <h1 className="mt-6 text-4xl font-black text-slate-950">
          Olvide mi contrasena
        </h1>

        <p className="mt-3 text-slate-500">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label>
            <p className="mb-2 text-sm font-bold text-slate-600">
              Correo de recuperacion
            </p>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu-correo@ejemplo.com"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
            />
          </label>

          <button
            type="submit"
            disabled={!email.trim()}
            className="h-14 rounded-2xl bg-emerald-600 font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Enviar enlace
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          Recordaste tu contrasena?{" "}
          <Link to="/login" className="font-black text-emerald-600">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
