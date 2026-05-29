import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/auth.service";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const location = useLocation();

  const email = location.state?.email || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
      toast.success("Te enviamos un correo para recuperar tu contraseña");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error enviando recuperacion",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl">
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
          Recuperación
        </span>

        <h1 className="mt-6 text-4xl font-black text-slate-950">
          Olvidé mi contraseña
        </h1>

        <p className="mt-3 text-slate-500">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div>
            <p className="mb-2 text-sm font-bold text-slate-600">
              Correo de recuperación
            </p>

            <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-100 px-5 text-sm font-bold text-slate-700">
              {email || "No hay correo"}
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Este correo está asociado a tu cuenta y no puede ser modificado.
            </p>
          </div>

          <button
            type="submit"
            disabled={!email}
            className="h-14 rounded-2xl bg-emerald-600 font-black text-white hover:bg-emerald-500"
          >
            Enviar enlace
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          ¿Recordaste tu contraseña?{" "}
          <Link to="/login" className="font-black text-emerald-600">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
