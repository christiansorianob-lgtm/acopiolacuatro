"use client";

import { useSession } from "next-auth/react";
import { Menu, Bell, UserCircle } from "lucide-react";

export default function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      
      <div className="hidden md:flex flex-1">
        {/* Espacio para breadcrumbs o título dinámico si se requiere en el futuro */}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-800/50 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">
              {session?.user?.name || "Cargando..."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {session?.user?.rol || "..."}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-900/20">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <UserCircle className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </header>
  );
}
