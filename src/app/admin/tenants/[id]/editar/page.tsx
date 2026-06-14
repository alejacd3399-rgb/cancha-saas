"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarTenantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tenant, setTenant] = useState({
    business_name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/tenants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTenant({
          business_name: data.business_name || "",
          slug: data.slug || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          is_active: data.is_active,
        });
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tenant),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al guardar");
      setSaving(false);
      return;
    }

    router.push(`/admin/tenants/${id}`);
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Tenant</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del negocio
          </label>
          <input
            value={tenant.business_name}
            onChange={(e) => setTenant({ ...tenant, business_name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            value={tenant.slug}
            onChange={(e) => setTenant({ ...tenant, slug: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={tenant.email}
            onChange={(e) => setTenant({ ...tenant, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            value={tenant.phone}
            onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <input
            value={tenant.address}
            onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/admin/tenants/${id}`)}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}