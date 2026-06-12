import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardList,
  Handshake,
  Home,
  LogOut,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const navItems = [
  { to: "/provider", label: "Dashboard", icon: Home, end: true },
  { to: "/provider/services", label: "Publicar servicios", icon: Handshake },
  { to: "/provider/my-services", label: "Solicitudes", icon: ClipboardList },
];

export default function ServiceProviderLayout() {
  const navigate = useNavigate();
  const user = useAuthStore.getState().user;
  const logout = useAuthStore.getState().logout;
  const initials = user?.fullName
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (user?.role === "SERVICE_PROVIDER" && user.sellerStatus !== "APPROVED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="max-w-xl rounded-2xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <BriefcaseBusiness className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-950">
            Perfil de proveedor en revision
          </h1>
          <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
            El administrador debe aprobar tu cuenta antes de publicar servicios
            y recibir solicitudes.
          </p>
          <button
            onClick={handleLogout}
            className="mt-8 rounded-xl bg-red-500 px-6 py-3 font-black text-white hover:bg-red-400"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 p-4 text-slate-900">
      <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className="hidden h-full w-[288px] shrink-0 border-r border-slate-200 bg-white px-6 py-7 lg:flex lg:flex-col">
          <Link to="/provider" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 font-black text-white shadow-lg shadow-emerald-100">
              C
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950">CoopMarket</h1>
              <p className="text-xs font-semibold text-slate-400">
                Proveedor
              </p>
            </div>
          </Link>

          <nav className="mt-10 grid gap-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesion
          </button>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">
                  SERVICIOS
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  Panel proveedor
                </p>
              </div>
            </div>

            <button className="hidden items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-sm font-black text-white">
                {initials || "PS"}
              </div>
              <span className="max-w-32 truncate text-sm font-bold text-slate-800">
                {user?.fullName || "Proveedor"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
