"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type GenericCatalogType = "proveedores" | "clientes" | "origenes" | "destinos" | "productos" | "tipos_vehiculo";

export async function getGenericItems(type: GenericCatalogType) {
  try {
    // @ts-ignore - Prisma dynamic models
    let items = await prisma[type].findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Auto-seed default vehicle types if the table is empty
    if (type === "tipos_vehiculo" && items.length === 0) {
      const defaultTypes = ["Sencillo", "Doble Troque", "Tractomula", "Furgón"];
      // @ts-ignore
      await prisma[type].createMany({
        data: defaultTypes.map(nombre => ({ nombre, activo: true }))
      });
      // Re-fetch after seeding
      // @ts-ignore
      items = await prisma[type].findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

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
