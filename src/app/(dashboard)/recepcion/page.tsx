import { prisma } from "@/lib/prisma";
import { RecepcionForm } from "./RecepcionForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function RecepcionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch only ACTIVE entities for the selectors
  const [
    vehiculos,
    conductores,
    proveedores,
    clientes,
    origenes,
    destinos,
    productos
  ] = await Promise.all([
    prisma.vehiculos.findMany({ where: { activo: true }, select: { id: true, placa: true, tipo: true, tara: true } }),
    prisma.conductores.findMany({ where: { activo: true }, select: { id: true, nombre: true, cedula: true } }),
    prisma.proveedores.findMany({ where: { activo: true }, select: { id: true, nombre: true } }),
    prisma.clientes.findMany({ where: { activo: true }, select: { id: true, nombre: true } }),
    prisma.origenes.findMany({ where: { activo: true }, select: { id: true, nombre: true } }),
    prisma.destinos.findMany({ where: { activo: true }, select: { id: true, nombre: true } }),
    prisma.productos.findMany({ where: { activo: true }, select: { id: true, nombre: true } })
  ]);

  // Query and auto-seed vehicle types
  let tiposVehiculo = await prisma.tipos_vehiculo.findMany({ where: { activo: true }, select: { nombre: true } });
  if (tiposVehiculo.length === 0) {
    const defaultTypes = ["Sencillo", "Doble Troque", "Tractomula", "Furgón"];
    await prisma.tipos_vehiculo.createMany({
      data: defaultTypes.map(nombre => ({ nombre, activo: true }))
    });
    tiposVehiculo = await prisma.tipos_vehiculo.findMany({ where: { activo: true }, select: { nombre: true } });
  }

  // Transform data for the SearchableSelect
  const data = {
    vehiculos: vehiculos.map(v => ({ id: v.id, label: v.placa, subLabel: `${v.tipo} ${v.tara ? `(Tara: ${v.tara}Kg)` : ''}`, tara: v.tara })),
    conductores: conductores.map(c => ({ id: c.id, label: c.nombre, subLabel: `C.C. ${c.cedula}` })),
    proveedores: proveedores.map(p => ({ id: p.id, label: p.nombre })),
    clientes: clientes.map(c => ({ id: c.id, label: c.nombre })),
    origenes: origenes.map(o => ({ id: o.id, label: o.nombre })),
    destinos: destinos.map(d => ({ id: d.id, label: d.nombre })),
    productos: productos.map(p => ({ id: p.id, label: p.nombre })),
    tiposVehiculo: tiposVehiculo.map(t => t.nombre),
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Nuevo Pesaje</h1>
        <p className="text-slate-400 mt-1">Registra un vehículo en la báscula y captura su peso inicial.</p>
      </div>

      <RecepcionForm data={data} usuarioId={parseInt(session.user.id)} />
    </div>
  );
}
