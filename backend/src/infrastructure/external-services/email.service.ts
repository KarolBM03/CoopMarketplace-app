import nodemailer from "nodemailer";

export const sendOTPEmail = async (email: string, otpCode: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CoopMarket" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Codigo de verificacion CoopMarket",
    html: `
      <div style="font-family: Arial; padding: 24px;">
        <h2>Verifica tu cuenta</h2>
        <p>Tu codigo OTP es:</p>
        <h1 style="color:#059669;">${otpCode}</h1>
        <p>Este codigo vence en 3 minutos.</p>
      </div>
    `,
  });
};

export const sendSellerApprovedEmail = async (
  email: string,
  fullName: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CoopMarket" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Tu cuenta de Vendedor fue aprobada",
    html: `
      <div style="font-family: Arial; padding: 24px;">
        <h2>Â¡Felicidades ${fullName}!</h2>

        <p>
          Tu cuenta de vendedor fue aprobada correctamente.
        </p>

        <p>
          Ya puedes publicar productos y comenzar a vender en CoopMarket.
        </p>

        <a
          href="http://localhost:5173/login"
          style="
            display:inline-block;
            margin-top:20px;
            padding:12px 24px;
            background:#059669;
            color:white;
            text-decoration:none;
            border-radius:12px;
            font-weight:bold;
          "
        >
          Iniciar sesion
        </a>
      </div>
    `,
  });
};

export const sendSellerRejectedEmail = async (
  email: string,
  fullName: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CoopMarket" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Tu solicitud de vendedor fue rechazada",
    html: `
      <div style="font-family: Arial; padding: 24px;">
        <h2>Hola ${fullName}</h2>

        <p>
          Tu solicitud para ser vendedor en CoopMarket fue rechazada.
        </p>

        <p>
          Puedes contactar al administrador para mas informacion o volver a enviar tus datos correctamente.
        </p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (
  email: string,
  fullName: string,
  resetLink: string,
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"CoopMarket" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Recuperar contraseña",
    html: `
      <div style="font-family: Arial; padding: 24px;">
        <h2>Hola ${fullName}</h2>

        <p>
          Recibimos una solicitud para restablecer tu contraseña.
        </p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            margin-top:20px;
            padding:12px 24px;
            background:#059669;
            color:white;
            text-decoration:none;
            border-radius:12px;
            font-weight:bold;
          "
        >
          Restablecer contraseña
        </a>

        <p style="margin-top:20px;">
          Este enlace vence en 5 minutos.
        </p>
      </div>
    `,
  });
};



