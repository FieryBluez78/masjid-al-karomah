// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bookings = await prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const booking = await prisma.bookingRequest.create({
    data: {
      fullName: body.fullName,
      whatsapp: body.whatsapp,
      eventType: body.eventType,
      start: new Date(body.start),
      end: body.end ? new Date(body.end) : null,
      notes: body.notes || null,
      status: "Pending",
    },
  });
  return NextResponse.json(booking, { status: 201 });
}
