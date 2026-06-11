import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PagoForm from "./PagoForm";

export default async function ReservaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const reserva = await prisma.reservations.findUnique({
    where: { id },
    include: {
      customer: true,
      field: true,
      payments: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!reserva || reserva.tenant_id !== session.user.tenantId) notFound();

  const saldoPendiente = Number(reserva.total_amount) - Number(reserva.paid_amount);

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Encabezado */}
      <div>
        <Link href="/dashboard/reservas" className="text-sm text-gray-400 hover:underline">
          ← Volver a reservas
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Reserva — {reserva.customer.full_name}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            reserva.payment_status === "paid"
              ? "bg-green-100 text-green-700"
              : reserva.payment_status === "partial"
              ? "bg-orange-100 text-orange-700"
              : "bg-red-100 text-red-700"
          }`}>
            {reserva.payment_status === "paid" ? "🟢 Pagado"
              : reserva.payment_status === "partial" ? "🟠 Abono parcial"
              : "🔴 Pendiente"}
          </span>
        </div>
      </div>

      {/* Información de la reserva */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Detalle</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Cliente</p>
            <p className="font-medium text-gray-800">{reserva.customer.full_name}</p>
            <p className="text-sm text-gray-500">{reserva.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Cancha</p>
            <p className="font-medium text-gray-800">{reserva.field.name}</p>
            <p className="text-sm text-gray-500">{reserva.field.field_type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fecha</p>
            <p className="font-medium text-gray-800">
              {new Date(reserva.reservation_date).toLocaleDateString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Horario</p>
            <p className="font-medium text-gray-800">
              {reserva.start_time} — {reserva.end_time}
            </p>
            <p className="text-sm text-gray-500">{reserva.duration_minutes} minutos</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-medium text-gray-800">
              ${Number(reserva.total_amount).toLocaleString("es-CO")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Pagado</p>
            <p className="font-medium text-green-600">
              ${Number(reserva.paid_amount).toLocaleString("es-CO")}
            </p>
          </div>
        </div>

        {/* Barra de progreso de pago */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso de pago</span>
            <span>Saldo: ${saldoPendiente.toLocaleString("es-CO")}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (Number(reserva.paid_amount) / Number(reserva.total_amount)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {reserva.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">Notas</p>
            <p className="text-gray-700 text-sm">{reserva.notes}</p>
          </div>
        )}
      </div>

      {/* Historial de pagos */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Historial de pagos</h3>
        {reserva.payments.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin pagos registrados</p>
        ) : (
          <div className="space-y-2">
            {reserva.payments.map((pago) => (
              <div key={pago.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">
                    ${Number(pago.amount).toLocaleString("es-CO")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(pago.created_at).toLocaleDateString("es-CO")} —{" "}
                    {pago.payment_method}
                  </p>
                </div>
                {pago.reference && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {pago.reference}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario de pago — solo si no está pagado */}
      {reserva.payment_status !== "paid" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Registrar pago
          </h3>
          <PagoForm
            reservaId={reserva.id}
            saldoPendiente={saldoPendiente}
          />
        </div>
      )}

    </div>
  );
}