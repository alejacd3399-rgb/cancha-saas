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
  const tenant = await prisma.tenants.findUnique({ where: { id } });

  if (!tenant) {
    return NextResponse.json({ message: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json(tenant);
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

  // Construir objeto solo con los campos enviados
  const data: Record<string, unknown> = {};
  if (body.business_name !== undefined) data.business_name = body.business_name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.email !== undefined) data.email = body.email || null;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.address !== undefined) data.address = body.address || null;
  if (body.is_active !== undefined) data.is_active = body.is_active;

  try {
    const actualizado = await prisma.tenants.update({
      where: { id },
      data,
    });

    return NextResponse.json(actualizado);

  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") {
      return NextResponse.json(
        { message: "El slug ya está en uso por otro tenant" },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Error al actualizar" },
      { status: 500 }
    );
  }
}