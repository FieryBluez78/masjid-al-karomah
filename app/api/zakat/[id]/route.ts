// app/api/zakat/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const data: Record<string, unknown> = { ...body };
  if (data.quota !== undefined) data.quota = Number(data.quota);

  const recipient = await prisma.zakatRecipient.update({ where: { id: params.id }, data });
  return NextResponse.json(recipient);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.zakatRecipient.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
