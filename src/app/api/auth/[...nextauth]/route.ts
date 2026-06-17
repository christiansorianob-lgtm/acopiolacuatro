// Parche dinámico para Vercel si faltan las variables
// Removed hacky environment patches

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
