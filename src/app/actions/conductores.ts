"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getConductores() {
  try {
    const items = await prisma.conductores.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching conductores:", error);
    return { success: false, error: "Error al cargar los conductores" };
  }
}

export async function createConductor(data: { cedula: string; nombre: string }) {
  try {
    const item = await prisma.conductores.create({
      data: { ...data, activo: true }
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error creating conductor:", error);
    if (error.code === 'P2002') return { success: false, error: "La cédula ya está registrada" };
    return { success: false, error: "Error al crear el conductor" };
  }
}

export async function updateConductor(id: number, data: { cedula?: string; nombre?: string; activo?: boolean }) {
  try {
    const item = await prisma.conductores.update({
      where: { id },
      data
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error updating conductor:", error);
    if (error.code === 'P2002') return { success: false, error: "La cédula ya está registrada" };
    return { success: false, error: "Error al actualizar el conductor" };
  }
}
