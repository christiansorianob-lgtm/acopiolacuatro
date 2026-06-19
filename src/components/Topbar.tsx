"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Menu, Bell, UserCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useScale } from "@/contexts/ScaleContext";

export default function Topbar() {
  const { data: session } = useSession();
  const { isConnected, error, connectSerial, disconnectSerial, clearError } = useScale();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/notificaciones");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000); // Refrescar cada minuto
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        
        {/* Campanita de Notificaciones */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 ? (
              <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-700 rounded-full"></span>
            )}
          </button>

          {/* Menú Desplegable */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl shadow-black/50 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center">
                <h3 className="font-semibold text-white">Notificaciones</h3>
                <span className="text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                  {notifications.length} {notifications.length === 1 ? 'nueva' : 'nuevas'}
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Todo está al día.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {notifications.map((notif) => (
                      <Link 
                        key={notif.id} 
                        href={notif.link}
                        onClick={() => setIsOpen(false)}
                        className="p-4 flex gap-3 hover:bg-slate-800/50 transition-colors group block"
                      >
                        <div className="shrink-0 mt-0.5">
                          {notif.type === "warning" ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Bell className="w-5 h-5 text-cyan-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">{notif.title}</p>
                          <p className="text-xs text-slate-400 mt-1 leading-snug">{notif.description}</p>
                          <p className="text-[10px] font-bold text-amber-500 mt-2 uppercase tracking-wider">{notif.timeAgo} en espera</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Indicador de Báscula */}
        <div className="relative group flex items-center">
          <button
            onClick={isConnected ? disconnectSerial : connectSerial}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isConnected ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            title={isConnected ? "Báscula conectada (Clic para desconectar)" : "Báscula desconectada (Clic para conectar)"}
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="M7 21h10" />
                <path d="M12 3v18" />
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
              </svg>
              {isConnected ? (
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-600 rounded-full border-2 border-slate-900"></span>
              )}
            </div>
          </button>
          
          {error && (
            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-red-950/90 border border-red-900 rounded-xl shadow-xl z-50 text-xs text-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-400 mb-1">Error de Báscula</p>
                  <p>{error}</p>
                </div>
                <button onClick={clearError} className="text-red-500 hover:text-red-300">×</button>
              </div>
            </div>
          )}
        </div>
        
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
