import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { tenant_id, plan_name, price, starts_at, expires_at, payment_reference } = body;

  if (!tenant_id || !plan_name || !price || !starts_at || !expires_at) {
    return NextResponse.json(
      { message: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    // Desactivar licencias anteriores del tenant
    await prisma.licenses.updateMany({
      where: { tenant_id, status: "active" },
      data: { status: "expired" },
    });

    // Crear la nueva licencia activa
    const license = await prisma.licenses.create({
      data: {
        tenant_id,
        plan_name,
        price: parseFloat(price),
        starts_at: new Date(starts_at),
        expires_at: new Date(expires_at),
        status: "active",
        payment_reference: payment_reference || null,
      },
    });

    return NextResponse.json(license, { status: 201 });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}