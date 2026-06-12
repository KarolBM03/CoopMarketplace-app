import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Demasiados intentos de autenticacion. Intenta mas tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    message: "Demasiados intentos de OTP. Intenta mas tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    message: "Demasiados pagos procesados. Intenta mas tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const financingLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: {
    message: "Demasiadas solicitudes de financiamiento.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const cooperativeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: {
    message: "Demasiadas solicitudes a la integracion cooperativa.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message: "Demasiados webhooks recibidos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
