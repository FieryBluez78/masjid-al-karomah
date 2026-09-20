// app/api/zakat/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recipients = await prisma.zakatRecipient.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(recipients);
}

export async function POST(request: Request) {
  const body = await request.json();
  const recipient = await prisma.zakatRecipient.create({
    data: {
      name: body.name,
      asnaf: body.asnaf,
      quota: Number(body.quota),
      status: body.status ?? "Belum Disalurkan",
      phone: body.phone,
    },
  });
  return NextResponse.json(recipient, { status: 201 });
}
