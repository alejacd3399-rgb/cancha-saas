import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import HorarioForm from "./HorarioForm";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function CanchaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const cancha = await prisma.fields.findUnique({
    where: { id },
    include: {
      field_schedules: {
        where: { is_active: true },
        orderBy: { day_of_week: "asc" },
      },
    },
  });

  if (!cancha || cancha.tenant_id !== session.user.tenantId) notFound();

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/canchas" className="text-sm text-gray-400 hover:underline">
            ← Volver a canchas
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{cancha.name}</h2>
          <p className="text-gray-500 text-sm">
            {cancha.field_type} — ${Number(cancha.price_per_hour).toLocaleString("es-CO")}/hora
          </p>
        </div>
        <Link
          href={`/dashboard/canchas/${cancha.id}/editar`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
        >
          Editar cancha
        </Link>
      </div>

      {/* Horarios actuales */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Horarios disponibles</h3>

        {cancha.field_schedules.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay horarios configurados aún</p>
        ) : (
          <div className="space-y-2">
            {cancha.field_schedules.map((h) => (
              <div key={h.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <span className="w-24 font-medium text-gray-700">
                    {DIAS[h.day_of_week]}
                  </span>
                  <span className="text-gray-600">
                    {h.open_time} — {h.close_time}
                  </span>
                  <span className="text-xs text-gray-400">
                    Franjas de {h.slot_duration_minutes} min
                  </span>
                </div>
                <DeleteHorarioButton horarioId={h.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario agregar horario */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Agregar horario</h3>
        <HorarioForm canchaId={cancha.id} />
      </div>

    </div>
  );
}

// Botón para eliminar horario (componente inline)
function DeleteHorarioButton({ horarioId }: { horarioId: string }) {
  return (
    <form action={`/api/dashboard/horarios/${horarioId}`} method="POST">
      <button
        type="submit"
        className="text-red-400 hover:text-red-600 text-sm"
      >
        Eliminar
      </button>
    </form>
  );
}