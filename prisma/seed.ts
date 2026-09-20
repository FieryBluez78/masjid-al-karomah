// prisma/seed.ts — populates the database with starter data
// Run with: npx prisma db seed

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.createMany({
    data: [
      { type: "Pemasukan", category: "Kas Masjid", description: "Infaq Jumat Berkah", amount: 4250000, date: new Date("2026-08-28"), status: "Lunas" },
      { type: "Pemasukan", category: "Anak Yatim", description: "Donasi warga RT 05", amount: 1500000, date: new Date("2026-08-29"), status: "Lunas" },
      { type: "Pengeluaran", category: "Operasional", description: "Listrik & air bulan Agustus", amount: 875000, date: new Date("2026-08-30"), status: "Lunas" },
      { type: "Pemasukan", category: "Renovasi", description: "Donasi renovasi tempat wudhu", amount: 3000000, date: new Date("2026-08-31"), status: "Lunas" },
      { type: "Pengeluaran", category: "Anak Yatim", description: "Santunan yatim bulanan", amount: 2000000, date: new Date("2026-09-01"), status: "Lunas" },
      { type: "Pemasukan", category: "Kas Masjid", description: "Kotak infaq harian", amount: 620000, date: new Date("2026-09-02"), status: "Lunas" },
      { type: "Pengeluaran", category: "Operasional", description: "Kebersihan & perlengkapan", amount: 450000, date: new Date("2026-09-02"), status: "Pending" },
    ],
  });

  await prisma.zakatRecipient.createMany({
    data: [
      { name: "Ibu Sartika", asnaf: "Fakir", quota: 500000, status: "Selesai", phone: "0812-1111-2222" },
      { name: "Bpk. Wahyudi", asnaf: "Miskin", quota: 500000, status: "Selesai", phone: "0812-3333-4444" },
      { name: "Ust. Fauzan", asnaf: "Amil", quota: 750000, status: "Belum Disalurkan", phone: "0812-5555-6666" },
      { name: "Bpk. Chandra", asnaf: "Mualaf", quota: 500000, status: "Belum Disalurkan", phone: "0812-7777-8888" },
      { name: "Ibu Ningsih", asnaf: "Gharim", quota: 600000, status: "Selesai", phone: "0812-9999-0000" },
      { name: "Bpk. Slamet", asnaf: "Fisabilillah", quota: 700000, status: "Belum Disalurkan", phone: "0813-1212-3434" },
      { name: "Dek Rangga", asnaf: "Ibnu Sabil", quota: 400000, status: "Belum Disalurkan", phone: "0813-5656-7878" },
    ],
  });

  await prisma.bookingRequest.createMany({
    data: [
      { fullName: "Andi Prasetyo", whatsapp: "0812-4444-5555", eventType: "Akad Nikah", start: new Date("2026-09-20T09:00"), end: new Date("2026-09-20T12:00"), notes: "Membutuhkan area untuk 100 tamu", status: "Pending" },
      { fullName: "Ibu Yuli (RT 07)", whatsapp: "0812-6666-7777", eventType: "Pengajian RT", start: new Date("2026-09-15T19:00"), end: new Date("2026-09-15T21:00"), notes: "Rutin bulanan RT 07", status: "Disetujui" },
    ],
  });

  await prisma.rosterEntry.createMany({
    data: [
      { day: "Senin", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Yusuf" },
      { day: "Selasa", imam: "Ust. Zainal Arifin", khatib: "-", muadzin: "Bpk. Sofyan" },
      { day: "Rabu", imam: "Ust. Miftahul Huda", khatib: "-", muadzin: "Bpk. Yusuf" },
      { day: "Kamis", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Rudi" },
      { day: "Jumat", imam: "Ust. Zainal Arifin", khatib: "Ust. Zainal Arifin", muadzin: "Bpk. Sofyan" },
      { day: "Sabtu", imam: "Ust. Miftahul Huda", khatib: "-", muadzin: "Bpk. Rudi" },
      { day: "Minggu", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Yusuf" },
    ],
  });

  console.log("Seed selesai ✅");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
