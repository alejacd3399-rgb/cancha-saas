import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CanchasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const canchas = await prisma.fields.findMany({
    where: {
      tenant_id: session.user.tenantId!,
      deleted_at: null,
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Canchas</h2>
        <Link
          href="/dashboard/canchas/nueva"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nueva Cancha
        </Link>
      </div>

      {canchas.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-gray-500">No tienes canchas registradas aún</p>
          <Link
            href="/dashboard/canchas/nueva"
            className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Registrar primera cancha
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {canchas.map((cancha) => (
            <div key={cancha.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{cancha.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {cancha.field_type} — {cancha.surface}
                  </p>
                  <p className="text-green-600 font-semibold mt-2">
                    ${Number(cancha.price_per_hour).toLocaleString("es-CO")}/hora
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cancha.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {cancha.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/canchas/${cancha.id}`}
                  className="flex-1 text-center border border-green-600 text-green-600 py-1.5 rounded-lg text-sm hover:bg-green-50"
                >
                  Ver horarios
                </Link>
                <Link
                  href={`/dashboard/canchas/${cancha.id}/editar`}
                  className="flex-1 text-center bg-green-600 text-white py-1.5 rounded-lg text-sm hover:bg-green-700"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}