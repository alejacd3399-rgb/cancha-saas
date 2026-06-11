import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import LicenseForm from "./LicenseForm";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Desempaquetamos params con await
  const { id } = await params;

  const tenant = await prisma.tenants.findUnique({
    where: { id },
    include: {
      licenses: {
        orderBy: { created_at: "desc" },
      },
      tenant_users: {
        where: { deleted_at: null },
      },
      _count: {
        select: { reservations: true, customers: true },
      },
    },
  });

  if (!tenant) notFound();

  const licenciaActiva = tenant.licenses.find((l) => l.status === "active");

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-sm text-gray-400 hover:underline">
            ← Volver al listado
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">
            {tenant.business_name}
          </h2>
          <p className="text-gray-500 text-sm">Slug: {tenant.slug}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          licenciaActiva
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {licenciaActiva ? "✅ Suscripción activa" : "❌ Sin suscripción activa"}
        </span>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {tenant._count.customers}
          </p>
          <p className="text-gray-500 text-sm mt-1">Clientes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {tenant._count.reservations}
          </p>
          <p className="text-gray-500 text-sm mt-1">Reservas</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {tenant.tenant_users.length}
          </p>
          <p className="text-gray-500 text-sm mt-1">Usuarios</p>
        </div>
      </div>

      {/* Usuarios del tenant */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Usuarios</h3>
        <div className="space-y-2">
          {tenant.tenant_users.map((user) => (
            <div key={user.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-800">{user.full_name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Licencias */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">
          Licencias / Suscripciones
        </h3>

        {/* Formulario para agregar nueva licencia */}
        <LicenseForm tenantId={tenant.id} />

        {/* Historial de licencias */}
        <div className="mt-6 space-y-2">
          {tenant.licenses.length === 0 && (
            <p className="text-gray-400 text-sm">Sin licencias registradas</p>
          )}
          {tenant.licenses.map((lic) => (
            <div key={lic.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-800">{lic.plan_name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(lic.starts_at).toLocaleDateString("es-CO")} →{" "}
                  {new Date(lic.expires_at).toLocaleDateString("es-CO")}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                lic.status === "active"
                  ? "bg-green-100 text-green-700"
                  : lic.status === "expired"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {lic.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}