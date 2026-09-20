// app/api/roster/[day]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { day: string } }) {
  const body = await request.json();
  const entry = await prisma.rosterEntry.update({
    where: { day: params.day },
    data: {
      imam: body.imam,
      khatib: body.khatib,
      muadzin: body.muadzin,
    },
  });
  return NextResponse.json(entry);
}
