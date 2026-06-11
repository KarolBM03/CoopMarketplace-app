import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Correo invalido");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{8,20}$/, "Telefono invalido");

export const documentSchema = z
  .string()
  .trim()
  .regex(/^[0-9-]{9,13}$/, "Cedula/RNC invalido");

export const strongPasswordSchema = z
  .string()
  .min(8, "Minimo 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir una mayuscula")
  .regex(/[a-z]/, "Debe incluir una minuscula")
  .regex(/[0-9]/, "Debe incluir un numero");

export const moneySchema = z.coerce
  .number()
  .positive("El monto debe ser mayor que 0");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contrasena es requerida"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "Nombre requerido"),
    email: emailSchema,
    phone: phoneSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "SELLER"]),
    acceptedTerms: z.boolean().refine(Boolean, "Debes aceptar los terminos"),
    storeName: z.string().optional(),
    mainCategory: z.string().optional(),
    city: z.string().optional(),
    documentId: documentSchema,
    bankAccount: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Las contrasenas no coinciden",
      });
    }

    if (data.role === "SELLER") {
      [
        ["storeName", data.storeName],
        ["mainCategory", data.mainCategory],
        ["city", data.city],
        ["bankAccount", data.bankAccount],
      ].forEach(([field, value]) => {
        if (!String(value || "").trim()) {
          ctx.addIssue({
            code: "custom",
            path: [field as string],
            message: "Campo requerido para vendedores",
          });
        }
      });
    }
  });

export const financingSchema = z.object({
  cedula: documentSchema,
  income: moneySchema,
  company: z.string().trim().min(2, "Empresa requerida"),
  phone: phoneSchema,
  address: z.string().trim().min(5, "Direccion requerida"),
});

export const walletRechargeSchema = z.object({
  amount: moneySchema,
});
