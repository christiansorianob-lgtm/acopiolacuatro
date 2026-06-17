// Parche dinámico para Vercel si faltan las variables
// Removed NEXTAUTH_URL patch to allow automatic host detection

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "fallback_super_secret_key_acopio_123_override_forced_value_for_vercel";
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
