import {
  BadgeCheck,
  Banknote,
  CreditCard,
  FileSearch,
  Landmark,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  approveCooperativeLoan,
  createCooperativeInterbankTransaction,
  createCooperativeLoanApplication,
  findCooperativeMemberByCedula,
  getCooperativeEligibility,
  getCooperativeGlobalPayments,
  getCooperativeHealth,
  getCooperativeInterbankTransactions,
  getCooperativeLoanApplication,
  getCooperativeLoanApplicationHistory,
  getCooperativeLoanTypes,
  getCooperativeMemberDetail,
  getCooperativePaymentDetails,
  getCooperativePaymentsByInstallment,
  payCooperativeInstallment,
  payCooperativeLoan,
  testCooperativeLogin,
} from "../../services/cooperative.service";

type ActionName =
  | "health"
  | "login"
  | "member"
  | "detail"
  | "eligibility"
  | "loanTypes"
  | "createLoan"
  | "approveLoan"
  | "loanStatus"
  | "loanHistory"
  | "payLoan"
  | "payInstallment"
  | "globalPayments"
  | "paymentDetails"
  | "paymentsByInstallment"
  | "createInterbank"
  | "interbankList";

const emptyResult = {
  title: "Sin respuesta todavia",
  data: {
    message: "Ejecuta una prueba para ver aqui la respuesta JSON.",
  },
};

type ResultState = {
  title: string;
  data: unknown;
};

export default function AdminCooperativePage() {
  const [loading, setLoading] = useState<ActionName | null>(null);
  const [result, setResult] = useState<ResultState>(emptyResult);

  const [cedula, setCedula] = useState("");
  const [socioId, setSocioId] = useState("");
  const [solicitudPrestamoId, setSolicitudPrestamoId] = useState("");
  const [prestamoId, setPrestamoId] = useState("");
  const [pagoGlobalId, setPagoGlobalId] = useState("");
  const [cuotaPrestamoId, setCuotaPrestamoId] = useState("");

  const [loanForm, setLoanForm] = useState({
    socioId: "",
    montoSolicitado: "",
    frecuenciaPago: "1",
    cantidadCuotas: "12",
    objetivoPrestamo: "Compra marketplace",
    tipoPrestamoId: "",
  });

  const [approveForm, setApproveForm] = useState({
    solicitudPrestamoId: "",
    requiereDesembolso: true,
    actualizadoPor: "Marketplace Admin",
  });

  const [loanPaymentForm, setLoanPaymentForm] = useState({
    numeroCuentaPrestamo: "",
    numeroCuentaOrigen: "",
  });

  const [installmentPaymentForm, setInstallmentPaymentForm] = useState({
    cuentaOrigen: "",
    cuentaPrestamoId: "",
    cuotaId: "",
    montoPagar: "",
    canal: "MARKETPLACE",
  });

  const [interbankForm, setInterbankForm] = useState({
    name: "",
    description: "Transaccion marketplace",
    amount: "",
    noAccountCoop: "",
    identification: "",
    nameAccountBank: "",
    noAccountBank: "",
    noAccountCoopAdmin: "",
    accountBankId: "",
    transferetionTypeId: "",
    socioId: "",
    accountType: "",
  });

  const runAction = async (
    action: ActionName,
    title: string,
    request: () => Promise<unknown>,
  ) => {
    try {
      setLoading(action);
      const data = await request();
      setResult({ title, data });
      toast.success("Respuesta recibida");
    } catch (error: any) {
      const data = error.response?.data || { message: error.message };
      setResult({ title: `${title} - Error`, data });
      toast.error(data.message || "La prueba fallo");
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    runAction("health", "Estado de integracion", getCooperativeHealth);
  }, []);

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase text-emerald-600">
          CoopHispanica
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
              Pruebas de integracion
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
              Panel interno para validar endpoints de cooperativa con
              credenciales configuradas en el backend.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              icon={ShieldCheck}
              loading={loading === "health"}
              onClick={() =>
                runAction("health", "Estado de integracion", getCooperativeHealth)
              }
            >
              Estado
            </ActionButton>
            <ActionButton
              icon={BadgeCheck}
              loading={loading === "login"}
              onClick={() => runAction("login", "Login cooperativa", testCooperativeLogin)}
            >
              Probar login
            </ActionButton>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="space-y-6">
          <Panel title="Socios" icon={Search}>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                label="Cedula"
                value={cedula}
                onChange={setCedula}
                placeholder="00100000000"
              />
              <ActionButton
                icon={Search}
                loading={loading === "member"}
                onClick={() =>
                  runAction("member", "Buscar socio por cedula", () =>
                    findCooperativeMemberByCedula(cedula),
                  )
                }
              >
                Buscar
              </ActionButton>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <Input
                label="Socio ID"
                value={socioId}
                onChange={setSocioId}
                placeholder="123"
              />
              <ActionButton
                icon={FileSearch}
                loading={loading === "detail"}
                onClick={() =>
                  runAction("detail", "Detalle del socio", () =>
                    getCooperativeMemberDetail(socioId),
                  )
                }
              >
                Detalle
              </ActionButton>
              <ActionButton
                icon={ShieldCheck}
                loading={loading === "eligibility"}
                onClick={() =>
                  runAction("eligibility", "Elegibilidad de prestamo", () =>
                    getCooperativeEligibility(socioId),
                  )
                }
              >
                Elegibilidad
              </ActionButton>
            </div>
          </Panel>

          <Panel title="Prestamos" icon={CreditCard}>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                icon={FileSearch}
                loading={loading === "loanTypes"}
                onClick={() =>
                  runAction("loanTypes", "Tipos de prestamo", getCooperativeLoanTypes)
                }
              >
                Tipos de prestamo
              </ActionButton>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Input label="Socio ID" value={loanForm.socioId} onChange={(v) => setLoanForm({ ...loanForm, socioId: v })} />
              <Input label="Monto solicitado" value={loanForm.montoSolicitado} onChange={(v) => setLoanForm({ ...loanForm, montoSolicitado: v })} />
              <Input label="Frecuencia pago" value={loanForm.frecuenciaPago} onChange={(v) => setLoanForm({ ...loanForm, frecuenciaPago: v })} />
              <Input label="Cantidad cuotas" value={loanForm.cantidadCuotas} onChange={(v) => setLoanForm({ ...loanForm, cantidadCuotas: v })} />
              <Input label="Tipo prestamo ID" value={loanForm.tipoPrestamoId} onChange={(v) => setLoanForm({ ...loanForm, tipoPrestamoId: v })} />
              <Input label="Objetivo" value={loanForm.objetivoPrestamo} onChange={(v) => setLoanForm({ ...loanForm, objetivoPrestamo: v })} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                icon={CreditCard}
                loading={loading === "createLoan"}
                onClick={() =>
                  runAction("createLoan", "Crear solicitud de prestamo", () =>
                    createCooperativeLoanApplication({
                      socioId: Number(loanForm.socioId),
                      montoSolicitado: Number(loanForm.montoSolicitado),
                      frecuenciaPago: Number(loanForm.frecuenciaPago),
                      cantidadCuotas: Number(loanForm.cantidadCuotas),
                      objetivoPrestamo: loanForm.objetivoPrestamo,
                      tipoPrestamoId: Number(loanForm.tipoPrestamoId),
                    }),
                  )
                }
              >
                Crear solicitud
              </ActionButton>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Input label="Solicitud ID" value={solicitudPrestamoId} onChange={setSolicitudPrestamoId} />
              <ActionButton
                icon={FileSearch}
                loading={loading === "loanStatus"}
                onClick={() =>
                  runAction("loanStatus", "Consultar solicitud", () =>
                    getCooperativeLoanApplication(solicitudPrestamoId),
                  )
                }
              >
                Consultar
              </ActionButton>
              <ActionButton
                icon={FileSearch}
                loading={loading === "loanHistory"}
                onClick={() =>
                  runAction("loanHistory", "Historial de solicitud", () =>
                    getCooperativeLoanApplicationHistory(solicitudPrestamoId),
                  )
                }
              >
                Historial
              </ActionButton>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Input label="Solicitud ID" value={approveForm.solicitudPrestamoId} onChange={(v) => setApproveForm({ ...approveForm, solicitudPrestamoId: v })} />
              <Input label="Actualizado por" value={approveForm.actualizadoPor} onChange={(v) => setApproveForm({ ...approveForm, actualizadoPor: v })} />
              <ActionButton
                icon={BadgeCheck}
                loading={loading === "approveLoan"}
                onClick={() =>
                  runAction("approveLoan", "Aprobar prestamo", () =>
                    approveCooperativeLoan({
                      solicitudPrestamoId: Number(approveForm.solicitudPrestamoId),
                      requiereDesembolso: approveForm.requiereDesembolso,
                      actualizadoPor: approveForm.actualizadoPor,
                    }),
                  )
                }
              >
                Aprobar
              </ActionButton>
            </div>
          </Panel>

          <Panel title="Pagos" icon={Banknote}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Cuenta prestamo" value={loanPaymentForm.numeroCuentaPrestamo} onChange={(v) => setLoanPaymentForm({ ...loanPaymentForm, numeroCuentaPrestamo: v })} />
              <Input label="Cuenta origen" value={loanPaymentForm.numeroCuentaOrigen} onChange={(v) => setLoanPaymentForm({ ...loanPaymentForm, numeroCuentaOrigen: v })} />
            </div>
            <div className="mt-4">
              <ActionButton
                icon={Banknote}
                loading={loading === "payLoan"}
                onClick={() =>
                  runAction("payLoan", "Pagar prestamo", () =>
                    payCooperativeLoan(loanPaymentForm),
                  )
                }
              >
                Pagar prestamo
              </ActionButton>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Input label="Cuenta origen" value={installmentPaymentForm.cuentaOrigen} onChange={(v) => setInstallmentPaymentForm({ ...installmentPaymentForm, cuentaOrigen: v })} />
              <Input label="Cuenta prestamo ID" value={installmentPaymentForm.cuentaPrestamoId} onChange={(v) => setInstallmentPaymentForm({ ...installmentPaymentForm, cuentaPrestamoId: v })} />
              <Input label="Cuota ID" value={installmentPaymentForm.cuotaId} onChange={(v) => setInstallmentPaymentForm({ ...installmentPaymentForm, cuotaId: v })} />
              <Input label="Monto a pagar" value={installmentPaymentForm.montoPagar} onChange={(v) => setInstallmentPaymentForm({ ...installmentPaymentForm, montoPagar: v })} />
              <Input label="Canal" value={installmentPaymentForm.canal} onChange={(v) => setInstallmentPaymentForm({ ...installmentPaymentForm, canal: v })} />
              <ActionButton
                icon={Banknote}
                loading={loading === "payInstallment"}
                onClick={() =>
                  runAction("payInstallment", "Pagar cuota", () =>
                    payCooperativeInstallment({
                      cuentaOrigen: installmentPaymentForm.cuentaOrigen,
                      cuentaPrestamoId: Number(installmentPaymentForm.cuentaPrestamoId),
                      cuotaId: Number(installmentPaymentForm.cuotaId),
                      montoPagar: installmentPaymentForm.montoPagar
                        ? Number(installmentPaymentForm.montoPagar)
                        : undefined,
                      canal: installmentPaymentForm.canal,
                    }),
                  )
                }
              >
                Pagar cuota
              </ActionButton>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Input label="Prestamo ID" value={prestamoId} onChange={setPrestamoId} />
              <ActionButton icon={FileSearch} loading={loading === "globalPayments"} onClick={() => runAction("globalPayments", "Pagos globales", () => getCooperativeGlobalPayments(prestamoId))}>
                Pagos globales
              </ActionButton>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Input label="Pago global ID" value={pagoGlobalId} onChange={setPagoGlobalId} />
              <ActionButton icon={FileSearch} loading={loading === "paymentDetails"} onClick={() => runAction("paymentDetails", "Detalles de pago", () => getCooperativePaymentDetails(pagoGlobalId))}>
                Detalles
              </ActionButton>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Input label="Cuota prestamo ID" value={cuotaPrestamoId} onChange={setCuotaPrestamoId} />
              <ActionButton icon={FileSearch} loading={loading === "paymentsByInstallment"} onClick={() => runAction("paymentsByInstallment", "Pagos por cuota", () => getCooperativePaymentsByInstallment(cuotaPrestamoId))}>
                Por cuota
              </ActionButton>
            </div>
          </Panel>

          <Panel title="Interbank" icon={Landmark}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Nombre" value={interbankForm.name} onChange={(v) => setInterbankForm({ ...interbankForm, name: v })} />
              <Input label="Descripcion" value={interbankForm.description} onChange={(v) => setInterbankForm({ ...interbankForm, description: v })} />
              <Input label="Monto" value={interbankForm.amount} onChange={(v) => setInterbankForm({ ...interbankForm, amount: v })} />
              <Input label="Cuenta Coop" value={interbankForm.noAccountCoop} onChange={(v) => setInterbankForm({ ...interbankForm, noAccountCoop: v })} />
              <Input label="Cedula" value={interbankForm.identification} onChange={(v) => setInterbankForm({ ...interbankForm, identification: v })} />
              <Input label="Nombre cuenta banco" value={interbankForm.nameAccountBank} onChange={(v) => setInterbankForm({ ...interbankForm, nameAccountBank: v })} />
              <Input label="Cuenta banco" value={interbankForm.noAccountBank} onChange={(v) => setInterbankForm({ ...interbankForm, noAccountBank: v })} />
              <Input label="Cuenta Coop admin" value={interbankForm.noAccountCoopAdmin} onChange={(v) => setInterbankForm({ ...interbankForm, noAccountCoopAdmin: v })} />
              <Input label="AccountBank ID" value={interbankForm.accountBankId} onChange={(v) => setInterbankForm({ ...interbankForm, accountBankId: v })} />
              <Input label="TransferType ID" value={interbankForm.transferetionTypeId} onChange={(v) => setInterbankForm({ ...interbankForm, transferetionTypeId: v })} />
              <Input label="Socio ID" value={interbankForm.socioId} onChange={(v) => setInterbankForm({ ...interbankForm, socioId: v })} />
              <Input label="Tipo cuenta" value={interbankForm.accountType} onChange={(v) => setInterbankForm({ ...interbankForm, accountType: v })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton
                icon={Landmark}
                loading={loading === "createInterbank"}
                onClick={() =>
                  runAction("createInterbank", "Crear transaccion Interbank", () =>
                    createCooperativeInterbankTransaction({
                      ...interbankForm,
                      amount: Number(interbankForm.amount),
                      socioId: Number(interbankForm.socioId),
                    }),
                  )
                }
              >
                Crear transaccion
              </ActionButton>
              <ActionButton
                icon={FileSearch}
                loading={loading === "interbankList"}
                onClick={() =>
                  runAction("interbankList", "Listar transacciones Interbank", () =>
                    getCooperativeInterbankTransactions({ PageNumber: "1", PageSize: "10" }),
                  )
                }
              >
                Listar
              </ActionButton>
            </div>
          </Panel>
        </div>

        <aside className="sticky top-6 h-fit rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-emerald-300">
                Respuesta JSON
              </p>
              <h2 className="mt-1 text-lg font-black">{result.title}</h2>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />}
          </div>
          <pre className="mt-5 max-h-[72vh] overflow-auto rounded-xl bg-black/40 p-4 text-xs leading-relaxed text-emerald-50">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </aside>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
      />
    </label>
  );
}

function ActionButton({
  children,
  icon: Icon,
  loading,
  onClick,
}: {
  children: React.ReactNode;
  icon: any;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
