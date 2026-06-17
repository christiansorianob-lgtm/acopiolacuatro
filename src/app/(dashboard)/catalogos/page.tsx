"use client";

import { useState } from "react";
import { Truck, Users, MapPin, Building2, Box, ArrowRightLeft, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { GenericCatalogTab } from "@/components/catalogos/GenericCatalogTab";

const TABS = [
  { id: "vehiculos", label: "Vehículos", icon: Truck },
  { id: "conductores", label: "Conductores", icon: Users },
  { id: "proveedores", label: "Proveedores", icon: Building2 },
  { id: "clientes", label: "Clientes", icon: Building2 },
  { id: "origenes", label: "Orígenes", icon: MapPin },
  { id: "destinos", label: "Destinos", icon: Target },
  { id: "productos", label: "Productos", icon: Box },
];

export default function CatalogosPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const tabsToRender = [...TABS];
  if (session?.user?.rol === "ADMINISTRADOR") {
    tabsToRender.push({ id: "usuarios", label: "Usuarios", icon: Users });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Catálogos</h1>
        <p className="text-slate-400 mt-1">Administración de entidades base del sistema.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
        {/* Tabs Header */}
        <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
          {tabsToRender.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-400 bg-cyan-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          {activeTab === "vehiculos" && <div>Aquí irá el catálogo de Vehículos</div>}
          {activeTab === "conductores" && <div>Aquí irá el catálogo de Conductores</div>}
          
          {activeTab === "proveedores" && <GenericCatalogTab type="proveedores" title="Proveedores" />}
          {activeTab === "clientes" && <GenericCatalogTab type="clientes" title="Clientes" />}
          {activeTab === "origenes" && <GenericCatalogTab type="origenes" title="Orígenes" />}
          {activeTab === "destinos" && <GenericCatalogTab type="destinos" title="Destinos" />}
          {activeTab === "productos" && <GenericCatalogTab type="productos" title="Productos" />}
          
          {activeTab === "usuarios" && <div>Aquí irá el catálogo de Usuarios</div>}
        </div>
      </div>
    </div>
  );
}
