// types.ts — Masjid Al Karomah — shared domain types

export type TransactionType = "Pemasukan" | "Pengeluaran";
export type TransactionCategory = "Kas Masjid" | "Anak Yatim" | "Renovasi" | "Operasional";
export type TransactionStatus = "Lunas" | "Pending";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number; // IDR, integer
  date: string; // ISO date, e.g. "2026-09-02"
  status: TransactionStatus;
}

export type Asnaf =
  | "Fakir"
  | "Miskin"
  | "Amil"
  | "Mualaf"
  | "Riqab"
  | "Gharim"
  | "Fisabilillah"
  | "Ibnu Sabil";

export type ZakatStatus = "Selesai" | "Belum Disalurkan";

export interface ZakatRecipient {
  id: string;
  name: string;
  asnaf: Asnaf;
  quota: number; // IDR
  status: ZakatStatus;
  phone: string;
}

export type EventCategory =
  | "Kajian Pekanan"
  | "TPQ/Madrasah"
  | "Khutbah Jumat"
  | "Hari Besar Islam";

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  speaker: string;
  date: string; // ISO date
  time: string; // e.g. "05:00 - 06:00"
  description?: string;
}

export type BookingStatus = "Pending" | "Disetujui" | "Ditolak";

export interface BookingRequest {
  id: string;
  fullName: string;
  whatsapp: string;
  eventType: string;
  start: string; // ISO datetime-local, e.g. "2026-09-20T09:00"
  end?: string;
  notes?: string;
  status: BookingStatus;
}

export interface PrayerTime {
  name: "Subuh" | "Terbit" | "Dzuhur" | "Ashar" | "Maghrib" | "Isya";
  time: string; // "HH:mm", 24h WIB
}

export interface RosterEntry {
  day: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";
  imam: string;
  khatib: string;
  muadzin: string;
}

export interface DonationPayload {
  category: "Infaq Kas Utama" | "Sadaqah" | "Zakat Fitr" | "Zakat Maal";
  amount: number;
  donorName?: string;
  channel: "qris" | "va" | "ewallet";
}
