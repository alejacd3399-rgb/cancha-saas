import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { customer_id, field_id, reservation_date, start_time, end_time, notes } = body;

  if (!customer_id || !field_id || !reservation_date || !start_time || !end_time) {
    return NextResponse.json(
      { message: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
    // Verificar doble booking
    const reservaExistente = await prisma.reservations.findFirst({
      where: {
        field_id,
        reservation_date: new Date(reservation_date),
        start_time,
        end_time,
        deleted_at: null,
        status: { not: "cancelled" },
      },
    });

    if (reservaExistente) {
      return NextResponse.json(
        { message: "Ya existe una reserva en ese horario" },
        { status: 400 }
      );
    }

    // Obtener precio de la cancha
    const cancha = await prisma.fields.findUnique({
      where: { id: field_id },
    });

    if (!cancha) {
      return NextResponse.json(
        { message: "Cancha no encontrada" },
        { status: 404 }
      );
    }

    // Calcular duración y precio
    const [startH, startM] = start_time.split(":").map(Number);
    const [endH, endM] = end_time.split(":").map(Number);
    const duracionMinutos = (endH * 60 + endM) - (startH * 60 + startM);
    const totalAmount = (duracionMinutos / 60) * Number(cancha.price_per_hour);

    // Obtener usuario actual
    const usuarioActual = await prisma.tenant_users.findUnique({
      where: { email: session.user.email! },
    });

    if (!usuarioActual) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear la reserva
    const reserva = await prisma.reservations.create({
      data: {
        tenant_id: session.user.tenantId!,
        field_id,
        customer_id,
        created_by: usuarioActual.id,
        reservation_date: new Date(reservation_date),
        start_time,
        end_time,
        duration_minutes: duracionMinutos,
        total_amount: totalAmount,
        notes: notes || null,
      },
    });

    // Actualizar contador de reservas del cliente
    await prisma.customers.update({
      where: { id: customer_id },
      data: { reservations_count: { increment: 1 } },
    });

    return NextResponse.json(reserva, { status: 201 });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}