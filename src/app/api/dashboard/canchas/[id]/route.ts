import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const cancha = await prisma.fields.findUnique({ where: { id } });

  if (!cancha || cancha.tenant_id !== session.user.tenantId) {
    return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json(cancha);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const cancha = await prisma.fields.findUnique({ where: { id } });
  if (!cancha || cancha.tenant_id !== session.user.tenantId) {
    return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  }

  try {
    const actualizada = await prisma.fields.update({
      where: { id },
      data: {
        name: body.name,
        field_type: body.field_type,
        surface: body.surface,
        price_per_hour: parseFloat(body.price_per_hour),
        is_active: body.is_active,
      },
    });

    return NextResponse.json(actualizada);

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const cancha = await prisma.fields.findUnique({ where: { id } });
  if (!cancha || cancha.tenant_id !== session.user.tenantId) {
    return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  }

  try {
    await prisma.fields.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
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