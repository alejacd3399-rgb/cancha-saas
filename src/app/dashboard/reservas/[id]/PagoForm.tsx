"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PagoForm({
  reservaId,
  saldoPendiente,
}: {
  reservaId: string;
  saldoPendiente: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      reserva_id: reservaId,
      amount: (form.elements.namedItem("amount") as HTMLInputElement).value,
      payment_method: (form.elements.namedItem("payment_method") as HTMLSelectElement).value,
      reference: (form.elements.namedItem("reference") as HTMLInputElement).value,
      notes: (form.elements.namedItem("notes") as HTMLInputElement).value,
    };

    const res = await fetch("/api/dashboard/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al registrar pago");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto a pagar
          </label>
          <input
            name="amount"
            type="number"
            defaultValue={saldoPendiente}
            max={saldoPendiente}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Saldo: ${saldoPendiente.toLocaleString("es-CO")}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de pago
          </label>
          <select
            name="payment_method"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="nequi">Nequi</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Referencia (opcional)
        </label>
        <input
          name="reference"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="Número de transacción Nequi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <input
          name="notes"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          placeholder="Observaciones..."
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Registrar pago"}
      </button>
    </form>
  );
}