import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Solo usuarios con rol "owner" del tenant admin pueden entrar
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🏟️ Cancha SaaS — Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{session.user?.email}</span>
          <Link
            href="/api/auth/signout"
            className="text-sm bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700"
          >
            🚪 Cerrar sesión
          </Link>
        </div>
      </nav>
      {/* Contenido */}
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}