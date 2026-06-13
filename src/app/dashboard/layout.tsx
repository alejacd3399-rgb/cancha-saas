import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { checkLicense } from "@/lib/checkLicense";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  // Verificar licencia activa
  const tieneAcceso = await checkLicense(session.user.tenantId!);
  if (!tieneAcceso) redirect("/suspendido");

  // Detectar si es el administrador de la plataforma
  const esAdminPlataforma = session.user?.email === "admin@canchasaas.com";

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Menú lateral */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-6 border-b border-green-700">
          <h1 className="text-xl font-bold">🏟️ Cancha SaaS</h1>
          <p className="text-green-300 text-sm mt-1">{session.user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {esAdminPlataforma ? (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors bg-green-900"
            >
              🛠️ Panel Administrador
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/dashboard/canchas"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                ⚽ Mis Canchas
              </Link>
              <Link
                href="/dashboard/clientes"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                👥 Clientes
              </Link>
              <Link
                href="/dashboard/reservas"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                📅 Reservas
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-green-700">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-green-300 text-sm"
          >
            🚪 Cerrar sesión
          </Link>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>

    </div>
  );
}