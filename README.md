<<<<<<< HEAD
## Archivos con lógica simulada

- cooperative.service.ts: simula respuestas si no hay API real configurada.
- loan.service.ts: tiene lógica local de préstamo, pero eso debe venir de la cooperativa real.
- queue.service.ts: está preparado para BullMQ/Redis, pero ahora mismo corre inline.
- otp.provider.service.ts: está preparado para API externa; falta configurar OTP_API_URL y OTP_API_KEY reales.
- payment.service.ts: el pago local con wallet, ledger y transactions funciona, pero falta conectarlo a una pasarela bancaria real y callbacks seguros.
- financing.service.ts: el flujo interno funciona, pero la evaluación, desembolso y cuotas reales deben venir de la cooperativa.

## La aplicación resuelve este problema

Un cliente quiere comprar un producto, pero quizás no puede pagarlo completo de una vez. Entonces CoopMarket permite:

- ver productos disponibles,
- agregarlos al carrito,
- comprar de contado,
- solicitar financiamiento,
- pagar inicial,
- manejar billetera,
- generar órdenes,
- notificar a vendedor/cliente/admin,
- administrar vendedores,
- procesar retiros,
- mantener trazabilidad financiera con transacciones y ledger.

## Los actores principales son

Cliente: compra productos, solicita financiamiento, paga inicial, paga cuotas y maneja wallet.

Seller/Vendedor: publica productos, recibe ventas, recibe solicitudes de financiamiento aprobadas por la cooperativa/admin, aprueba o rechaza solicitudes y solicita retiros.

Admin/Cooperativa: aprueba vendedores, gestiona usuarios, revisa financiamientos, retiros, métricas, reportes, alertas de fraude y representa la entidad externa que debe evaluar financiamientos, desembolsar préstamos, crear cuotas y reportar estados.

## Arquitectura General

El backend está organizado por módulos:

backend/src
config
middlewares
modules
services
utils

El frontend está organizado así:

frontend/src
api
components
pages
routes
services
store
types
utils

La arquitectura sigue este patrón:

Frontend Page
↓
Frontend Service
↓
Axios API
↓
Backend Route
↓
Middleware protect/authorize
↓
Controller
↓
Service
↓
Prisma
↓
PostgreSQL

En el backend:

routes definen URLs.
controllers reciben req/res.
services contienen la lógica real.
middlewares protegen rutas.
Prisma conecta con PostgreSQL.
services globales como wallet, ledger, notification, audit y transaction se reutilizan en varios módulos.

En el frontend:

pages son pantallas.
services llaman al backend.
store guarda estado global como auth y carrito.
routes controla navegación y permisos.
api/axios.ts centraliza tokens, refresh token y errores.
components/layout define paneles customer/seller/admin.

## Backend: Las Responsabilidades Por Módulo

## Auth Module

Archivos principales:

auth.service.ts
auth.controller.ts
auth.routes.ts

Hace:

registro,
login,
OTP,
refresh token,
forgot/reset password,
creación de wallet al registrar.

Flujo de registro:

Usuario llena formulario
↓
Frontend register
↓
POST /api/auth/register
↓
Backend valida términos
↓
Verifica email único
↓
Hash password con bcrypt
↓
Crea User
↓
Crea Wallet
↓
Envía OTP por proveedor
↓
Devuelve usuario sin password

Login:

Usuario ingresa email/password
↓
Backend busca usuario
↓
Verifica bloqueado
↓
Verifica OTP
↓
Si el vendedor, exige sellerStatus APPROVED
↓
Compara bcrypt
↓
Genera accessToken y refreshToken
↓
Guarda refreshToken en DB
↓
Devuelve sesión

## Product Module

Archivos:

product.service.ts
product.controller.ts
product.routes.ts
Hace:

crear producto,
listar marketplace,
buscar,
filtrar,
actualizar,
eliminar con soft delete.
Punto importante: deleteProduct() no borra de verdad, pone isActive: false. Eso evita romper cualquier orden histórica.

Flujo:

Vendedor crea producto
↓
Frontend SellerProductsPage
↓
POST /api/products
↓
Backend valida Vendedor
↓
Si vendedor no está APPROVED, bloquea
↓
Guarda producto
↓
Marketplace solo muestra isActive true

## La búsqueda ya tiene:

página,
límite,
search,
category,
minPrice,
maxPrice,
sort,
índices en Prisma para isActive, category, sellerId, price, createdAt.

## Order Module

Archivos:

order.service.ts
order.controller.ts
order.routes.ts

Hace:

crear orden,
reservar/restar stock,
cancelar orden,
completar orden,
listar órdenes de cliente,
listar ventas del seller.

Flujo de orden:

Cliente confirma carrito
↓
Backend valida productos
↓
Valida stock
↓
Resta stock
↓
Crea Order
↓
Crea OrderItems
↓
Devuelve orden

## Payment Module

Archivos:

payment.service.ts
payment.controller.ts
payment.routes.ts

Hace:

procesar pago,
validar monto,
validar ownership,
usar idempotencyKey,
crear transacción,
crear ledger,
acreditar al seller,
actualizar orden,
notificar cliente/seller,
detectar fraude,
manejar callbacks,
reintentar pago fallido.

Flujo actual de pago contado:

Cliente paga orden
↓
processPayment()
↓
Valida orden PENDING
↓
Valida que el cliente sea dueño de la orden
↓
Valida monto correcto
↓
Inicia prisma.$transaction
↓
Debita wallet del cliente
↓
Crea Ledger DEBIT cliente
↓
Crea Transaction PAYMENT cliente
↓
Por cada item de la orden:
busca seller
acredita wallet del seller
crea Ledger CREDIT seller
crea Transaction DEPOSIT seller
notifica seller
↓
Notifica cliente
↓
Order pasa a COMPLETED
↓
detectFraud()
↓
Retorna orden actualizada

## Importante:

El checkout actual no usa freezeFunds ni completeOrder.
El pago se completa de forma atómica dentro de processPayment().
Si falla un paso, Prisma revierte toda la operación.

## Wallet Service

Archivo:
wallet.service.ts

Hace:

crear wallet,
recargar,
acreditar,
debitar,
congelar fondos,
liberar fondos,
consultar wallet.

La wallet guarda saldo operativo:

Wallet.balance
Wallet.frozenBalance
Balance es dinero disponible.
Frozen balance es dinero congelado tipo escrow.

En el pago contado actual:

Cliente paga orden
↓
balance del cliente baja
↓
ledger registra DEBIT
↓
seller recibe crédito en su wallet
↓
ledger registra CREDIT
↓
orden pasa a COMPLETED
frozenBalance existe para futuros flujos tipo escrow, pero actualmente el checkout normal no lo usa.

## Ledger Service

Archivo:

ledger.service.ts

El ledger guarda movimientos contables:

CREDIT
DEBIT
amount
reference
description
userId
Debe ser la verdad contable.

Transaction Service

Guarda eventos financieros operativos:

PAYMENT
REFUND
WITHDRAW
DEPOSIT
Sirve para registrar movimientos de negocio como pagos, retiros, depósitos y reembolsos.

## Financing Module

Archivos:

financing.service.ts
financing.controller.ts
financing.routes.ts

Estados actuales:

PENDING
APPROVED_BY_COOPERATIVE
WAITING_SELLER_APPROVAL
WAITING_DOWN_PAYMENT
ACTIVE
COMPLETED
LATE
APPROVED
REJECTED
Aunque existe el estado APPROVED_BY_COOPERATIVE, el flujo actual usa WAITING_SELLER_APPROVAL como estado interno después de la aprobación admin/cooperativa, y guarda "APPROVED_BY_COOPERATIVE" en externalStatus.

El flujo que tiene es:

Cliente solicita financiamiento
↓
PENDING
↓
Admin/cooperativa aprueba
↓
WAITING_SELLER_APPROVAL
↓
Seller aprueba
↓
WAITING_DOWN_PAYMENT
↓
Cliente paga inicial
↓
ACTIVE
El admin/cooperativa no activa directamente el préstamo. El seller todavía debe confirmar. Eso protege al vendedor.

createFinancing():

valida cliente,
valida producto,
valida que producto permita financiamiento,
calcula downPayment, remainingDebt, monthlyPayment,
crea Financing en PENDING,
audita.

adminApproveFinancing():

solo aprueba si está PENDING,
cambia a WAITING_SELLER_APPROVAL,
guarda externalStatus,
notifica al vendedor y cliente,
audita.

approveFinancing() seller:

valida ownership del seller,
exige estado WAITING_SELLER_APPROVAL,
cambia a WAITING_DOWN_PAYMENT,
notifica cliente y seller,
audita.

payDownPayment():

Validar financing existe
↓
Validar actor cliente o admin
↓
Validar status WAITING_DOWN_PAYMENT
↓
Validar idempotencyKey
↓
Buscar wallet cliente
↓
Validar balance
↓
Debitar wallet cliente
↓
Transaction PAYMENT
↓
Ledger DEBIT cliente
↓
Buscar/crear wallet seller
↓
Acreditar wallet seller
↓
Transaction DEPOSIT seller
↓
Ledger CREDIT seller
↓
Notificar cliente
↓
Notificar seller
↓
disburseLoan()
↓
Financing ACTIVE
↓
AuditLog
↓
Retorna financing actualizado
Cuando el cliente paga inicial, el vendedor recibe ese dinero en su wallet.

## Payout Module

Archivos:

payout.service.ts
payout.controller.ts
payout.routes.ts

Hace:

vendedor solicita retiro,
admin aprueba,
admin rechaza,
lista retiros.

Flujo:

Seller solicita retiro
↓
Valida wallet
↓
Valida balance
↓
Crea Payout PENDING
↓
Notifica seller
↓
Audita

## Admin aprueba:

Admin aprueba payout
↓
Valida PENDING
↓
Valida balance seller
↓
Debita wallet seller
↓
Ledger DEBIT
↓
Transaction WITHDRAW
↓
Notifica seller
↓
Payout APPROVED
↓
AuditLog

## Admin rechaza:

Admin rechaza
↓
Payout REJECTED
↓
Notificación seller
↓
AuditLog

## Cooperative Service

Archivo:

modules/cooperative/cooperative.service.ts
Está preparado para integración real:

COOPERATIVE_BASE_URL
COOPERATIVE_API_KEY
timeout
retries
Authorization header
error handling

Funciones:

sendLoanApplication()
disburseLoan()
verifyBankAccount()
getTransactionStatus()
Este módulo simula respuestas porque no hay API real configurada.

## Queue Module

Archivo:

queue.service.ts
Actualmente es inline, no BullMQ real, está simulado.

Hace:

procesar payouts pendientes,
enviar loans pendientes a cooperativa,
revisar transacciones fallidas.
Tiene QUEUE_DRIVER y REDIS_URL, pero todavía no hay workers reales persistentes con BullMQ.

## Notification Module

Guarda notificaciones internas:

userId
title
message
read
createdAt
Sirve para avisar a clientes, sellers y admin sobre pagos, financiamientos, retiros, ventas y actividad importante.

## Admin Module

Hace:

métricas,
usuarios,
vendedores,
fraude,
reportes financieros,
bloquear/desbloquear/eliminar usuarios,
aprobar/rechazar sellers.
getUsers() ahora devuelve datos útiles de seller/customer sin password. Eso ayuda al admin.

## Base de Datos

Mi DB usa Prisma con PostgreSQL. Principales modelos:

## User

Guarda:

identidad,
email,
password,
teléfono,
OTP/verification,
refreshToken,
datos seller,
estado seller,
role,
bloqueo,
reset password.

Relaciones:

products
financings
notifications
ledgerEntries
transactions
wallet
orders
payouts
loans

## Product

Guarda productos:

título,
descripción,
precio,
stock,
imagen,
isFinanced,
isActive,
sellerId,
category.
Tiene soft delete mediante isActive.

Relaciones:

seller User
financings
orderItems
Order

Guarda compra:

customerId
totalAmount
status

Relaciones:

customer
items

## OrderItem

Detalle de productos de una orden:

orderId
productId
quantity
price
Esto preserva precio histórico.

## Wallet

Guarda saldo:

userId
balance
frozenBalance
Es el saldo operativo del usuario.

## Transaction

Guarda movimiento financiero de negocio:

userId
amount
type
status
reference
description
idempotencyKey
providerReference
Sirve para pagos, depósitos, retiros y refunds.

## LedgerEntry

Guarda contabilidad:

userId
CREDIT/DEBIT
amount
reference
description
Debe ser la verdad contable.

## Financing

Guarda solicitud/financiamiento:

customerId
datos financieros: cédula, income, company, phone, address
productId
totalAmount
downPayment
remainingDebt
months
monthlyPayment
status
externalLoanId
externalStatus
externalReference
cooperativeResponse
approvedAt/rejectedAt/rejectionReason

## Installment

Guarda cuotas:

financingId
number
amount
dueDate
paid
paidAt
status
Las cuotas deben venir de la cooperativa. Lo local todavía es simulado.

## Payout

Guarda retiros del seller:

sellerId
amount
status
idempotencyKey
Notification
Guarda notificaciones internas.

## AuditLog

Guarda acciones críticas:

userId
action
entity
entityId
description
metadata
ip
FraudAlert

Guarda alertas:

userId
reason
riskLevel
resolved
Sirve para detectar actividad sospechosa.

## Loan

Modelo separado de Financing, más genérico para préstamos:

amount
months
annualInterestRate
score
status
external ids
cooperativeResponse

## Seguridad

Tengo:

JWT access token,
refresh token,
middleware protect,
middleware authorize,
middleware allowSelfOrAdmin,
rate limit,
idempotencia básica,
audit logs,
fraude básico,
helmet,
cors.

## protect

Lee Authorization Bearer
↓
Verifica JWT
↓
Busca usuario
↓
Verifica bloqueado
↓
Coloca req.user

## authorize: permite solo roles específicos.

## allowSelfOrAdmin: permite acceso si es el dueño del recurso o admin.

## Rate limits

auth: 10 intentos / 15 min
OTP: 5 / 10 min
payment: 10 / 5 min
financing: 5 / 30 min
payout: 3 / 30 min
Esto ayuda contra brute force, spam, abuso de pagos y retiros.

## Falta mejorar

secretos de callbacks con firma HMAC,
timestamp contra replay attacks,
refresh token rotation real,
guardar refresh token hasheado, no plano,
CSRF si algún día se usan cookies,
validación fuerte con Zod/Joi en backend,
IP/device fingerprint,
auditoría con IP real,
permisos por ownership en todos los endpoints sensibles,
money en Decimal, no Float,
más transacciones DB para operaciones financieras.

## Frontend

El frontend tiene:

api/axios.ts
routes/AppRoutes.tsx
routes/ProtectedRoute.tsx
store/auth.store.ts
store/cart.store.ts
services/
pages/
components/layout/

## axios.ts centraliza:

baseURL,
timeout,
Authorization Bearer,
refresh token automático,
toast para 403/500/network error.

## auth.store.ts guarda:

user,
accessToken,
refreshToken,
login,
setSession,
logout.
Usa localStorage.

cart.store.ts guarda carrito en localStorage, valida cantidades, mínimo 1, no negativas y respeta stock.

## Rutas principales:

/login
/register
/verify-otp
/marketplace
/products/:id
/cart
/checkout
/customer/
/seller/
/admin/

## Layouts:

CustomerLayout
SellerLayout
AdminLayout
Esto permite paneles separados por rol.

## Páginas importantes:

## Admin:

dashboard
users
sellers
payouts
financings
reports

## Seller:

dashboard
products
sales
wallet
payouts
financing requests
notifications

## Customer:

dashboard
marketplace
orders
financing
wallet
notifications
El frontend usa react-hot-toast para las notificaciones, las alertas y los errores.

Flujo Completo De Financiamiento Real
Cliente ve producto financiable
↓
Cliente solicita financiamiento
↓
Financing PENDING
↓
Admin/cooperativa revisa
↓
Admin aprueba
↓
Financing WAITING_SELLER_APPROVAL
↓
Seller recibe notificación
↓
Seller aprueba
↓
Financing WAITING_DOWN_PAYMENT
↓
Cliente paga inicial
↓
Wallet cliente debit
↓
Transaction PAYMENT cliente
↓
Ledger DEBIT cliente
↓
Wallet seller credit
↓
Transaction DEPOSIT seller
↓
Ledger CREDIT seller
↓
Notificación cliente
↓
Notificación seller
↓
disburseLoan()
↓
Financing ACTIVE
↓
Cooperativa crea cuotas
↓
Sistema sincroniza cuotas
↓
Cliente ve cuotas

## Quién recibe dinero:

La inicial la recibe el vendedor en su wallet.
El resto del financiamiento lo maneja la cooperativa.
Las cuotas deberían pagarse a la cooperativa o sincronizarse desde ella.

## Qué Todavía Es Mock O MVP

Cooperativa está simulada.
Queues son inline, no BullMQ real.
Callbacks tienen validación básica por secret token, pero falta HMAC real, timestamp e idempotencia más fuerte contra replay attacks.
Dinero usa Float; tengo que ponerlo en Decimal.
Varias operaciones financieras todavía necesitan más $transaction.
Refresh token se guarda plano.
OTP depende del provider service; falta configurar OTP_API_URL y OTP_API_KEY reales.
Payout approve no llama banco ni cooperativa real.
Installments todavía existen localmente, pero eso debe venir de parte de la cooperativa.
AuditLog existe, pero no todos los eventos tienen IP/device.
Delete user borra datos financieros; hay que arreglarlo para que preserve el historial.
No hay tests automatizados financieros.
No hay migrations/versionado robusto mencionado, solo Prisma schema.
No hay Docker/CI/CD/observabilidad.

# CoopMarketplace
>>>>>>> 87d4d07b4d47d42b5fa8822b215bcbc0da140add
