import { Mail, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  resendOTP,
  verifyOTP,
  type OTPChannel,
} from "../../services/auth.service";

const channels: Array<{
  value: OTPChannel;
  label: string;
  description: string;
  icon: typeof Mail;
}> = [
  {
    value: "email",
    label: "Correo",
    description: "Enviar codigo al correo registrado",
    icon: Mail,
  },
  {
    value: "sms",
    label: "SMS",
    description: "Enviar codigo por mensaje de texto",
    icon: Smartphone,
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "Enviar codigo por WhatsApp",
    icon: MessageCircle,
  },
];

const channelMessage: Record<OTPChannel, string> = {
  email: "correo",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(location.state?.email || "");
  const [phone] = useState(location.state?.phone || "");
  const [channel, setChannel] = useState<OTPChannel>("email");
  const [otpCode, setOtpCode] = useState("");
  const [sending, setSending] = useState(false);

  const phoneChannelsDisabled = !phone;

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast.error("No encontramos el correo de la cuenta");
      return;
    }

    if (otpCode.length !== 6) {
      toast.error("Ingresa los 6 digitos del codigo");
      return;
    }

    try {
      await verifyOTP({
        email,
        otpCode,
        channel,
      });

      toast.success("Cuenta verificada correctamente");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error verificando OTP");
    }
  };

  const handleResend = async () => {
    try {
      if (!email) {
        toast("Ingresa tu correo primero");
        return;
      }

      if (channel !== "email" && !phone) {
        toast.error("Esta cuenta no tiene telefono registrado");
        return;
      }

      setSending(true);
      await resendOTP(email, channel);

      toast.success(`Nuevo codigo enviado por ${channelMessage[channel]}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error reenviando codigo");
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const nextOtp =
      otpCode.substring(0, index) + value + otpCode.substring(index + 1);

    setOtpCode(nextOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-8">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-8 shadow-2xl sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="mt-6 text-center">
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
            Verificacion segura
          </span>

          <h1 className="mt-6 text-4xl font-black text-slate-950">
            Verifica tu cuenta
          </h1>

          <p className="mt-3 text-slate-500">
            Elige por donde quieres recibir el codigo y luego ingresa los 6
            digitos.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {channels.map((option) => {
            const Icon = option.icon;
            const disabled = option.value !== "email" && phoneChannelsDisabled;
            const active = channel === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setChannel(option.value);
                  setOtpCode("");
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <p className="mt-3 font-black">{option.label}</p>
                <p className="mt-1 text-xs font-semibold leading-5">
                  {disabled ? "Telefono no registrado" : option.description}
                </p>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleVerify} className="mt-8 grid gap-5">
          <input
            type="email"
            value={email}
            disabled
            className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 font-semibold text-slate-600 outline-none"
          />

          {channel !== "email" && (
            <input
              type="text"
              value={phone || "Sin telefono registrado"}
              disabled
              className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 font-semibold text-slate-600 outline-none"
            />
          )}

          <div className="flex justify-between gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpCode[index] || ""}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !otpCode[index] && index > 0) {
                    document.getElementById(`otp-${index - 1}`)?.focus();
                  }
                }}
                id={`otp-${index}`}
                className="h-14 w-12 rounded-2xl border border-slate-200 bg-slate-50 text-center text-2xl font-black outline-none focus:border-emerald-500 sm:h-16 sm:w-14"
              />
            ))}
          </div>

          <button
            type="submit"
            className="h-14 rounded-2xl bg-emerald-600 font-black text-white transition hover:bg-emerald-500"
          >
            Verificar cuenta
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="h-14 rounded-2xl border border-slate-300 font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending
              ? "Enviando..."
              : `Reenviar codigo por ${channelMessage[channel]}`}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500">
          Ya verificaste?{" "}
          <Link to="/login" className="font-black text-emerald-600">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
