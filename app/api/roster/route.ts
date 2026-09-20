// app/api/roster/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export async function GET() {
  const roster = await prisma.rosterEntry.findMany();
  roster.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  return NextResponse.json(roster);
}
