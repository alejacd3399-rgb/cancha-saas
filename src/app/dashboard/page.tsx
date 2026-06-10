import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Si no hay sesión, redirige al login
  if (!session) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">
        🏟️ Panel de Gestión
      </h1>
      <p className="mt-2 text-gray-600">
        Bienvenido, <strong>{session.user?.name}</strong>
      </p>
      <p className="text-gray-500 text-sm">
        Rol: {session.user?.role}
      </p>
    </div>
  );
}