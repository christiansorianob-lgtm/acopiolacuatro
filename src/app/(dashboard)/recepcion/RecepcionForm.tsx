"use client";

import { useState, useEffect } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Scale, Save, Loader2, RefreshCw, Printer, ArrowRight, ChevronLeft, CheckCircle2, Plus } from "lucide-react";
import { crearTiqueteIngreso, registrarSalidaTiquete } from "@/app/actions/tiquetes";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { createVehiculo } from "@/app/actions/vehiculos";
import { createConductor } from "@/app/actions/conductores";
import { createGenericItem, GenericCatalogType } from "@/app/actions/generic-catalog";
import { LectorBascula } from "@/components/ui/LectorBascula";

interface RecepcionFormProps {
  data: {
    vehiculos: { id: number; label: string; subLabel: string; tara: number | null }[];
    conductores: { id: number; label: string; subLabel: string }[];
    proveedores: { id: number; label: string }[];
    clientes: { id: number; label: string }[];
    origenes: { id: number; label: string }[];
    destinos: { id: number; label: string }[];
    productos: { id: number; label: string }[];
    tiposVehiculo: string[];
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
  
  // Flujo de Éxito / Salida Directa
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [showSalidaForm, setShowSalidaForm] = useState(false);
  const [pesoSalida, setPesoSalida] = useState<number | "">("");
  const [savingSalida, setSavingSalida] = useState(false);

  // Inline quick create types for quick create vehicle
  const [showQcNewTipoInput, setShowQcNewTipoInput] = useState(false);
  const [qcNewTipoName, setQcNewTipoName] = useState("");

  const handleQcQuickCreateTipo = async () => {
    if (!qcNewTipoName.trim()) return;
    setQuickCreateSaving(true);
    const res = await createGenericItem("tipos_vehiculo", qcNewTipoName.trim());
    if (res.success && res.data) {
      const nuevoNombre = res.data.nombre;
      setData(prev => ({
        ...prev,
        tiposVehiculo: [...prev.tiposVehiculo.filter(t => t !== nuevoNombre), nuevoNombre]
      }));
      setQcTipoVehiculo(nuevoNombre);
      setShowQcNewTipoInput(false);
      setQcNewTipoName("");
    } else {
      alert(res.error || "Error al crear el tipo");
    }
    setQuickCreateSaving(false);
  };



  // Quick Create State
  const [quickCreateType, setQuickCreateType] = useState<EntityType | null>(null);
  const [quickCreateSaving, setQuickCreateSaving] = useState(false);
  
  // Quick Create Form Fields
  const [qcPlaca, setQcPlaca] = useState("");
  const [qcTipoVehiculo, setQcTipoVehiculo] = useState("Sencillo");
  const [qcTara, setQcTara] = useState("");
  
  const [qcCedula, setQcCedula] = useState("");
  const [qcNombre, setQcNombre] = useState("");
  const [qcTelefono, setQcTelefono] = useState("");

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
      // Guardar el tiquete creado y abrir modal de éxito
      setCreatedTicket(res.data);
      setShowSalidaForm(false);
      setPesoSalida("");

      // Limpiar el formulario
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

  const handleSaveSalidaTiquete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdTicket || pesoSalida === "" || Number(pesoSalida) <= 0) return;

    setSavingSalida(true);
    const res = await registrarSalidaTiquete(createdTicket.id, Number(pesoSalida), usuarioId);
    if (res.success && res.data) {
      alert(`¡Salida registrada exitosamente! Peso Neto: ${res.data?.pesoNeto} Kg`);
      const tId = createdTicket.id;
      setCreatedTicket(null);
      setShowSalidaForm(false);
      setPesoSalida("");
      // Auto-open print window
      window.open(`/imprimir/${createdTicket.publicToken}`, '_blank');
      router.refresh();
    } else {
      alert(res.error);
    }
    setSavingSalida(false);
  };

  const openQuickCreate = (type: EntityType, searchValue: string) => {
    setQuickCreateType(type);
    setShowQcNewTipoInput(false);
    setQcNewTipoName("");
    if (type === 'vehiculo') {
      setQcPlaca(searchValue.toUpperCase());
      setQcTipoVehiculo(data.tiposVehiculo?.[0] || "Sencillo");
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
      setQcTelefono("");
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
        const res = await createConductor({ cedula: qcCedula, nombre: qcNombre, telefono: qcTelefono.trim() || null });
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
        <LectorBascula onPesoChange={(peso) => setPesoCapturado(peso)} />

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
                {!showQcNewTipoInput ? (
                  <div className="flex gap-2">
                    <select required value={qcTipoVehiculo} onChange={e => setQcTipoVehiculo(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" disabled={quickCreateSaving}>
                      {data.tiposVehiculo?.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                      {(!data.tiposVehiculo || data.tiposVehiculo.length === 0) && (
                        <>
                          <option value="Sencillo">Sencillo</option>
                          <option value="Doble Troque">Doble Troque</option>
                          <option value="Tractomula">Tractomula</option>
                          <option value="Furgón">Furgón</option>
                        </>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQcNewTipoInput(true);
                        setQcNewTipoName("");
                      }}
                      title="Crear nuevo tipo"
                      className="px-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors flex items-center justify-center font-bold text-lg"
                      disabled={quickCreateSaving}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qcNewTipoName}
                      onChange={(e) => setQcNewTipoName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Nuevo Tipo (ej. Volqueta)"
                      autoFocus
                      disabled={quickCreateSaving}
                    />
                    <button
                      type="button"
                      onClick={handleQcQuickCreateTipo}
                      disabled={quickCreateSaving || !qcNewTipoName.trim()}
                      className="px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQcNewTipoInput(false)}
                      disabled={quickCreateSaving}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      X
                    </button>
                  </div>
                )}
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono (WhatsApp)</label>
                <input value={qcTelefono} onChange={e => setQcTelefono(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. 3153930918 (opcional)" disabled={quickCreateSaving}/>
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

      {/* MODAL DE ÉXITO Y TRÁMITE DE SALIDA DIRECTA */}
      <Modal
        isOpen={!!createdTicket}
        onClose={() => {
          if (!savingSalida) {
            setCreatedTicket(null);
            setShowSalidaForm(false);
          }
        }}
        title={showSalidaForm ? "Registrar Salida de Planta" : "¡Tiquete de Ingreso Registrado!"}
      >
        {createdTicket && (
          <div className="space-y-6">
            {!showSalidaForm ? (
              // Vista 1: Éxito y Opciones
              <div className="space-y-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">
                    Tiquete N° #{String(createdTicket.numero).padStart(6, '0')}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    El pesaje inicial se ha guardado correctamente.
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 grid grid-cols-2 gap-4 text-left text-sm max-w-md mx-auto">
                  <div>
                    <p className="text-slate-500 mb-0.5">Vehículo (Placa)</p>
                    <p className="font-bold tracking-widest text-white">{createdTicket.placa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Peso Entrada</p>
                    <p className="font-mono text-slate-300 font-bold">{createdTicket.pesoEntrada.toLocaleString('es-CO')} Kg</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 mb-0.5">Conductor</p>
                    <p className="font-semibold text-slate-200 text-ellipsis overflow-hidden whitespace-nowrap">{createdTicket.conductorNombre}</p>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowSalidaForm(true)}
                    className="w-full max-w-xs inline-flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Scale className="w-5 h-5" />
                    Registrar Salida
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCreatedTicket(null);
                    setShowSalidaForm(false);
                  }}
                  className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                >
                  Nuevo Tiquete de Entrada
                </button>
              </div>
            ) : (
              // Vista 2: Registrar Salida (Pesaje Final)
              <form onSubmit={handleSaveSalidaTiquete} className="space-y-6">
                <div className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" onClick={() => setShowSalidaForm(false)}>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Volver a opciones</span>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-0.5">Tiquete N°</p>
                    <p className="font-mono text-cyan-400 font-bold">#{String(createdTicket.numero).padStart(6, '0')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Vehículo</p>
                    <p className="font-bold tracking-widest text-white">{createdTicket.placa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Peso Entrada</p>
                    <p className="font-mono text-slate-300 font-bold">{createdTicket.pesoEntrada.toLocaleString('es-CO')} Kg</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Conductor</p>
                    <p className="font-semibold text-slate-200 text-ellipsis overflow-hidden whitespace-nowrap">{createdTicket.conductorNombre}</p>
                  </div>
                </div>

                {/* Input Manual Peso Salida */}
                <div className="bg-black rounded-xl p-6 border-2 transition-colors duration-300 shadow-inner border-slate-800 focus-within:border-cyan-500/50 focus-within:shadow-cyan-500/20">
                  <div className="flex items-baseline justify-center gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      value={pesoSalida}
                      onChange={(e) => setPesoSalida(Number(e.target.value) || "")}
                      disabled={savingSalida}
                      placeholder="00000"
                      className="w-[200px] bg-transparent text-right text-5xl font-bold font-mono tracking-tighter text-emerald-500 placeholder-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      autoFocus
                    />
                    <span className="text-xl font-bold text-slate-600 font-mono">KG</span>
                  </div>
                  <p className="text-xs mt-4 font-medium text-slate-500 uppercase text-center">
                    Peso Manual de Salida
                  </p>
                </div>

                {/* Peso Neto en vivo */}
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-emerald-500" />
                    <span className="font-semibold text-emerald-500">Peso Neto Calculado:</span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-white">
                    {pesoSalida ? Math.abs(createdTicket.pesoEntrada - Number(pesoSalida)).toLocaleString('es-CO') : 0} Kg
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSalidaForm(false)}
                    disabled={savingSalida}
                    className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingSalida || !pesoSalida}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSalida ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                    ) : (
                      <>Finalizar Viaje <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
