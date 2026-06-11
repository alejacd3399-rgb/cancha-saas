import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  // Traemos todos los tenants de la base de datos
  const tenants = await prisma.tenants.findMany({
    where: { deleted_at: null },
    include: {
      licenses: {
        orderBy: { expires_at: "desc" },
        take: 1,
      },
      _count: {
        select: { tenant_users: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Tenants registrados
        </h2>
        <Link
          href="/admin/tenants/nuevo"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          + Nuevo Tenant
        </Link>
      </div>

      {/* Tabla de tenants */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Negocio</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Suscripción</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Usuarios</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.map((tenant) => {
              const licencia = tenant.licenses[0];
              const activa = licencia?.status === "active";

              return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{tenant.business_name}</p>
                    <p className="text-sm text-gray-400">{tenant.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tenant.email}</td>
                  <td className="px-6 py-4">
                    {licencia ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activa
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {activa ? "✅ Activa" : "❌ Vencida"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                        Sin licencia
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tenant._count.tenant_users}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tenants.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No hay tenants registrados aún
          </p>
        )}
      </div>
    </div>
  );
}