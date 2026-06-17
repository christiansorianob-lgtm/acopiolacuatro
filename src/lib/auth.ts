import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "PIN Numérico",
      credentials: {
        pin: { label: "PIN", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.pin) {
          return null;
        }

        try {
          // Buscamos todos los usuarios activos
          const usuarios = await prisma.usuarios.findMany({
            where: { activo: true }
          });

          for (const user of usuarios) {
            const isValid = await bcrypt.compare(credentials.pin, user.pin);
            if (isValid) {
              return {
                id: user.id.toString(),
                name: user.nombre,
                rol: user.rol,
              };
            }
          }

          return null; // PIN incorrecto
        } catch (error) {
          console.error("Database connection error in authorize:", error);
          throw new Error("Error de conexión a la base de datos");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).rol = token.rol;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_super_secret_key_acopio_123",
};
