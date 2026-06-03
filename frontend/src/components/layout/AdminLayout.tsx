import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  ShieldCheck,
  CreditCard,
  FileText,
  Users,
  MessageCircle,
} from "lucide-react";
import { useEffect } from "react";
import { socket } from "../../socket";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";
import { requestNotificationPermission } from "../../firebase/requestNotificationPermission";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  { to: "/admin/users", label: "Usuarios", icon: Users },
  { to: "/admin/sellers", label: "Vendedores", icon: ShieldCheck },
  { to: "/admin/financings", label: "Financiamientos", icon: CreditCard },
  { to: "/admin/reports", label: "Reportes", icon: FileText },
  { to: "/admin/chats", label: "Chats", icon: MessageCircle },
];
export default function AdminLayout() {
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

  useEffect(() => {
    if (!user) return;

    requestNotificationPermission();

    socket.connect();
    socket.emit("join", user.id);

    socket.on("new_notification", (notification) => {
      toast.success(notification.title);
    });

    return () => {
      socket.off("new_notification");
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="h-screen overflow-hidden bg-slate-100 p-4 text-slate-900">
      <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className="hidden h-full w-[288px] shrink-0 border-r border-slate-200 bg-white px-6 py-7 lg:flex lg:flex-col">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 font-black text-white shadow-lg shadow-emerald-100">
              C
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-950">CoopMarket</h1>
              <p className="text-xs font-semibold text-slate-400">
                Administrador
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

          <div className="mt-auto grid gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold text-red-500 transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">BIENVENIDO</p>
                <p className="text-xs font-semibold text-slate-400">
                  Panel de Control
                </p>
              </div>
            </div>

            <div className="ml-4 flex items-center gap-3">
              <Link
                to="/admin/financings"
                className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                aria-label="Notificaciones administrativas"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500" />
              </Link>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <button className="hidden items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 sm:flex">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-sm font-black text-white">
                  {initials || "AD"}
                </div>
                <span className="max-w-32 truncate text-sm font-bold text-slate-800">
                  {user?.fullName || "Admin"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
