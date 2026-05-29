import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    try {
      await resetPassword(token as string, password);

      toast.success("Contrasena actualizada correctamente");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error actualizando contrasena");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl">
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
          Nueva contraseña
        </span>

        <h1 className="mt-6 text-4xl font-black text-slate-950">
          Restablecer contraseña
        </h1>

        <p className="mt-3 text-slate-500">
          Escribe tu nueva contraseña para recuperar el acceso.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-emerald-500"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            className="h-14 rounded-2xl bg-emerald-600 font-black text-white hover:bg-emerald-500"
          >
            Guardar contraseña
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          Volver a{" "}
          <Link to="/login" className="font-black text-emerald-600">
            iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}






