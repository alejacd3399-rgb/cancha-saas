"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleTenantButton({
  tenantId,
  activo,
}: {
  tenantId: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);

    const res = await fetch(`/api/admin/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !activo }),
    });

    if (res.ok) {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
        activo
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
    >
      {loading ? "..." : activo ? "🚫 Desactivar" : "✅ Activar"}
    </button>
  );
}