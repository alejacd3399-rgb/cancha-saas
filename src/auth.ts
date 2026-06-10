import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscamos el usuario en la base de datos
        const user = await prisma.tenant_users.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password_hash) return null;

        // Verificamos la contraseña
        const passwordOk = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!passwordOk) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user.role as string) ?? "staff";
        token.tenantId = (user.tenantId as string) ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});