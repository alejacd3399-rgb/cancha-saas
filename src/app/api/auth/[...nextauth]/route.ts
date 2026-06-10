import { handlers } from "@/auth";

// NextAuth maneja automáticamente:
// - /api/auth/signin
// - /api/auth/signout
// - /api/auth/session
export const { GET, POST } = handlers;