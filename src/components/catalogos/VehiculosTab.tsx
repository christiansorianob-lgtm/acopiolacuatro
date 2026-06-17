"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { getVehiculos, createVehiculo, updateVehiculo } from "@/app/actions/vehiculos";

interface Vehiculo {
  id: number;
  placa: string;
  tipo: string;
  tara: number | null;
  activo: boolean;
}

export function VehiculosTab() {
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehiculo | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState("Sencillo");
  const [tara, setTara] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const res = await getVehiculos();
    if (res.success && res.data) {
      setItems(res.data as Vehiculo[]);
    }
    setLoading(false);
  };

  const handleOpenModal = (item?: Vehiculo) => {
    if (item) {
      setEditingItem(item);
      setPlaca(item.placa);
      setTipo(item.tipo);
      setTara(item.tara ? item.tara.toString() : "");
    } else {
      setEditingItem(null);
      setPlaca("");
      setTipo("Sencillo");
      setTara("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim() || !tipo.trim()) return;

    setSaving(true);
    const taraNum = tara.trim() ? parseInt(tara.trim(), 10) : null;
    let res;
    
    if (editingItem) {
      res = await updateVehiculo(editingItem.id, { placa: placa.toUpperCase(), tipo, tara: taraNum });
    } else {
      res = await createVehiculo({ placa: placa.toUpperCase(), tipo, tara: taraNum });
    }

    if (res?.success) {
      setIsModalOpen(false);
      loadItems();
    } else {
      alert(res?.error || "Ocurrió un error");
    }
    setSaving(false);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const res = await updateVehiculo(id, { activo: !currentStatus });
    if (res?.success) {
      loadItems();
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Catálogo de Vehículos</h2>
          <p className="text-slate-400 text-sm">Gestiona los camiones y volquetas.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Vehículo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Placa</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Tara (Kg)</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No hay vehículos registrados.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{item.placa}</td>
                      <td className="px-6 py-4 text-slate-300">{item.tipo}</td>
                      <td className="px-6 py-4 text-slate-300">{item.tara ? item.tara.toLocaleString() : "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.activo ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {item.activo ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleToggleActive(item.id, item.activo)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                            title={item.activo ? "Desactivar" : "Activar"}
                          >
                            {item.activo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="text-cyan-500 hover:text-cyan-400 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingItem ? `Editar Vehículo` : `Nuevo Vehículo`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Placa</label>
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white uppercase focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Ej. ABC-123"
              required
              disabled={saving}
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Vehículo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              required
              disabled={saving}
            >
              <option value="Sencillo">Sencillo</option>
              <option value="Doble Troque">Doble Troque</option>
              <option value="Tractomula">Tractomula</option>
              <option value="Furgón">Furgón</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Peso Tara Predeterminado (Kg) - Opcional</label>
            <input
              type="number"
              value={tara}
              onChange={(e) => setTara(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Ej. 12500"
              disabled={saving}
              min={0}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
