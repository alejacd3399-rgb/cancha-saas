import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { cancellation_reason } = body;

  if (!cancellation_reason) {
    return NextResponse.json(
      { message: "El motivo es requerido" },
      { status: 400 }
    );
  }

  // Verificar que la reserva pertenece al tenant
  const reserva = await prisma.reservations.findUnique({ where: { id } });
  if (!reserva || reserva.tenant_id !== session.user.tenantId) {
    return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  }

  try {
    const actualizada = await prisma.reservations.update({
      where: { id },
      data: {
        status: "cancelled",
        cancellation_reason,
      },
    });

    return NextResponse.json(actualizada);

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al cancelar" },
      { status: 500 }
    );
  }
}