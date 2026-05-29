import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { loginUser } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { loginSchema } from "../../utils/validation";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore.getState().login;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      const data = await loginUser(values);
      login(data.user, data.accessToken, data.refreshToken);

      if (data.user.role === "ADMIN") navigate("/admin");
      else if (data.user.role === "SELLER") navigate("/seller");
      else navigate("/customer");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al iniciar sesion");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-2">
        <div className="bg-emerald-700 p-10 text-white">
          <h1 className="text-3xl font-black">CoopMarket</h1>
          <h2 className="mt-20 text-4xl font-black leading-tight">
            Compra ahora,
            <br />
            paga en cuotas.
          </h2>
          <p className="mt-5 text-lg text-emerald-100">
            Accede a miles de productos con financiamiento flexible, cuotas
            cómodas y un proceso seguro para ti
          </p>
        </div>

        <div className="p-10">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
            Acceso seguro
          </span>

          <h2 className="mt-6 text-4xl font-black text-slate-900">
            Bienvenido
          </h2>
          <p className="mt-2 text-slate-500">Inicia sesion para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <input
                type="email"
                placeholder="Correo electronico"
                {...register("email")}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-emerald-500"
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <input
                type="password"
                placeholder="Contraseña"
                {...register("password")}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-emerald-500"
              />
              <FieldError message={errors.password?.message} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full rounded-2xl bg-emerald-600 font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 flex justify-start">
            <Link
              to="/forgot-password"
              state={{ email: watch("email") }}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-500"
            >
              Olvidaste tu contrasena?
            </Link>
          </div>

          <p className="mt-6 text-center text-slate-500">
            No tienes cuenta?{" "}
            <Link to="/register" className="font-black text-emerald-600">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-500">{message}</p>;
}
