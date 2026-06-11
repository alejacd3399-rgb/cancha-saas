import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, field_type, surface, price_per_hour } = body;

  if (!name || !field_type || !price_per_hour) {
    return NextResponse.json(
      { message: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    const cancha = await prisma.fields.create({
      data: {
        tenant_id: session.user.tenantId!,
        name,
        field_type,
        surface: surface || "synthetic",
        price_per_hour: parseFloat(price_per_hour),
      },
    });

    return NextResponse.json(cancha, { status: 201 });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}