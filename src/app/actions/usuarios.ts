"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsuarios() {
  try {
    const items = await prisma.usuarios.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        cedula: true,
        rol: true,
        activo: true,
        createdAt: true,
        // Excluimos el PIN por seguridad
      }
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    return { success: false, error: "Error al cargar los usuarios" };
  }
}

export async function createUsuario(data: { cedula: string; nombre: string; rol: string; pin: string }) {
  try {
    const hashedPin = await bcrypt.hash(data.pin, 10);
    const item = await prisma.usuarios.create({
      data: { 
        cedula: data.cedula,
        nombre: data.nombre,
        rol: data.rol,
        pin: hashedPin,
        activo: true 
      },
      select: { id: true, nombre: true, cedula: true, rol: true, activo: true, createdAt: true }
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error creating usuario:", error);
    if (error.code === 'P2002') return { success: false, error: "La cédula ya está registrada" };
    return { success: false, error: "Error al crear el usuario" };
  }
}

export async function updateUsuario(id: number, data: { cedula?: string; nombre?: string; rol?: string; pin?: string; activo?: boolean }) {
  try {
    const updateData: any = { ...data };
    
    if (data.pin) {
      updateData.pin = await bcrypt.hash(data.pin, 10);
    }

    const item = await prisma.usuarios.update({
      where: { id },
      data: updateData,
      select: { id: true, nombre: true, cedula: true, rol: true, activo: true, createdAt: true }
    });
    revalidatePath("/catalogos");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error updating usuario:", error);
    if (error.code === 'P2002') return { success: false, error: "La cédula ya está registrada" };
    return { success: false, error: "Error al actualizar el usuario" };
  }
}
