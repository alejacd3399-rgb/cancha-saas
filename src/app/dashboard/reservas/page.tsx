import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReservasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const reservas = await prisma.reservations.findMany({
    where: {
      tenant_id: session.user.tenantId!,
      deleted_at: null,
    },
    include: {
      customer: true,
      field: true,
    },
    orderBy: [
      { reservation_date: "desc" },
      { start_time: "asc" },
    ],
    take: 50,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reservas</h2>
        <Link
          href="/dashboard/reservas/nueva"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nueva Reserva
        </Link>
      </div>

      {reservas.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-gray-500">No hay reservas registradas aún</p>
          <Link
            href="/dashboard/reservas/nueva"
            className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Crear primera reserva
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cancha</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fecha y Hora</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Pago</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservas.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{r.customer.full_name}</p>
                    <p className="text-sm text-gray-400">{r.customer.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.field.name}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800">
                      {new Date(r.reservation_date).toLocaleDateString("es-CO")}
                    </p>
                    <p className="text-sm text-gray-400">
                      {r.start_time} — {r.end_time}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${Number(r.total_amount).toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/reservas/${r.id}`}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}