import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const cliente = await prisma.customers.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { deleted_at: null },
        orderBy: { reservation_date: "desc" },
        include: { field: true },
        take: 10,
      },
    },
  });

  if (!cliente || cliente.tenant_id !== session.user.tenantId) notFound();

  // Configuración de fidelización
  const loyaltyConfig = await prisma.loyalty_configs.findUnique({
    where: { tenant_id: session.user.tenantId! },
  });

  const reservasPorPremio = loyaltyConfig?.reservations_for_reward ?? 5;
  const progreso = cliente.reservations_count % reservasPorPremio;
  const reservasGratis = Math.floor(cliente.reservations_count / reservasPorPremio);

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Encabezado */}
      <div>
        <Link href="/dashboard/clientes" className="text-sm text-gray-400 hover:underline">
          ← Volver a clientes
        </Link>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">{cliente.full_name}</h2>
        <p className="text-gray-500">{cliente.phone}</p>
      </div>

      {/* Tarjeta de fidelización */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-3">🎁 Programa de Fidelización</h3>
        <div className="flex items-center gap-3 mb-3">
          {Array.from({ length: reservasPorPremio }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                i < progreso
                  ? "bg-white text-green-700"
                  : "bg-green-500 text-green-300"
              }`}
            >
              {i < progreso ? "✓" : i + 1}
            </div>
          ))}
        </div>
        <p className="text-green-100 text-sm">
          {progreso}/{reservasPorPremio} reservas para la próxima gratis
        </p>
        {reservasGratis > 0 && (
          <div className="mt-3 bg-yellow-400 text-yellow-900 rounded-lg px-3 py-2 text-sm font-medium">
            🏆 ¡Tiene {reservasGratis} reserva{reservasGratis > 1 ? "s" : ""} gratis disponible{reservasGratis > 1 ? "s" : ""}!
          </div>
        )}
      </div>

      {/* Info del cliente */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Información</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Teléfono</p>
            <p className="font-medium text-gray-800">{cliente.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="font-medium text-gray-800">{cliente.email || "No registrado"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total reservas</p>
            <p className="font-medium text-gray-800">{cliente.reservations_count}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Cliente desde</p>
            <p className="font-medium text-gray-800">
              {new Date(cliente.created_at).toLocaleDateString("es-CO")}
            </p>
          </div>
        </div>
        {cliente.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">Notas</p>
            <p className="text-gray-700 text-sm">{cliente.notes}</p>
          </div>
        )}
      </div>

      {/* Historial de reservas */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">
          Últimas reservas
        </h3>
        {cliente.reservations.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin reservas aún</p>
        ) : (
          <div className="space-y-2">
            {cliente.reservations.map((r) => (
              <div key={r.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{r.field.name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(r.reservation_date).toLocaleDateString("es-CO")} —{" "}
                    {r.start_time} a {r.end_time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(r as { es_gratis: boolean } & typeof r).es_gratis && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      🎁 Gratis
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : r.payment_status === "partial"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {r.payment_status === "paid" ? "🟢"
                      : r.payment_status === "partial" ? "🟠"
                      : "🔴"}
                  </span>
                  <Link
                    href={`/dashboard/reservas/${r.id}`}
                    className="text-green-600 hover:underline text-xs"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}