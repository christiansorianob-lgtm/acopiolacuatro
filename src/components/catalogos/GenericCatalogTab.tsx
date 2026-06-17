"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { getGenericItems, createGenericItem, updateGenericItem, GenericCatalogType } from "@/app/actions/generic-catalog";

interface Item {
  id: number;
  nombre: string;
  activo: boolean;
  createdAt: Date;
}

export function GenericCatalogTab({ type, title }: { type: GenericCatalogType; title: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItems();
  }, [type]);

  const loadItems = async () => {
    setLoading(true);
    const res = await getGenericItems(type);
    if (res.success && res.data) {
      setItems(res.data as Item[]);
    }
    setLoading(false);
  };

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setNombreForm(item.nombre);
    } else {
      setEditingItem(null);
      setNombreForm("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreForm.trim()) return;

    setSaving(true);
    let res;
    if (editingItem) {
      res = await updateGenericItem(type, editingItem.id, { nombre: nombreForm });
    } else {
      res = await createGenericItem(type, nombreForm);
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
    const res = await updateGenericItem(type, id, { activo: !currentStatus });
    if (res?.success) {
      loadItems();
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Catálogo de {title}</h2>
          <p className="text-slate-400 text-sm">Gestiona los registros que se usarán en los pesajes.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Registro
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
                  <th className="px-6 py-4 font-medium">Nombre</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No hay registros en este catálogo.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{item.nombre}</td>
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
        title={editingItem ? `Editar Registro` : `Nuevo Registro`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
            <input
              type="text"
              value={nombreForm}
              onChange={(e) => setNombreForm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Ej. Hacienda Las Margaritas"
              required
              disabled={saving}
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
