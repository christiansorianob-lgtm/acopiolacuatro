"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVehiculos() {
  try {
    const items = await prisma.vehiculos.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching vehiculos:", error);
    return { success: false, error: "Error al cargar los vehículos" };
  }
}

export async function createVehiculo(data: { placa: string; tipo: string; tara: number | null }) {
  try {
    const item = await prisma.vehiculos.create({
      data: { ...data, activo: true }
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error creating vehiculo:", error);
    if (error.code === 'P2002') return { success: false, error: "La placa ya está registrada" };
    return { success: false, error: "Error al crear el vehículo" };
  }
}

export async function updateVehiculo(id: number, data: { placa?: string; tipo?: string; tara?: number | null; activo?: boolean }) {
  try {
    const item = await prisma.vehiculos.update({
      where: { id },
      data
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error updating vehiculo:", error);
    if (error.code === 'P2002') return { success: false, error: "La placa ya está registrada" };
    return { success: false, error: "Error al actualizar el vehículo" };
  }
}
