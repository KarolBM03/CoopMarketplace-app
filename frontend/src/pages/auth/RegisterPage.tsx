import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { registerUser } from "../../services/auth.service";
import { uploadImage } from "../../services/upload.service";
import { registerSchema } from "../../utils/validation";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CUSTOMER",
      acceptedTerms: false,
    },
  });

  const role = watch("role");

  const onSubmit = async (values: RegisterForm) => {
    try {
      let finalIdentityImageUrl = "";

      if (values.role === "SELLER" && identityFile) {
        finalIdentityImageUrl = await uploadImage(identityFile);
      }

      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone,
        acceptedTerms: values.acceptedTerms,
        storeName: values.role === "SELLER" ? values.storeName : undefined,
        mainCategory:
          values.role === "SELLER" ? values.mainCategory : undefined,
        city: values.role === "SELLER" ? values.city : undefined,
        documentId: values.role === "SELLER" ? values.documentId : undefined,
        bankAccount: values.role === "SELLER" ? values.bankAccount : undefined,
        identityImageUrl:
          values.role === "SELLER" ? finalIdentityImageUrl : undefined,
      });

      navigate("/verify-otp", {
        state: {
          email: values.email,
          phone: values.phone,
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrarse");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl md:grid-cols-2">
        <div className="bg-emerald-700 p-10 text-white">
          <h1 className="text-3xl font-black">CoopMarket</h1>
          <h2 className="mt-20 text-4xl font-black leading-tight">
            Crea tu cuenta
            <br />y empieza hoy.
          </h2>
          <p className="mt-5 text-lg text-emerald-100">
            Que esperas accede a miles de productos con financiamiento flexible,
            cuotas cómodas y un proceso seguro para ti
          </p>
        </div>

        <div className="p-10">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
            Registro seguro
          </span>

          <h2 className="mt-6 text-4xl font-black text-slate-900">
            Crear cuenta
          </h2>
          <p className="mt-2 text-slate-500">
            Elige si quieres comprar o vender productos.
          </p>

          <div className="mb-5 mt-8 grid grid-cols-2 gap-4">
            <RoleButton
              active={role === "CUSTOMER"}
              label="Comprador"
              onClick={() =>
                setValue("role", "CUSTOMER", { shouldValidate: true })
              }
            />
            <RoleButton
              active={role === "SELLER"}
              label="Vendedor"
              onClick={() =>
                setValue("role", "SELLER", { shouldValidate: true })
              }
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              placeholder="Nombre completo"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <FormInput
              type="email"
              placeholder="Correo electronico"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormInput
              placeholder="Telefono"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <FormInput
              type="password"
              placeholder="Contraseña"
              error={errors.password?.message}
              {...register("password")}
            />
            <FormInput
              type="password"
              placeholder="Confirmar contraseña"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {role === "SELLER" && (
              <div className="grid gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <FormInput
                  placeholder="Nombre de la tienda"
                  error={errors.storeName?.message}
                  {...register("storeName")}
                />
                <FormInput
                  placeholder="Categoria principal"
                  error={errors.mainCategory?.message}
                  {...register("mainCategory")}
                />
                <FormInput
                  placeholder="Ciudad o direccion"
                  error={errors.city?.message}
                  {...register("city")}
                />
                <FormInput
                  placeholder="Cedula o RNC"
                  error={errors.documentId?.message}
                  {...register("documentId")}
                />
                <FormInput
                  placeholder="Cuenta bancaria"
                  error={errors.bankAccount?.message}
                  {...register("bankAccount")}
                />

                <div>
                  <p className="mb-2 text-sm font-bold text-slate-600">
                    Documento o imagen de identificacion
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setIdentityFile(event.target.files?.[0] || null)
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                {...register("acceptedTerms")}
                className="mt-1"
              />
              Acepto los terminos y condiciones de CoopMarket.
            </label>
            <FieldError message={errors.acceptedTerms?.message} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full rounded-2xl bg-emerald-600 font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Creando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500">
            Ya tienes cuenta?{" "}
            <Link to="/login" className="font-black text-emerald-600">
              Iniciar sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 font-bold transition ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

function FormInput({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <label className="block">
      <input
        {...props}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 outline-none focus:border-emerald-500"
      />
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-500">{message}</p>;
}
