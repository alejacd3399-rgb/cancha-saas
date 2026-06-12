import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
  const { reservation_date, start_time, end_time } = body;

  const reserva = await prisma.reservations.findUnique({ where: { id } });
  if (!reserva || reserva.tenant_id !== session.user.tenantId) {
    return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  }

  // Verificar doble booking (excluyendo esta misma reserva)
  const conflicto = await prisma.reservations.findFirst({
    where: {
      field_id: reserva.field_id,
      reservation_date: new Date(reservation_date + "T00:00:00.000Z"),
      start_time,
      end_time,
      deleted_at: null,
      status: { not: "cancelled" },
      id: { not: id },
    },
  });

  if (conflicto) {
    return NextResponse.json(
      { message: "Ya existe otra reserva en ese horario" },
      { status: 400 }
    );
  }

  // Recalcular duración y precio
  const [startH, startM] = start_time.split(":").map(Number);
  const [endH, endM] = end_time.split(":").map(Number);
  const duracionMinutos = (endH * 60 + endM) - (startH * 60 + startM);

  const cancha = await prisma.fields.findUnique({ where: { id: reserva.field_id } });
  const totalAmount = (duracionMinutos / 60) * Number(cancha!.price_per_hour);

  try {
    const actualizada = await prisma.reservations.update({
      where: { id },
      data: {
        reservation_date: new Date(reservation_date + "T00:00:00.000Z"),
        start_time,
        end_time,
        duration_minutes: duracionMinutos,
        total_amount: totalAmount,
      },
    });

    return NextResponse.json(actualizada);

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al actualizar" },
      { status: 500 }
    );
  }
}