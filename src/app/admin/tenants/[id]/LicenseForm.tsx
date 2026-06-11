"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LicenseForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      tenant_id: tenantId,
      plan_name: (form.elements.namedItem("plan_name") as HTMLInputElement).value,
      price: (form.elements.namedItem("price") as HTMLInputElement).value,
      starts_at: (form.elements.namedItem("starts_at") as HTMLInputElement).value,
      expires_at: (form.elements.namedItem("expires_at") as HTMLInputElement).value,
      payment_reference: (form.elements.namedItem("payment_reference") as HTMLInputElement).value,
    };

    const res = await fetch("/api/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al crear la licencia");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <h4 className="font-medium text-gray-700">Registrar nueva licencia</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
          <input
            name="plan_name"
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Plan mensual"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
          <input
            name="price"
            type="number"
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="50000"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
          <input
            name="starts_at"
            type="date"
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha vencimiento</label>
          <input
            name="expires_at"
            type="date"
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Referencia de pago (opcional)
        </label>
        <input
          name="payment_reference"
          className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="Nequi #123456"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Registrar licencia"}
      </button>
    </form>
  );
}