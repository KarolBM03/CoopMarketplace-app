import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  message: {
    message: "Demasiados intentos de autenticación. Intenta más tarde.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,

  max: 5,

  message: {
    message: "Demasiados intentos de OTP. Intenta más tarde.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,

  max: 10,

  message: {
    message: "Demasiados pagos procesados. Intenta más tarde.",
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



