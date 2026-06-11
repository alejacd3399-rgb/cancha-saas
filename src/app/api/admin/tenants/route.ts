import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  // Verificar que hay sesión activa
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { business_name, slug, email, phone, owner_email, owner_name, owner_password } = body;

  // Validar campos requeridos
  if (!business_name || !slug || !owner_email || !owner_name || !owner_password) {
    return NextResponse.json(
      { message: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    // Todo en una sola transacción — si algo falla, nada se guarda
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el tenant
      const tenant = await tx.tenants.create({
        data: { business_name, slug, email, phone },
      });

      // 2. Crear el usuario dueño
      const passwordHash = await bcrypt.hash(owner_password, 10);
      const user = await tx.tenant_users.create({
        data: {
          tenant_id: tenant.id,
          email: owner_email,
          full_name: owner_name,
          password_hash: passwordHash,
          role: "owner",
        },
      });

      return { tenant, user };
    });

    return NextResponse.json(result, { status: 201 });

 } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { message: "El slug o email ya existe" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}