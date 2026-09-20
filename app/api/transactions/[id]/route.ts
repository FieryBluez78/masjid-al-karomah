// app/api/transactions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const data: Record<string, unknown> = { ...body };
  if (data.amount !== undefined) data.amount = Number(data.amount);
  if (data.date !== undefined) data.date = new Date(data.date as string);

  const transaction = await prisma.transaction.update({ where: { id: params.id }, data });
  return NextResponse.json(transaction);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
