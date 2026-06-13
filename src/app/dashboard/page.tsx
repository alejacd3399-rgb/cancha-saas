import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  
  if (session.user?.email === "admin@canchasaas.com") {
    redirect("/admin");
  }
  // Traemos estadísticas del tenant
  const tenantId = session.user?.tenantId;
  const [canchas, clientes, reservasHoy] = await Promise.all([
    prisma.fields.count({
      where: { tenant_id: tenantId!, deleted_at: null },
    }),
    prisma.customers.count({
      where: { tenant_id: tenantId!, deleted_at: null },
    }),
    prisma.reservations.count({
      where: {
        tenant_id: tenantId!,
        deleted_at: null,
        reservation_date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  // Últimas 5 reservas
  const ultimasReservas = await prisma.reservations.findMany({
    where: { tenant_id: tenantId!, deleted_at: null },
    include: { customer: true, field: true },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Bienvenido, {session.user?.name} 👋
      </h2>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Mis canchas</p>
          <p className="text-4xl font-bold text-green-600 mt-1">{canchas}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Clientes registrados</p>
          <p className="text-4xl font-bold text-green-600 mt-1">{clientes}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Reservas hoy</p>
          <p className="text-4xl font-bold text-green-600 mt-1">{reservasHoy}</p>
        </div>
      </div>

      {/* Últimas reservas */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">
          Últimas reservas
        </h3>
        {ultimasReservas.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay reservas aún</p>
        ) : (
          <div className="space-y-3">
            {ultimasReservas.map((r) => (
              <div key={r.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{r.customer.full_name}</p>
                  <p className="text-sm text-gray-400">
                    {r.field.name} — {r.start_time} a {r.end_time}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  r.payment_status === "paid"
                    ? "bg-green-100 text-green-700"
                    : r.payment_status === "partial"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {r.payment_status === "paid" ? "🟢 Pagado"
                    : r.payment_status === "partial" ? "🟠 Abono"
                    : "🔴 Pendiente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}