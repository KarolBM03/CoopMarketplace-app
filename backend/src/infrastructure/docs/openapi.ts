export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Marketplace API",
    version: "1.0.0",
    description:
      "Documentacion publica de endpoints para el backend Marketplace con financiamiento.",
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Servidor local",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Products" },
    { name: "Orders" },
    { name: "Financing" },
    { name: "Shipments" },
    { name: "Chat" },
    { name: "Notifications" },
    { name: "Push" },
    { name: "Admin" },
    { name: "Wallet" },
    { name: "Transactions" },
    { name: "Reports" },
    { name: "Upload" },
    { name: "Loans" },
    { name: "Queues" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "No autorizado" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "cliente@prueba.com" },
          password: { type: "string", example: "Password123" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", example: "Juan Perez" },
          email: { type: "string", example: "juan@prueba.com" },
          password: { type: "string", example: "Password123" },
          phone: { type: "string", example: "8095551234" },
          role: { type: "string", enum: ["CUSTOMER", "SELLER"] },
          acceptedTerms: { type: "boolean", example: true },
          storeName: { type: "string", example: "Tienda Juan" },
          mainCategory: { type: "string", example: "Celulares" },
          city: { type: "string", example: "Santo Domingo" },
          documentId: { type: "string", example: "001-1234567-8" },
          bankAccount: { type: "string", example: "123456789" },
          identityImageUrl: { type: "string" },
        },
      },
      ProductRequest: {
        type: "object",
        required: ["title", "description", "price", "stock", "category"],
        properties: {
          title: { type: "string", example: "iPhone 13" },
          description: { type: "string", example: "128GB en buen estado" },
          price: { type: "number", example: 35000 },
          stock: { type: "integer", example: 2 },
          imageUrl: { type: "string" },
          category: { type: "string", example: "Celulares" },
          isFinanced: { type: "boolean", example: true },
        },
      },
      OrderRequest: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["productId", "quantity"],
              properties: {
                productId: { type: "string", format: "uuid" },
                quantity: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      FinancingRequest: {
        type: "object",
        required: ["productId", "months"],
        properties: {
          productId: { type: "string", format: "uuid" },
          months: { type: "integer", example: 12 },
          cedula: { type: "string", example: "001-1234567-8" },
          income: { type: "number", example: 45000 },
          company: { type: "string", example: "Empresa SRL" },
          phone: { type: "string", example: "8095551234" },
          address: { type: "string", example: "Calle Principal #1" },
        },
      },
      MessageRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", example: "Hola, sigue disponible?" },
        },
      },
      LocationRequest: {
        type: "object",
        required: ["lat", "lng"],
        properties: {
          lat: { type: "number", example: 18.4861 },
          lng: { type: "number", example: -69.9312 },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: { "201": { description: "Usuario registrado" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: { "200": { description: "Sesion iniciada" }, "401": { description: "Credenciales invalidas" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtener usuario autenticado",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Usuario autenticado" } },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Token renovado" } },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verificar codigo OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otpCode"],
                properties: {
                  email: { type: "string" },
                  otpCode: { type: "string" },
                  channel: { type: "string", enum: ["email", "sms", "whatsapp"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Cuenta verificada" } },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Solicitar recuperacion de contrasena",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "Correo enviado" } },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Listar productos",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "price_asc", "price_desc", "best_selling", "most_viewed", "financed", "relevance"] } },
        ],
        responses: { "200": { description: "Lista paginada de productos" } },
      },
      post: {
        tags: ["Products"],
        summary: "Crear producto",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } },
          },
        },
        responses: { "201": { description: "Producto creado" } },
      },
    },
    "/products/{productId}": {
      get: {
        tags: ["Products"],
        summary: "Obtener detalle de producto",
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Producto" } },
      },
      patch: {
        tags: ["Products"],
        summary: "Actualizar producto",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ProductRequest" } } } },
        responses: { "200": { description: "Producto actualizado" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Eliminar producto",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Producto eliminado" } },
      },
    },
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Crear orden",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/OrderRequest" } } } },
        responses: { "201": { description: "Orden creada" } },
      },
    },
    "/orders/customer/me": {
      get: { tags: ["Orders"], summary: "Ordenes del cliente autenticado", security: [{ bearerAuth: [] }], responses: { "200": { description: "Ordenes" } } },
    },
    "/orders/seller/me/sales": {
      get: { tags: ["Orders"], summary: "Ventas del vendedor autenticado", security: [{ bearerAuth: [] }], responses: { "200": { description: "Ventas" } } },
    },
    "/orders/{orderId}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Actualizar estado de orden",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "orderId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } } },
        responses: { "200": { description: "Orden actualizada" } },
      },
    },
    "/financing": {
      post: {
        tags: ["Financing"],
        summary: "Crear solicitud de financiamiento",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FinancingRequest" } } } },
        responses: { "201": { description: "Financiamiento creado" } },
      },
    },
    "/financing/customer/{customerId}": {
      get: {
        tags: ["Financing"],
        summary: "Financiamientos por cliente",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "customerId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Financiamientos" } },
      },
    },
    "/financing/admin": {
      get: { tags: ["Financing"], summary: "Financiamientos para admin", security: [{ bearerAuth: [] }], responses: { "200": { description: "Financiamientos" } } },
    },
    "/shipments/customer/{customerId}": {
      get: {
        tags: ["Shipments"],
        summary: "Envios de cliente",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "customerId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Envios" } },
      },
    },
    "/shipments/seller/me": {
      get: { tags: ["Shipments"], summary: "Envios del vendedor autenticado", security: [{ bearerAuth: [] }], responses: { "200": { description: "Envios" } } },
    },
    "/shipments/{shipmentId}/tracking/start": {
      patch: {
        tags: ["Shipments"],
        summary: "Iniciar GPS de envio",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "shipmentId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Tracking iniciado" } },
      },
    },
    "/shipments/{shipmentId}/tracking/location": {
      patch: {
        tags: ["Shipments"],
        summary: "Actualizar ubicacion GPS",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "shipmentId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LocationRequest" } } } },
        responses: { "200": { description: "Ubicacion actualizada" } },
      },
    },
    "/shipments/{shipmentId}/tracking/stop": {
      patch: {
        tags: ["Shipments"],
        summary: "Detener GPS de envio",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "shipmentId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Tracking detenido" } },
      },
    },
    "/chat/conversations": {
      get: { tags: ["Chat"], summary: "Mis conversaciones", security: [{ bearerAuth: [] }], responses: { "200": { description: "Conversaciones" } } },
      post: {
        tags: ["Chat"],
        summary: "Crear conversacion",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["sellerId"], properties: { sellerId: { type: "string" }, productId: { type: "string" } } } } } },
        responses: { "201": { description: "Conversacion creada" } },
      },
    },
    "/chat/conversations/{conversationId}/messages": {
      get: {
        tags: ["Chat"],
        summary: "Mensajes de conversacion",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Mensajes" } },
      },
      post: {
        tags: ["Chat"],
        summary: "Enviar mensaje",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MessageRequest" } } } },
        responses: { "201": { description: "Mensaje enviado" } },
      },
    },
    "/notifications/user/{userId}": {
      get: {
        tags: ["Notifications"],
        summary: "Notificaciones de usuario",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Notificaciones" } },
      },
    },
    "/push/token": {
      post: {
        tags: ["Push"],
        summary: "Registrar token push",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["token"], properties: { token: { type: "string" }, platform: { type: "string", example: "WEB" } } } } } },
        responses: { "201": { description: "Token registrado" } },
      },
    },
    "/upload/image": {
      post: {
        tags: ["Upload"],
        summary: "Subir imagen",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { type: "object", properties: { image: { type: "string", format: "binary" } } },
            },
          },
        },
        responses: { "200": { description: "Imagen subida" } },
      },
    },
    "/admin/metrics": {
      get: { tags: ["Admin"], summary: "Metricas admin", security: [{ bearerAuth: [] }], responses: { "200": { description: "Metricas" } } },
    },
    "/admin/users": {
      get: { tags: ["Admin"], summary: "Usuarios", security: [{ bearerAuth: [] }], responses: { "200": { description: "Usuarios" } } },
    },
    "/admin/sellers": {
      get: { tags: ["Admin"], summary: "Vendedores", security: [{ bearerAuth: [] }], responses: { "200": { description: "Vendedores" } } },
    },
    "/wallets/me": {
      get: { tags: ["Wallet"], summary: "Mi billetera", security: [{ bearerAuth: [] }], responses: { "200": { description: "Billetera" } } },
    },
    "/wallets/recharge": {
      post: {
        tags: ["Wallet"],
        summary: "Recargar billetera",
        security: [{ bearerAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["amount"], properties: { amount: { type: "number", example: 1000 } } } } } },
        responses: { "200": { description: "Recarga creada" } },
      },
    },
    "/transactions/user/{userId}": {
      get: {
        tags: ["Transactions"],
        summary: "Transacciones por usuario",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Transacciones" } },
      },
    },
    "/reports/financial": {
      get: { tags: ["Reports"], summary: "Reporte financiero", security: [{ bearerAuth: [] }], responses: { "200": { description: "Reporte" } } },
    },
    "/loans/calculate": {
      post: { tags: ["Loans"], summary: "Calcular prestamo", security: [{ bearerAuth: [] }], responses: { "200": { description: "Calculo" } } },
    },
    "/queues/loans/process": {
      post: { tags: ["Queues"], summary: "Procesar cola de prestamos", security: [{ bearerAuth: [] }], responses: { "200": { description: "Cola procesada" } } },
    },
  },
};
