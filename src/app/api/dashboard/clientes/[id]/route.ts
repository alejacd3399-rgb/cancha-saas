import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const cliente = await prisma.customers.findUnique({
    where: { id },
    include: { _count: { select: { reservations: true } } },
  });

  if (!cliente || cliente.tenant_id !== session.user.tenantId) {
    return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  }

  // No permitir eliminar si tiene reservas
  if (cliente._count.reservations > 0) {
    return NextResponse.json(
      { message: "No se puede eliminar: el cliente tiene reservas registradas" },
      { status: 400 }
    );
  }

  try {
    await prisma.customers.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al eliminar" },
      { status: 500 }
    );
  }
}