import { randomUUID } from "crypto";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

const MOCK_TOKEN = "mock-coop-token";

const mockMembers = [
  {
    id: 1001,
    nombre: "Cliente",
    apellidos: "Elegible",
    identificacion: "00100000000",
    email: "cliente.elegible@mock.test",
    telefonoPrincipal: "8090000001",
    estado: 1,
    estadoDescripcion: "ACTIVO",
    calificacionCrediticia: "A",
    tieneRestriccionMonto: false,
    montoMaximoPrestamo: 250000,
    esElegibleParaPrestamo: true,
    cantidadPrestamosActivos: 0,
    montoTotalPrestamos: 0,
  },
  {
    id: 1002,
    nombre: "Cliente",
    apellidos: "No Elegible",
    identificacion: "00200000000",
    email: "cliente.noelegible@mock.test",
    telefonoPrincipal: "8090000002",
    estado: 1,
    estadoDescripcion: "ACTIVO",
    calificacionCrediticia: "D",
    tieneRestriccionMonto: true,
    montoMaximoPrestamo: 0,
    esElegibleParaPrestamo: false,
    cantidadPrestamosActivos: 3,
    montoTotalPrestamos: 180000,
  },
];

const loanTypes = [
  {
    id: 1,
    nombre: "Prestamo de consumo",
    descripcion: "Financiamiento para compras personales",
    activo: true,
  },
  {
    id: 2,
    nombre: "Prestamo marketplace",
    descripcion: "Financiamiento para productos del marketplace",
    activo: true,
  },
];

const requireMockApiKey = (req: Request, res: Response, next: NextFunction) => {
  const expectedKey = process.env.COOP_MOCK_API_KEY || process.env.COOP_API_KEY;

  if (!expectedKey) {
    return next();
  }

  const receivedKey = req.header("x-api-key");

  if (receivedKey !== expectedKey) {
    return res.status(401).json({
      succeeded: false,
      message: "Clave mock de cooperativa invalida",
      data: null,
      errors: ["INVALID_MOCK_API_KEY"],
    });
  }

  return next();
};

const requireMockToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("authorization")?.replace("Bearer ", "");

  if (token !== MOCK_TOKEN) {
    return res.status(401).json({
      succeeded: false,
      message: "Token mock de cooperativa invalido",
      data: null,
      errors: ["INVALID_MOCK_TOKEN"],
    });
  }

  return next();
};

router.post("/api/Authentication", requireMockApiKey, (req, res) => {
  const username = process.env.COOP_MOCK_USERNAME || "mock-admin";
  const password = process.env.COOP_MOCK_PASSWORD || "mock-password";

  if (req.body?.username !== username || req.body?.password !== password) {
    return res.status(400).json({
      succeeded: false,
      message: "Credenciales mock invalidas",
      data: null,
      errors: ["INVALID_CREDENTIALS"],
    });
  }

  return res.json({
    succeeded: true,
    message: "Login mock correcto",
    errors: [],
    data: {
      id: "mock-user-id",
      userName: username,
      email: "mock-admin@coophispanica.test",
      roles: ["Admin"],
      jwToken: MOCK_TOKEN,
      refreshToken: "mock-refresh-token",
      socioId: 1001,
    },
  });
});

router.use(requireMockApiKey);
router.use(requireMockToken);

router.get("/api/Socios/cedula/:identificacion", (req, res) => {
  const member = mockMembers.find(
    (item) => item.identificacion === req.params.identificacion,
  );

  if (!member) {
    return res.status(404).json({
      succeeded: false,
      message: "Socio no encontrado",
      data: null,
      errors: ["MEMBER_NOT_FOUND"],
    });
  }

  return res.json({
    succeeded: true,
    message: "Socio encontrado",
    errors: [],
    data: member,
  });
});

router.post("/api/Socios", (req, res) => {
  const id = Math.floor(Date.now() / 1000);
  const member = {
    id,
    nombreCompleto: req.body?.nombreCompleto,
    email: req.body?.email,
    telefonoPrincipal: req.body?.telefonoPrincipal,
    identificacion: req.body?.identificacion,
    estado: 1,
    estadoDescripcion: "ACTIVO",
    memberNumber: `MOCK-SOCIO-${id}`,
    esElegibleParaPrestamo: true,
    montoMaximoPrestamo: 150000,
  };

  return res.status(201).json({
    succeeded: true,
    message: "Socio mock creado",
    errors: [],
    data: member,
  });
});

router.get("/api/Socios/detail/:socioId", (req, res) => {
  const member = mockMembers.find((item) => item.id === Number(req.params.socioId));

  if (!member) {
    return res.status(404).json({
      succeeded: false,
      message: "Socio no encontrado",
      data: null,
      errors: ["MEMBER_NOT_FOUND"],
    });
  }

  return res.json({
    succeeded: true,
    message: "Detalle mock del socio",
    errors: [],
    data: member,
  });
});

router.get("/api/Socios/:id/elegibilidad-prestamo", (req, res) => {
  const member = mockMembers.find((item) => item.id === Number(req.params.id));

  if (!member) {
    return res.status(404).json({
      succeeded: false,
      message: "Socio no encontrado",
      data: null,
      errors: ["MEMBER_NOT_FOUND"],
    });
  }

  return res.json({
    succeeded: true,
    message: "Elegibilidad mock calculada",
    errors: [],
    data: {
      socioId: member.id,
      esElegibleParaPrestamo: member.esElegibleParaPrestamo,
      tieneRestriccionMonto: member.tieneRestriccionMonto,
      montoMaximoPrestamo: member.montoMaximoPrestamo,
      calificacionCrediticia: member.calificacionCrediticia,
      razon: member.esElegibleParaPrestamo
        ? "Socio apto para solicitar prestamo"
        : "Socio no elegible por riesgo o prestamos activos",
    },
  });
});

router.get("/api/v1/TipoPrestamo", (_req, res) => {
  return res.json({
    succeeded: true,
    message: "Tipos de prestamo mock",
    errors: [],
    data: loanTypes,
  });
});

router.post("/api/v1/SolicitudPrestamo", (req, res) => {
  const applicationId = Math.floor(Date.now() / 1000);

  return res.status(201).json({
    succeeded: true,
    message: "Solicitud de prestamo mock creada",
    errors: [],
    data: {
      solicitudPrestamoId: applicationId,
      estado: "PENDIENTE",
      referencia: `MOCK-LOAN-${applicationId}`,
      ...req.body,
    },
  });
});

router.post("/api/v1/AprobacionPrestamo", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Prestamo mock aprobado",
    errors: [],
    data: {
      solicitudPrestamoId: req.body?.solicitudPrestamoId,
      estado: "APROBADO",
      requiereDesembolso: Boolean(req.body?.requiereDesembolso),
      actualizadoPor: req.body?.actualizadoPor,
      aprobadoAt: new Date().toISOString(),
    },
  });
});

router.get("/api/v1/SolicitudPrestamo/:id", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Estado mock de solicitud",
    errors: [],
    data: {
      solicitudPrestamoId: Number(req.params.id),
      estado: "PENDIENTE",
      referencia: `MOCK-LOAN-${req.params.id}`,
    },
  });
});

router.get("/api/v1/HistorialEstadoSolicitudPrestamo/historial/:id", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Historial mock de solicitud",
    errors: [],
    data: [
      {
        solicitudPrestamoId: Number(req.params.id),
        estado: "PENDIENTE",
        fecha: new Date().toISOString(),
        comentario: "Solicitud creada en simulador",
      },
    ],
  });
});

router.post("/api/v1/Loan/pagar-prestamo", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Pago mock de prestamo confirmado",
    errors: [],
    data: {
      pagoId: `MOCK-PAY-${Date.now()}`,
      estado: "PAGADO",
      numeroCuentaPrestamo: req.body?.numeroCuentaPrestamo,
      numeroCuentaOrigen: req.body?.numeroCuentaOrigen,
      confirmadoAt: new Date().toISOString(),
    },
  });
});

router.post("/api/v1/Loan/pagar-cuota-seleccionada", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Pago mock de cuota confirmado",
    errors: [],
    data: {
      pagoId: `MOCK-INSTALLMENT-${Date.now()}`,
      estado: "PAGADO",
      cuentaPrestamoId: req.body?.cuentaPrestamoId,
      cuotaId: req.body?.cuotaId,
      montoPagado: req.body?.montoPagar,
      canal: req.body?.canal,
      confirmadoAt: new Date().toISOString(),
    },
  });
});

router.get("/api/v1/Loan/pagos-globales", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Pagos globales mock",
    errors: [],
    data: [
      {
        pagoGlobalId: 9001,
        prestamoId: Number(req.query.prestamoId),
        monto: 2500,
        estado: "PAGADO",
        fecha: new Date().toISOString(),
      },
    ],
  });
});

router.get("/api/v1/Loan/Detalles-Pagos", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Detalles de pago mock",
    errors: [],
    data: {
      pagoGlobalId: Number(req.query.pagoGlobalId),
      cuotas: [
        {
          cuotaId: 7001,
          numero: 1,
          monto: 2500,
          estado: "PAGADO",
        },
      ],
    },
  });
});

router.get("/api/v1/Loan/obtener-pagos-por-cuota", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Pagos por cuota mock",
    errors: [],
    data: [
      {
        cuotaPrestamoId: Number(req.query.cuotaPrestamoId),
        pagoId: 8001,
        monto: 2500,
        estado: "PAGADO",
        fecha: new Date().toISOString(),
      },
    ],
  });
});

router.post("/api/v1/InterBank", (req, res) => {
  return res.json({
    succeeded: true,
    message: "Transaccion InterBank mock creada",
    errors: [],
    data: {
      id: randomUUID(),
      totalAmount: req.body?.amount,
      isPriority: false,
      socioId: req.body?.socioId,
    },
    transactionHistorialId: Math.floor(Date.now() / 1000),
  });
});

router.get("/api/v1/InterBank/Transactions", (_req, res) => {
  return res.json({
    succeeded: true,
    message: "Transacciones InterBank mock",
    errors: [],
    data: [
      {
        id: randomUUID(),
        name: "Transaccion mock",
        description: "Prueba de integracion marketplace",
        amount: 1000,
        total: 1000,
        isSubmit: true,
        isPriority: false,
        socioId: 1001,
        isCancelled: false,
        createdAt: new Date().toISOString(),
      },
    ],
    pageNumber: 1,
    pageSize: 10,
  });
});

export default router;
