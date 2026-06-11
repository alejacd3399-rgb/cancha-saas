import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { full_name, phone, email, notes } = body;

  if (!full_name || !phone) {
    return NextResponse.json(
      { message: "Nombre y teléfono son requeridos" },
      { status: 400 }
    );
  }

  try {
    const cliente = await prisma.customers.create({
      data: {
        tenant_id: session.user.tenantId!,
        full_name,
        phone,
        email: email || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(cliente, { status: 201 });

  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un cliente con ese teléfono" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}