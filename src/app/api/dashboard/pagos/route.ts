import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { reserva_id, amount, payment_method, reference, notes } = body;

  if (!reserva_id || !amount) {
    return NextResponse.json(
      { message: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  try {
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

    // Obtener la reserva
    const reserva = await prisma.reservations.findUnique({
      where: { id: reserva_id },
    });

    if (!reserva || reserva.tenant_id !== session.user.tenantId) {
      return NextResponse.json(
        { message: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const montoAbono = parseFloat(amount);
    const nuevoPagado = Number(reserva.paid_amount) + montoAbono;
    const total = Number(reserva.total_amount);

    // Calcular nuevo estado del semáforo
    let nuevoEstado: "unpaid" | "partial" | "paid" = "unpaid";
    if (nuevoPagado >= total) {
      nuevoEstado = "paid";
    } else if (nuevoPagado > 0) {
      nuevoEstado = "partial";
    }

    // Todo en una transacción atómica
    await prisma.$transaction(async (tx) => {
      // 1. Crear el pago (INMUTABLE)
      await tx.payments.create({
        data: {
          tenant_id: session.user.tenantId!,
          reservation_id: reserva_id,
          received_by: usuarioActual.id,
          amount: montoAbono,
          payment_method: payment_method || "cash",
          reference: reference || null,
          notes: notes || null,
        },
      });

      // 2. Actualizar monto pagado y semáforo en la reserva
      await tx.reservations.update({
        where: { id: reserva_id },
        data: {
          paid_amount: nuevoPagado,
          payment_status: nuevoEstado,
        },
      });
    });

    return NextResponse.json({ success: true, payment_status: nuevoEstado });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}