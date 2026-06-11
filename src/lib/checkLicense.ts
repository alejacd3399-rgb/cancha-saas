import { prisma } from "@/lib/prisma";

// Verifica si un tenant tiene licencia activa
export async function checkLicense(tenantId: string): Promise<boolean> {
  if (!tenantId) return false;

  const licencia = await prisma.licenses.findFirst({
    where: {
      tenant_id: tenantId,
      status: "active",
      expires_at: {
        gte: new Date(), // que no haya vencido
      },
    },
  });

  return !!licencia;
}