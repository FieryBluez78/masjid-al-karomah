// app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const booking = await prisma.bookingRequest.update({
    where: { id: params.id },
    data: { status: body.status },
  });
  return NextResponse.json(booking);
}
