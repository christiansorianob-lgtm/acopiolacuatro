"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type GenericCatalogType = "proveedores" | "clientes" | "origenes" | "destinos" | "productos";

export async function getGenericItems(type: GenericCatalogType) {
  try {
    // @ts-ignore - Prisma dynamic models
    const items = await prisma[type].findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: items };
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return { success: false, error: "Error al cargar los registros" };
  }
}

export async function createGenericItem(type: GenericCatalogType, nombre: string) {
  try {
    // @ts-ignore
    const item = await prisma[type].create({
      data: { nombre, activo: true }
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    return { success: false, error: "Error al crear el registro" };
  }
}

export async function updateGenericItem(type: GenericCatalogType, id: number, data: { nombre?: string, activo?: boolean }) {
  try {
    // @ts-ignore
    const item = await prisma[type].update({
      where: { id },
      data
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    return { success: false, error: "Error al actualizar el registro" };
  }
}
