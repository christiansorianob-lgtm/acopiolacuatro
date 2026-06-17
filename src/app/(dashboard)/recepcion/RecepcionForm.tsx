"use client";

import { useState, useEffect } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Scale, Save, Loader2, RefreshCw } from "lucide-react";
import { crearTiqueteIngreso } from "@/app/actions/tiquetes";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { createVehiculo } from "@/app/actions/vehiculos";
import { createConductor } from "@/app/actions/conductores";
import { createGenericItem, GenericCatalogType } from "@/app/actions/generic-catalog";

interface RecepcionFormProps {
  data: {
    vehiculos: { id: number; label: string; subLabel: string; tara: number | null }[];
    conductores: { id: number; label: string; subLabel: string }[];
    proveedores: { id: number; label: string }[];
    clientes: { id: number; label: string }[];
    origenes: { id: number; label: string }[];
    destinos: { id: number; label: string }[];
    productos: { id: number; label: string }[];
  };
  usuarioId: number;
}

type EntityType = 'vehiculo' | 'conductor' | 'proveedores' | 'clientes' | 'origenes' | 'destinos' | 'productos';

export function RecepcionForm({ data: initialData, usuarioId }: RecepcionFormProps) {
  const router = useRouter();
  
  // Local data state for optimistic updates
  const [data, setData] = useState(initialData);
  useEffect(() => { setData(initialData); }, [initialData]);

  const [saving, setSaving] = useState(false);
  const [pesoCapturado, setPesoCapturado] = useState<number>(0);
  const [simulando, setSimulando] = useState(false);

  // Form State
  const [vehiculoId, setVehiculoId] = useState<number | null>(null);
  const [conductorId, setConductorId] = useState<number | null>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [origenId, setOrigenId] = useState<number | null>(null);
  const [destinoId, setDestinoId] = useState<number | null>(null);
  const [productoId, setProductoId] = useState<number | null>(null);
  const [remision, setRemision] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Quick Create State
  const [quickCreateType, setQuickCreateType] = useState<EntityType | null>(null);
  const [quickCreateSaving, setQuickCreateSaving] = useState(false);
  
  // Quick Create Form Fields
  const [qcPlaca, setQcPlaca] = useState("");
  const [qcTipoVehiculo, setQcTipoVehiculo] = useState("Sencillo");
  const [qcTara, setQcTara] = useState("");
  
  const [qcCedula, setQcCedula] = useState("");
  const [qcNombre, setQcNombre] = useState("");

  // Efecto visual de peso fluctuando
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulando) {
      interval = setInterval(() => {
        const fakePeso = 15000 + Math.floor(Math.random() * 50);
        setPesoCapturado(fakePeso);
      }, 150);
      setTimeout(() => {
        clearInterval(interval);
        setSimulando(false);
        setPesoCapturado(15230);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [simulando]);

  const handleSimularBascula = () => {
    if (simulando) return;
    setPesoCapturado(0);
    setSimulando(true);
  };

  const handleSaveTiquete = async () => {
    if (!vehiculoId || !conductorId) {
      alert("Por favor seleccione un Vehículo y un Conductor obligatoriamente.");
      return;
    }
    if (pesoCapturado <= 0) {
      alert("No se ha capturado un peso válido de la báscula.");
      return;
    }

    setSaving(true);
    const res = await crearTiqueteIngreso({
      vehiculoId,
      conductorId,
      proveedorId: proveedorId || undefined,
      clienteId: clienteId || undefined,
      origenId: origenId || undefined,
      destinoId: destinoId || undefined,
      productoId: productoId || undefined,
      pesoEntrada: pesoCapturado,
      remision,
      observaciones,
      usuarioEntradaId: usuarioId
    });

    if (res.success && res.data) {
      alert(`¡Éxito! Tiquete de Ingreso #${res.data.numero} creado correctamente.`);
      setVehiculoId(null);
      setConductorId(null);
      setProveedorId(null);
      setClienteId(null);
      setOrigenId(null);
      setDestinoId(null);
      setProductoId(null);
      setRemision("");
      setObservaciones("");
      setPesoCapturado(0);
      router.refresh();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  const openQuickCreate = (type: EntityType, searchValue: string) => {
    setQuickCreateType(type);
    if (type === 'vehiculo') {
      setQcPlaca(searchValue.toUpperCase());
      setQcTipoVehiculo("Sencillo");
      setQcTara("");
    } else if (type === 'conductor') {
      // If it looks like a number, put in cedula, else nombre
      if (/^\d+$/.test(searchValue)) {
        setQcCedula(searchValue);
        setQcNombre("");
      } else {
        setQcCedula("");
        setQcNombre(searchValue);
      }
    } else {
      setQcNombre(searchValue);
    }
  };

  const handleQuickCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCreateSaving(true);
    let success = false;
    let newId: number | null = null;

    try {
      if (quickCreateType === 'vehiculo') {
        const taraNum = qcTara ? parseInt(qcTara, 10) : null;
        const res = await createVehiculo({ placa: qcPlaca, tipo: qcTipoVehiculo, tara: taraNum });
        if (res.success && res.data) {
          success = true;
          newId = res.data.id;
          setData(prev => ({
            ...prev,
            vehiculos: [...prev.vehiculos, { id: res.data.id, label: res.data.placa, subLabel: `${res.data.tipo} ${res.data.tara ? `(Tara: ${res.data.tara}Kg)` : ''}`, tara: res.data.tara }]
          }));
          setVehiculoId(newId);
        } else alert(res.error);
      } 
      else if (quickCreateType === 'conductor') {
        const res = await createConductor({ cedula: qcCedula, nombre: qcNombre });
        if (res.success && res.data) {
          success = true;
          newId = res.data.id;
          setData(prev => ({
            ...prev,
            conductores: [...prev.conductores, { id: res.data.id, label: res.data.nombre, subLabel: `C.C. ${res.data.cedula}` }]
          }));
          setConductorId(newId);
        } else alert(res.error);
      }
      else if (quickCreateType) {
        // Genéricos
        const res = await createGenericItem(quickCreateType as GenericCatalogType, qcNombre);
        if (res.success && res.data) {
          success = true;
          newId = res.data.id;
          setData(prev => ({
            ...prev,
            [quickCreateType]: [...prev[quickCreateType], { id: res.data.id, label: res.data.nombre }]
          }));
          
          // Auto-select
          if (quickCreateType === 'proveedores') setProveedorId(newId);
          if (quickCreateType === 'clientes') setClienteId(newId);
          if (quickCreateType === 'origenes') setOrigenId(newId);
          if (quickCreateType === 'destinos') setDestinoId(newId);
          if (quickCreateType === 'productos') setProductoId(newId);
        } else alert(res.error);
      }
    } catch (err) {
      alert("Error inesperado al crear el registro");
    }

    if (success) {
      setQuickCreateType(null);
      router.refresh(); // Sync server props
    }
    setQuickCreateSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Formulario (2 columnas en LG) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 relative z-10">
          <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3 mb-5">Datos del Viaje</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Vehículo <span className="text-red-400">*</span></label>
              <SearchableSelect 
                options={data.vehiculos} 
                value={vehiculoId} 
                onChange={setVehiculoId} 
                placeholder="Buscar por placa..." 
                disabled={saving}
                onCreateNew={(val) => openQuickCreate('vehiculo', val)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Conductor <span className="text-red-400">*</span></label>
              <SearchableSelect 
                options={data.conductores} 
                value={conductorId} 
                onChange={setConductorId} 
                placeholder="Buscar por cédula o nombre..." 
                disabled={saving}
                onCreateNew={(val) => openQuickCreate('conductor', val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Proveedor (Finca)</label>
              <SearchableSelect 
                options={data.proveedores} 
                value={proveedorId} 
                onChange={setProveedorId} 
                placeholder="Seleccionar proveedor..." 
                disabled={saving}
                onCreateNew={(val) => openQuickCreate('proveedores', val)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Producto</label>
              <SearchableSelect 
                options={data.productos} 
                value={productoId} 
                onChange={setProductoId} 
                placeholder="Seleccionar producto..." 
                disabled={saving}
                onCreateNew={(val) => openQuickCreate('productos', val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Origen</label>
              <SearchableSelect 
                options={data.origenes} 
                value={origenId} 
                onChange={setOrigenId} 
                placeholder="Seleccionar origen..." 
                disabled={saving}
                onCreateNew={(val) => openQuickCreate('origenes', val)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Cliente / Destino Final</label>
              <SearchableSelect 
                options={data.clientes} 
                value={clienteId} 
                onChange={setClienteId} 
                placeholder="Seleccionar cliente..." 
                disabled={saving}
                onCreateNew={(val) => openQuickCreate('clientes', val)}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3 mb-5">Información Adicional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Remisión Física (N°)</label>
              <input
                type="text"
                value={remision}
                onChange={(e) => setRemision(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Ej. REM-5021"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Observaciones</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Novedades al ingreso..."
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Pantalla de Báscula */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 to-transparent pointer-events-none" />
          
          <div className="p-6 text-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Indicador de Peso</h2>
            
            <div className={`bg-black rounded-xl p-6 mb-6 border-2 transition-colors duration-300 shadow-inner ${simulando ? 'border-amber-500/50 shadow-amber-500/20' : (pesoCapturado > 0 ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-slate-800')}`}>
              <div className="font-mono flex items-baseline justify-center gap-2">
                <span className={`text-5xl md:text-6xl font-bold tracking-tighter ${simulando ? 'text-amber-500' : (pesoCapturado > 0 ? 'text-emerald-500' : 'text-slate-700')}`}>
                  {pesoCapturado === 0 ? "00000" : pesoCapturado}
                </span>
                <span className={`text-xl font-bold ${pesoCapturado > 0 ? 'text-emerald-500/70' : 'text-slate-700'}`}>
                  KG
                </span>
              </div>
              <p className={`text-xs mt-2 font-medium ${simulando ? 'text-amber-500 animate-pulse' : (pesoCapturado > 0 ? 'text-emerald-500' : 'text-slate-700')}`}>
                {simulando ? "LEYENDO PUERTO SERIAL..." : (pesoCapturado > 0 ? "PESO ESTABLE" : "BÁSCULA EN CERO")}
              </p>
            </div>

            <button
              onClick={handleSimularBascula}
              disabled={simulando || saving}
              className="w-full py-4 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group border border-slate-700 hover:border-slate-600"
            >
              <RefreshCw className={`w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500 ${simulando ? 'animate-spin' : ''}`} />
              {simulando ? "Capturando..." : "Capturar Peso Báscula"}
            </button>
          </div>
        </div>

        <button
          onClick={handleSaveTiquete}
          disabled={saving || pesoCapturado === 0 || !vehiculoId || !conductorId}
          className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {saving ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
          ) : (
            <><Save className="w-6 h-6" /> Guardar Pesaje Inicial</>
          )}
        </button>
      </div>

      {/* QUICK CREATE MODAL */}
      <Modal 
        isOpen={!!quickCreateType} 
        onClose={() => !quickCreateSaving && setQuickCreateType(null)}
        title={`Añadir nuevo ${quickCreateType ? quickCreateType.slice(0, 1).toUpperCase() + quickCreateType.slice(1).replace('es', '') : ''}`}
      >
        <form onSubmit={handleQuickCreateSubmit} className="space-y-4">
          
          {quickCreateType === 'vehiculo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Placa</label>
                <input required value={qcPlaca} onChange={e => setQcPlaca(e.target.value.toUpperCase())} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white uppercase focus:outline-none focus:border-cyan-500" placeholder="ABC-123" maxLength={10} disabled={quickCreateSaving}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Vehículo</label>
                <select required value={qcTipoVehiculo} onChange={e => setQcTipoVehiculo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" disabled={quickCreateSaving}>
                  <option value="Sencillo">Sencillo</option>
                  <option value="Doble Troque">Doble Troque</option>
                  <option value="Tractomula">Tractomula</option>
                  <option value="Furgón">Furgón</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Peso Tara Predeterminado (Kg) - Opcional</label>
                <input type="number" value={qcTara} onChange={e => setQcTara(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. 12500" disabled={quickCreateSaving}/>
              </div>
            </>
          )}

          {quickCreateType === 'conductor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cédula</label>
                <input required value={qcCedula} onChange={e => setQcCedula(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" disabled={quickCreateSaving}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input required value={qcNombre} onChange={e => setQcNombre(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" disabled={quickCreateSaving}/>
              </div>
            </>
          )}

          {quickCreateType && !['vehiculo', 'conductor'].includes(quickCreateType) && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
              <input required value={qcNombre} onChange={e => setQcNombre(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" disabled={quickCreateSaving}/>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setQuickCreateType(null)} disabled={quickCreateSaving} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={quickCreateSaving} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              {quickCreateSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {quickCreateSaving ? "Guardando..." : "Guardar y Seleccionar"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
