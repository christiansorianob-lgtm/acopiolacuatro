"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Scale, History, Settings, LogOut, Leaf } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pesaje", href: "/recepcion", icon: Scale },
    { name: "Historial", href: "/historial", icon: History },
  ];

  // Solo agregar catálogos si es administrador
  if (session?.user?.rol === "ADMINISTRADOR") {
    navItems.push({ name: "Catálogos", href: "/catalogos", icon: Settings });
  }

  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-950 border-r border-slate-800 h-screen sticky top-0 transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Agrovaspalma Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold tracking-tight text-white">Centro Acopio</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Menú Principal
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
