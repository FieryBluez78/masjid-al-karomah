// useMasjidStore.tsx — Masjid Al Karomah — central state/context
// Used only by the Takmir (admin) app. The public Jama'ah Portal is
// stateless/local and needs no shared store or authentication.
// Drop into the Takmir Next.js project as e.g. `app/store/useMasjidStore.tsx`.
// Wrap the Takmir root layout in <MasjidProvider> and consume via `useMasjid()`.
"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
  Transaction,
  ZakatRecipient,
  EventItem,
  BookingRequest,
  RosterEntry,
} from "./types";

/* ------------------------------ mock data ------------------------------- */

const initialTransactions: Transaction[] = [
  { id: "TX-001", type: "Pemasukan", category: "Kas Masjid", description: "Infaq Jumat Berkah", amount: 4250000, date: "2026-08-28", status: "Lunas" },
  { id: "TX-002", type: "Pemasukan", category: "Anak Yatim", description: "Donasi warga RT 05", amount: 1500000, date: "2026-08-29", status: "Lunas" },
  { id: "TX-003", type: "Pengeluaran", category: "Operasional", description: "Listrik & air bulan Agustus", amount: 875000, date: "2026-08-30", status: "Lunas" },
  { id: "TX-004", type: "Pemasukan", category: "Renovasi", description: "Donasi renovasi tempat wudhu", amount: 3000000, date: "2026-08-31", status: "Lunas" },
  { id: "TX-005", type: "Pengeluaran", category: "Anak Yatim", description: "Santunan yatim bulanan", amount: 2000000, date: "2026-09-01", status: "Lunas" },
];

const initialZakat: ZakatRecipient[] = [
  { id: "MZ-01", name: "Ibu Sartika", asnaf: "Fakir", quota: 500000, status: "Selesai", phone: "0812-1111-2222" },
  { id: "MZ-02", name: "Bpk. Wahyudi", asnaf: "Miskin", quota: 500000, status: "Selesai", phone: "0812-3333-4444" },
  { id: "MZ-03", name: "Ust. Fauzan", asnaf: "Amil", quota: 750000, status: "Belum Disalurkan", phone: "0812-5555-6666" },
];

const initialEvents: EventItem[] = [
  { id: "EV-01", title: "Tafsir Al-Qur'an Ba'da Subuh", category: "Kajian Pekanan", speaker: "Ust. Abdurrahman Hakim", date: "2026-09-06", time: "05:00 - 06:00" },
  { id: "EV-02", title: "TPQ Iqro & Tahsin Anak", category: "TPQ/Madrasah", speaker: "Ustadzah Halimah", date: "2026-09-05", time: "16:00 - 17:30" },
];

const initialBookings: BookingRequest[] = [
  { id: "BK-01", fullName: "Andi Prasetyo", whatsapp: "0812-4444-5555", eventType: "Akad Nikah", start: "2026-09-20T09:00", end: "2026-09-20T12:00", notes: "Membutuhkan area untuk 100 tamu", status: "Pending" },
];

const initialRoster: RosterEntry[] = [
  { day: "Senin", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Yusuf" },
  { day: "Jumat", imam: "Ust. Zainal Arifin", khatib: "Ust. Zainal Arifin", muadzin: "Bpk. Sofyan" },
];

/* -------------------------------- context -------------------------------- */

interface MasjidContextValue {
  transactions: Transaction[];
  zakatRecipients: ZakatRecipient[];
  events: EventItem[];
  bookingRequests: BookingRequest[];
  roster: RosterEntry[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  addBooking: (b: Omit<BookingRequest, "id" | "status">) => void;
  setBookingStatus: (id: string, status: BookingRequest["status"]) => void;
  setZakatStatus: (id: string, status: ZakatRecipient["status"]) => void;
  updateZakatRecipient: (id: string, patch: Partial<Omit<ZakatRecipient, "id">>) => void;
  deleteZakatRecipient: (id: string) => void;
  updateRosterDay: (day: RosterEntry["day"], patch: Partial<Omit<RosterEntry, "day">>) => void;
  kpis: {
    monthPemasukan: number;
    totalZakat: number;
    mustahiqCount: number;
    pendingBookings: number;
    totalPemasukan: number;
    totalPengeluaran: number;
    balance: number;
  };
}

const MasjidContext = createContext<MasjidContextValue | null>(null);

export function MasjidProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [zakatRecipients, setZakatRecipients] = useState<ZakatRecipient[]>(initialZakat);
  const [events] = useState<EventItem[]>(initialEvents);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialBookings);
  const [roster, setRoster] = useState<RosterEntry[]>(initialRoster);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      { id: `TX-${(prev.length + 1).toString().padStart(3, "0")}`, ...tx },
      ...prev,
    ]);
  }, []);

  const addBooking = useCallback((b: Omit<BookingRequest, "id" | "status">) => {
    setBookingRequests((prev) => [
      { id: `BK-${(prev.length + 1).toString().padStart(2, "0")}`, status: "Pending", ...b },
      ...prev,
    ]);
  }, []);

  const setBookingStatus = useCallback((id: string, status: BookingRequest["status"]) => {
    setBookingRequests((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const setZakatStatus = useCallback((id: string, status: ZakatRecipient["status"]) => {
    setZakatRecipients((prev) => prev.map((z) => (z.id === id ? { ...z, status } : z)));
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Omit<Transaction, "id">>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateZakatRecipient = useCallback((id: string, patch: Partial<Omit<ZakatRecipient, "id">>) => {
    setZakatRecipients((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  }, []);

  const deleteZakatRecipient = useCallback((id: string) => {
    setZakatRecipients((prev) => prev.filter((z) => z.id !== id));
  }, []);

  const updateRosterDay = useCallback((day: RosterEntry["day"], patch: Partial<Omit<RosterEntry, "day">>) => {
    setRoster((prev) => prev.map((r) => (r.day === day ? { ...r, ...patch } : r)));
  }, []);

  const kpis = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthPemasukan = transactions
      .filter((t) => t.type === "Pemasukan" && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + t.amount, 0);
    const totalZakat = zakatRecipients.reduce((s, z) => s + z.quota, 0);
    const totalPemasukan = transactions.filter((t) => t.type === "Pemasukan").reduce((s, t) => s + t.amount, 0);
    const totalPengeluaran = transactions.filter((t) => t.type === "Pengeluaran").reduce((s, t) => s + t.amount, 0);
    return {
      monthPemasukan,
      totalZakat,
      mustahiqCount: zakatRecipients.length,
      pendingBookings: bookingRequests.filter((b) => b.status === "Pending").length,
      totalPemasukan,
      totalPengeluaran,
      balance: totalPemasukan - totalPengeluaran,
    };
  }, [transactions, zakatRecipients, bookingRequests]);

  const value: MasjidContextValue = {
    transactions,
    zakatRecipients,
    events,
    bookingRequests,
    roster,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBooking,
    setBookingStatus,
    setZakatStatus,
    updateZakatRecipient,
    deleteZakatRecipient,
    updateRosterDay,
    kpis,
  };

  return <MasjidContext.Provider value={value}>{children}</MasjidContext.Provider>;
}

export function useMasjid() {
  const ctx = useContext(MasjidContext);
  if (!ctx) throw new Error("useMasjid must be used within a <MasjidProvider>");
  return ctx;
}

/* --------------------------- currency helper ----------------------------- */

export function formatIDR(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}
