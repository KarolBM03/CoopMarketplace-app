import {
  Ban,
  CheckCircle2,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  blockUser,
  getAdminUsers,
  unblockUser,
} from "../../services/admin.services";
import { statusLabel } from "../../utils/statusLabels";

type AdminUser = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  isVerified?: boolean;
  isBlocked?: boolean;
  acceptedTerms?: boolean;
  createdAt?: string;
  storeName?: string | null;
  mainCategory?: string | null;
  city?: string | null;
  documentId?: string | null;
  bankAccount?: string | null;
  identityImageUrl?: string | null;
  sellerStatus?: string | null;
  wallet?: {
    balance?: number;
    frozenBalance?: number;
  } | null;
  products?: unknown[];
  orders?: unknown[];
  financings?: unknown[];
};

const roleLabels: Record<AdminUser["role"], string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  CUSTOMER: "Cliente",
};

const money = (value?: number) =>
  `RD$${Number(value || 0).toLocaleString("en-US")}`;

const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "US";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | AdminUser["role"]>(
    "ALL",
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const searchable = [
        user.fullName,
        user.email,
        user.phone,
        user.storeName,
        user.mainCategory,
        user.city,
        user.documentId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesRole && (!term || searchable.includes(term));
    });
  }, [roleFilter, search, users]);

  const loadUsers = async () => {
    const data = await getAdminUsers();
    setUsers(data);
  };

  const handleBlock = async (userId: string) => {
    try {
      await blockUser(userId);
      toast.success("Usuario bloqueado");
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error bloqueando usuario");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      toast.success("Usuario desbloqueado");
      loadUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error desbloqueando usuario",
      );
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
            Usuarios
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            Gestion de usuarios
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Administra clientes, vendedores y sus datos principales.
          </p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Users className="h-6 w-6" />
        </div>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Directorio de usuarios
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {filteredUsers.length} de {users.length} usuarios registrados.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 sm:w-80">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                placeholder="Buscar usuario, tienda o cedula..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as "ALL" | AdminUser["role"])
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos</option>
              <option value="CUSTOMER">Clientes</option>
              <option value="SELLER">Vendedores</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Rol</th>
                <th className="px-5 py-4">Datos</th>
                <th className="px-5 py-4">Billetera</th>
                <th className="px-5 py-4">Actividad</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSeller = user.role === "SELLER";

                  return (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                            {getInitials(user.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-xs truncate font-black text-slate-950">
                              {user.fullName || "Sin nombre"}
                            </p>
                            <p className="max-w-xs truncate text-xs font-semibold text-slate-500">
                              {user.email || "Sin correo"}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                              {user.phone || "Sin telefono"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="grid gap-2">
                          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                            {roleLabels[user.role]}
                          </span>
                          {isSeller && (
                            <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                              {statusLabel(user.sellerStatus)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isSeller ? (
                          <div className="grid gap-1 text-sm font-semibold text-slate-600">
                            <p>
                              <span className="font-black text-slate-900">
                                Tienda:
                              </span>{" "}
                              {user.storeName || "No registrada"}
                            </p>
                            <p>
                              <span className="font-black text-slate-900">
                                Categoria:
                              </span>{" "}
                              {user.mainCategory || "Sin categoria"}
                            </p>
                            <p>
                              <span className="font-black text-slate-900">
                                Ciudad:
                              </span>{" "}
                              {user.city || "Sin ciudad"}
                            </p>
                            <p>
                              <span className="font-black text-slate-900">
                                Cedula/RNC:
                              </span>{" "}
                              {user.documentId || "No registrado"}
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-1 text-sm font-semibold text-slate-600">
                            <p>
                              <span className="font-black text-slate-900">
                                Compras:
                              </span>{" "}
                              {user.orders?.length || 0}
                            </p>
                            <p>
                              <span className="font-black text-slate-900">
                                Financiamientos:
                              </span>{" "}
                              {user.financings?.length || 0}
                            </p>
                            <p>
                              <span className="font-black text-slate-900">
                                Terminos:
                              </span>{" "}
                              {user.acceptedTerms ? "Aceptados" : "Pendientes"}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-black text-emerald-700">
                          {money(user.wallet?.balance)}
                        </p>
                        <p className="text-xs font-bold text-slate-400">
                          Congelado: {money(user.wallet?.frozenBalance)}
                        </p>
                        {isSeller && (
                          <p className="text-xs font-bold text-slate-400">
                            Banco: {user.bankAccount || "No registrado"}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="grid gap-1 text-sm font-semibold text-slate-600">
                          <p>Productos: {user.products?.length || 0}</p>
                          <p>Ordenes: {user.orders?.length || 0}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="grid gap-2">
                          {user.isBlocked ? (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-600">
                              <Ban className="h-3.5 w-3.5" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                              <UserCheck className="h-3.5 w-3.5" />
                              Activo
                            </span>
                          )}
                          {user.isVerified ? (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Verificado
                            </span>
                          ) : (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                              Pendiente OTP
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnblock(user.id)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                              title="Desbloquear usuario"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(user.id)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 transition hover:bg-amber-100"
                              title="Bloquear usuario"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
