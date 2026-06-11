import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { field_id, day_of_week, open_time, close_time, slot_duration_minutes } = body;

  if (!field_id || day_of_week === undefined || !open_time || !close_time) {
    return NextResponse.json(
      { message: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    const horario = await prisma.field_schedules.create({
      data: {
        field_id,
        tenant_id: session.user.tenantId!,
        day_of_week,
        open_time,
        close_time,
        slot_duration_minutes: slot_duration_minutes || 60,
      },
    });

    return NextResponse.json(horario, { status: 201 });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}