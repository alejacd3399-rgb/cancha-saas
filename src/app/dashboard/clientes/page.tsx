import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import EliminarClienteButton from "./EliminarClienteButton";

export default async function ClientesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const clientes = await prisma.customers.findMany({
    where: {
      tenant_id: session.user.tenantId!,
      deleted_at: null,
    },
    include: {
      _count: { select: { reservations: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <Link
          href="/dashboard/clientes/nuevo"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-gray-500">No hay clientes registrados aún</p>
          <Link
            href="/dashboard/clientes/nuevo"
            className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Registrar primer cliente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cliente</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Teléfono</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Reservas</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fidelización</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{cliente.full_name}</p>
                    <p className="text-sm text-gray-400">{cliente.email || "Sin email"}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{cliente.phone}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {cliente._count.reservations}
                  </td>
                  <td className="px-6 py-4">
                    {/* Progreso fidelización */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <div
                            key={n}
                            className={`w-3 h-3 rounded-full ${
                              n <= (cliente.reservations_count % 5)
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {cliente.reservations_count % 5}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/clientes/${cliente.id}`}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Ver detalle →
                      </Link>
                      <EliminarClienteButton
                        clienteId={cliente.id}
                        tieneReservas={cliente._count.reservations > 0}
                      />
                    </div>
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