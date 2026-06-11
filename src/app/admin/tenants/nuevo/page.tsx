"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      business_name: (form.elements.namedItem("business_name") as HTMLInputElement).value,
      slug: (form.elements.namedItem("slug") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      owner_email: (form.elements.namedItem("owner_email") as HTMLInputElement).value,
      owner_name: (form.elements.namedItem("owner_name") as HTMLInputElement).value,
      owner_password: (form.elements.namedItem("owner_password") as HTMLInputElement).value,
    };

    const res = await fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al crear el tenant");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Registrar nuevo tenant
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        
        {/* Datos del negocio */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">
            Datos del negocio
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                name="business_name"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Canchas La Victoria"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (identificador único)
              </label>
              <input
                name="slug"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="la-victoria"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Solo letras minúsculas y guiones. Ej: canchas-bogota
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email del negocio
              </label>
              <input
                name="email"
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="contacto@negocio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                name="phone"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="3001234567"
              />
            </div>
          </div>
        </div>

        {/* Datos del dueño */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">
            Datos del dueño de cancha
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                name="owner_name"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Juan Perez"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de acceso
              </label>
              <input
                name="owner_email"
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="juan@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña inicial
              </label>
              <input
                name="owner_password"
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear tenant"}
          </button>
        </div>
      </form>
    </div>
  );
}