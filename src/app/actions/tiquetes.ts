"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearTiqueteIngreso(data: {
  vehiculoId: number;
  conductorId: number;
  proveedorId?: number;
  clienteId?: number;
  origenId?: number;
  destinoId?: number;
  productoId?: number;
  pesoEntrada: number;
  remision?: string;
  observaciones?: string;
  tipoFruta?: string;
  variedad?: string;
  estadoFruta?: string;
  porcentajeImpurezas?: string;
  lote?: string;
  finca?: string;
  centroCosto?: string;
  horaDescargue?: string;
  transportador?: string;
  usuarioEntradaId: number;
}) {
  try {
    // Transacción para asegurar la asignación del consecutivo correcto
    const tiquete = await prisma.$transaction(async (tx) => {
      // Obtener el número máximo actual
      const lastTiquete = await tx.tiquetes.findFirst({
        orderBy: { numero: 'desc' },
        select: { numero: true }
      });

      const nextNumero = lastTiquete ? lastTiquete.numero + 1 : 1;

      // Obtener los nombres actuales de las entidades para guardarlos estáticamente en el tiquete (Snapshot)
      const vehiculo = await tx.vehiculos.findUnique({ where: { id: data.vehiculoId }});
      const conductor = await tx.conductores.findUnique({ where: { id: data.conductorId }});
      const proveedor = data.proveedorId ? await tx.proveedores.findUnique({ where: { id: data.proveedorId }}) : null;
      const cliente = data.clienteId ? await tx.clientes.findUnique({ where: { id: data.clienteId }}) : null;
      const origen = data.origenId ? await tx.origenes.findUnique({ where: { id: data.origenId }}) : null;
      const destino = data.destinoId ? await tx.destinos.findUnique({ where: { id: data.destinoId }}) : null;
      const producto = data.productoId ? await tx.productos.findUnique({ where: { id: data.productoId }}) : null;

      if (!vehiculo || !conductor) {
        throw new Error("Vehículo o Conductor inválido");
      }

      // Crear el tiquete
      return await tx.tiquetes.create({
        data: {
          numero: nextNumero,
          tipo: "INGRESO",
          estado: "ABIERTO",
          
          vehiculoId: data.vehiculoId,
          placa: vehiculo.placa,
          
          conductorId: data.conductorId,
          conductorNombre: conductor.nombre,
          
          proveedorId: data.proveedorId,
          proveedorNombre: proveedor?.nombre,
          
          clienteId: data.clienteId,
          clienteNombre: cliente?.nombre,
          
          origenId: data.origenId,
          origenNombre: origen?.nombre,
          
          destinoId: data.destinoId,
          destinoNombre: destino?.nombre,
          
          productoId: data.productoId,
          productoNombre: producto?.nombre,
          
          pesoEntrada: data.pesoEntrada,
          fechaEntrada: new Date(),
          
          remision: data.remision,
          observaciones: data.observaciones,
          
          tipoFruta: data.tipoFruta,
          variedad: data.variedad,
          estadoFruta: data.estadoFruta,
          porcentajeImpurezas: data.porcentajeImpurezas,
          lote: data.lote,
          finca: data.finca,
          centroCosto: data.centroCosto,
          horaDescargue: data.horaDescargue,
          transportador: data.transportador,
          
          usuarioEntradaId: data.usuarioEntradaId
        }
      });
    });

    revalidatePath("/recepcion");
    revalidatePath("/historial");
    revalidatePath("/"); // Dashboard

    return { success: true, data: tiquete };
  } catch (error: any) {
    console.error("Error al crear tiquete de ingreso:", error);
    return { success: false, error: error.message || "Error al crear el tiquete de ingreso" };
  }
}

export async function registrarSalidaTiquete(id: number, pesoSalida: number, usuarioSalidaId: number) {
  try {
    const tiquete = await prisma.tiquetes.findUnique({ where: { id } });
    if (!tiquete) throw new Error("Tiquete no encontrado");
    if (tiquete.estado !== "ABIERTO") throw new Error("El tiquete ya está cerrado o anulado");

    const pesoNeto = Math.abs(tiquete.pesoEntrada - pesoSalida);

    const updated = await prisma.tiquetes.update({
      where: { id },
      data: {
        pesoSalida,
        pesoNeto,
        fechaSalida: new Date(),
        estado: "CERRADO",
        usuarioSalidaId
      }
    });

    revalidatePath("/historial");
    revalidatePath("/recepcion");
    revalidatePath("/"); // Dashboard

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error al registrar salida:", error);
    return { success: false, error: error.message || "Error al registrar la salida" };
  }
}
