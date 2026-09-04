"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wallet, Users, ClipboardList, Plus, Search, CheckCircle2, LayoutGrid,
  HandCoins, BookOpenText, Building2, TrendingUp, TrendingDown, BadgeCheck,
  CalendarClock, Pencil, Trash2, Save, Lock, Unlock, ShieldCheck, Mail,
  KeyRound, LogOut, AlertCircle, X,
} from "lucide-react";

/* ============================================================================
   MASJID AL KAROMAH — DASHBOARD TAKMIR (Admin Portal)

   Standalone, restricted-access file. Every route in this file sits behind a
   login gate: only accounts on the official Takmir email domain
   (@takmir.masjidalkaromah.id) may sign in. The public-facing, no-login
   Jama'ah Portal lives in the separate `jamaah-portal.jsx` file.
   ============================================================================ */

const MOSQUE_NAME = "Masjid Al Karomah";
const ADMIN_EMAIL_DOMAIN = "@takmir.masjidalkaromah.id";

// Mock Takmir directory — in production this validation happens server-side
// (e.g. NextAuth + a Credentials/SSO provider restricted to this domain).
const TAKMIR_ACCOUNTS = [
  { email: `ketua${ADMIN_EMAIL_DOMAIN}`, password: "takmir2026", name: "Ust. Zainal Arifin", role: "Ketua Takmir" },
  { email: `bendahara${ADMIN_EMAIL_DOMAIN}`, password: "kasmasjid1", name: "Bpk. Slamet Riyadi", role: "Bendahara" },
  { email: `amilzakat${ADMIN_EMAIL_DOMAIN}`, password: "zakat12345", name: "Ust. Fauzan", role: "Amil Zakat" },
];

/* ---------------------------------- utils --------------------------------- */

function formatIDR(amount) {
  const n = Math.round(Number(amount) || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

/* ------------------------------- mock data -------------------------------- */

const initialTransactions = [
  { id: "TX-001", type: "Pemasukan", category: "Kas Masjid", description: "Infaq Jumat Berkah", amount: 4250000, date: "2026-08-28", status: "Lunas" },
  { id: "TX-002", type: "Pemasukan", category: "Anak Yatim", description: "Donasi warga RT 05", amount: 1500000, date: "2026-08-29", status: "Lunas" },
  { id: "TX-003", type: "Pengeluaran", category: "Operasional", description: "Listrik & air bulan Agustus", amount: 875000, date: "2026-08-30", status: "Lunas" },
  { id: "TX-004", type: "Pemasukan", category: "Renovasi", description: "Donasi renovasi tempat wudhu", amount: 3000000, date: "2026-08-31", status: "Lunas" },
  { id: "TX-005", type: "Pengeluaran", category: "Anak Yatim", description: "Santunan yatim bulanan", amount: 2000000, date: "2026-09-01", status: "Lunas" },
  { id: "TX-006", type: "Pemasukan", category: "Kas Masjid", description: "Kotak infaq harian", amount: 620000, date: "2026-09-02", status: "Lunas" },
  { id: "TX-007", type: "Pengeluaran", category: "Operasional", description: "Kebersihan & perlengkapan", amount: 450000, date: "2026-09-02", status: "Pending" },
];

const initialZakat = [
  { id: "MZ-01", name: "Ibu Sartika", asnaf: "Fakir", quota: 500000, status: "Selesai", phone: "0812-1111-2222" },
  { id: "MZ-02", name: "Bpk. Wahyudi", asnaf: "Miskin", quota: 500000, status: "Selesai", phone: "0812-3333-4444" },
  { id: "MZ-03", name: "Ust. Fauzan", asnaf: "Amil", quota: 750000, status: "Belum Disalurkan", phone: "0812-5555-6666" },
  { id: "MZ-04", name: "Bpk. Chandra", asnaf: "Mualaf", quota: 500000, status: "Belum Disalurkan", phone: "0812-7777-8888" },
  { id: "MZ-05", name: "Ibu Ningsih", asnaf: "Gharim", quota: 600000, status: "Selesai", phone: "0812-9999-0000" },
  { id: "MZ-06", name: "Bpk. Slamet", asnaf: "Fisabilillah", quota: 700000, status: "Belum Disalurkan", phone: "0813-1212-3434" },
  { id: "MZ-07", name: "Dek Rangga", asnaf: "Ibnu Sabil", quota: 400000, status: "Belum Disalurkan", phone: "0813-5656-7878" },
];

const initialBookings = [
  { id: "BK-01", fullName: "Andi Prasetyo", whatsapp: "0812-4444-5555", eventType: "Akad Nikah", start: "2026-09-20T09:00", end: "2026-09-20T12:00", notes: "Membutuhkan area untuk 100 tamu", status: "Pending" },
  { id: "BK-02", fullName: "Ibu Yuli (RT 07)", whatsapp: "0812-6666-7777", eventType: "Pengajian RT", start: "2026-09-15T19:00", end: "2026-09-15T21:00", notes: "Rutin bulanan RT 07", status: "Disetujui" },
];

const initialRoster = [
  { day: "Senin", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Yusuf" },
  { day: "Selasa", imam: "Ust. Zainal Arifin", khatib: "-", muadzin: "Bpk. Sofyan" },
  { day: "Rabu", imam: "Ust. Miftahul Huda", khatib: "-", muadzin: "Bpk. Yusuf" },
  { day: "Kamis", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Rudi" },
  { day: "Jumat", imam: "Ust. Zainal Arifin", khatib: "Ust. Zainal Arifin", muadzin: "Bpk. Sofyan" },
  { day: "Sabtu", imam: "Ust. Miftahul Huda", khatib: "-", muadzin: "Bpk. Rudi" },
  { day: "Minggu", imam: "Ust. Abdurrahman Hakim", khatib: "-", muadzin: "Bpk. Yusuf" },
];

const ASNAF_LIST = ["Fakir", "Miskin", "Amil", "Mualaf", "Riqab", "Gharim", "Fisabilillah", "Ibnu Sabil"];

/* ----------------------------- shared bits -------------------------------- */

function Badge({ children, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gold: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone = "emerald" }) {
  const toneMap = {
    emerald: "bg-emerald-600",
    gold: "bg-amber-600",
    slate: "bg-slate-800",
    rose: "bg-rose-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className={`max-h-[92vh] w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}

/* ============================================================================
   ROOT APP — login gate wraps the entire admin dashboard
   ============================================================================ */

export default function TakmirDashboardApp() {
  const [session, setSession] = useState(null); // { name, email, role } | null
  const [toast, setToast] = useState({ show: false, message: "" });
  const [editMode, setEditMode] = useState(false);

  const [transactions, setTransactions] = useState(initialTransactions);
  const [zakatRecipients, setZakatRecipients] = useState(initialZakat);
  const [bookingRequests, setBookingRequests] = useState(initialBookings);
  const [roster, setRoster] = useState(initialRoster);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2600);
  }, []);

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => [{ id: `TX-${(prev.length + 1).toString().padStart(3, "0")}`, ...tx }, ...prev]);
  }, []);
  const updateTransaction = useCallback((id, patch) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);
  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setZakatStatus = useCallback((id) => {
    setZakatRecipients((prev) => prev.map((z) => (z.id === id ? { ...z, status: "Selesai" } : z)));
  }, []);
  const updateZakatRecipient = useCallback((id, patch) => {
    setZakatRecipients((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  }, []);
  const deleteZakatRecipient = useCallback((id) => {
    setZakatRecipients((prev) => prev.filter((z) => z.id !== id));
  }, []);

  const setBookingStatus = useCallback((id, status) => {
    setBookingRequests((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const updateRosterDay = useCallback((day, patch) => {
    setRoster((prev) => prev.map((r) => (r.day === day ? { ...r, ...patch } : r)));
  }, []);

  const kpis = useMemo(() => {
    const monthPemasukan = transactions
      .filter((t) => t.type === "Pemasukan" && t.date.startsWith("2026-09"))
      .reduce((s, t) => s + t.amount, 0);
    const totalZakat = zakatRecipients.reduce((s, z) => s + z.quota, 0);
    const mustahiqCount = zakatRecipients.length;
    const pendingBookings = bookingRequests.filter((b) => b.status === "Pending").length;
    const totalPemasukan = transactions.filter((t) => t.type === "Pemasukan").reduce((s, t) => s + t.amount, 0);
    const totalPengeluaran = transactions.filter((t) => t.type === "Pengeluaran").reduce((s, t) => s + t.amount, 0);
    return { monthPemasukan, totalZakat, mustahiqCount, pendingBookings, totalPemasukan, totalPengeluaran, balance: totalPemasukan - totalPengeluaran };
  }, [transactions, zakatRecipients, bookingRequests]);

  return (
    <div className="min-h-screen bg-[#f6f8f7]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Lora', serif; }
      `}</style>

      {!session ? (
        <LoginScreen onLogin={(u) => { setSession(u); showToast(`Selamat datang, ${u.name}`); }} />
      ) : (
        <>
          <AdminTopBar session={session} onLogout={() => { setSession(null); setEditMode(false); showToast("Anda telah keluar dari Dashboard Takmir"); }} />
          <AdminDashboard
            kpis={kpis}
            editMode={editMode}
            setEditMode={setEditMode}
            transactions={transactions}
            addTransaction={(tx) => { addTransaction(tx); showToast("Transaksi baru berhasil ditambahkan"); }}
            updateTransaction={(id, patch) => { updateTransaction(id, patch); showToast("Transaksi berhasil diperbarui"); }}
            deleteTransaction={(id) => { deleteTransaction(id); showToast("Transaksi berhasil dihapus"); }}
            zakatRecipients={zakatRecipients}
            setZakatStatus={(id) => { setZakatStatus(id); showToast("Zakat berhasil disalurkan"); }}
            updateZakatRecipient={(id, patch) => { updateZakatRecipient(id, patch); showToast("Data mustahiq berhasil diperbarui"); }}
            deleteZakatRecipient={(id) => { deleteZakatRecipient(id); showToast("Data mustahiq berhasil dihapus"); }}
            bookingRequests={bookingRequests}
            setBookingStatus={(id, s) => { setBookingStatus(id, s); showToast(`Permohonan ditandai: ${s}`); }}
            roster={roster}
            updateRosterDay={(day, patch) => { updateRosterDay(day, patch); showToast("Jadwal petugas berhasil diperbarui"); }}
          />
        </>
      )}

      <Toast show={toast.show} message={toast.message} />
    </div>
  );
}

/* ============================================================================
   LOGIN SCREEN — domain-restricted access
   ============================================================================ */

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith(ADMIN_EMAIL_DOMAIN)) {
      setError(`Akses ditolak. Gunakan email resmi Takmir yang berakhiran "${ADMIN_EMAIL_DOMAIN}".`);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const account = TAKMIR_ACCOUNTS.find((a) => a.email === cleanEmail && a.password === password);
      if (!account) {
        setError("Email atau kata sandi salah. Silakan periksa kembali.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      onLogin(account);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, #059669 0%, transparent 40%), radial-gradient(circle at 80% 60%, #d97706 0%, transparent 40%)"
      }} />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-display mt-4 text-xl font-semibold text-slate-900">Dashboard Takmir</h1>
          <p className="mt-1 text-sm text-slate-500">{MOSQUE_NAME}</p>
          <p className="mt-3 text-xs text-slate-400">
            Portal ini khusus untuk pengurus Takmir. Masuk menggunakan email resmi{" "}
            <span className="font-medium text-slate-600">{ADMIN_EMAIL_DOMAIN}</span>.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Email Takmir</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`nama${ADMIN_EMAIL_DOMAIN}`}
                required
                className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Kata Sandi</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Memeriksa..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-center text-[11px] text-slate-400">
          Demo akun: <span className="font-medium text-slate-600">ketua{ADMIN_EMAIL_DOMAIN}</span> / <span className="font-medium text-slate-600">takmir2026</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ADMIN TOP BAR
   ============================================================================ */

function AdminTopBar({ session, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold text-white">Masjid Al Karomah</p>
            <p className="text-[11px] text-slate-400">Dashboard Takmir</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{session.name}</p>
            <p className="text-[11px] text-slate-400">{session.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   TAKMIR ADMIN DASHBOARD
   ============================================================================ */

function AdminDashboard({
  kpis, editMode, setEditMode,
  transactions, addTransaction, updateTransaction, deleteTransaction,
  zakatRecipients, setZakatStatus, updateZakatRecipient, deleteZakatRecipient,
  bookingRequests, setBookingStatus,
  roster, updateRosterDay,
}) {
  const [tab, setTab] = useState("ringkasan");
  const tabs = [
    { id: "ringkasan", label: "Ringkasan", icon: LayoutGrid },
    { id: "keuangan", label: "Buku Kas", icon: Wallet },
    { id: "zakat", label: "Manajemen Mustahiq", icon: HandCoins },
    { id: "jadwal", label: "Jadwal Petugas", icon: CalendarClock },
    { id: "booking", label: "Permohonan Aula", icon: Building2 },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Dashboard Takmir</h1>
          <p className="text-sm text-slate-500">Kelola keuangan, zakat, jadwal, dan permohonan fasilitas masjid</p>
        </div>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            editMode ? "border-amber-600 bg-amber-500 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
          }`}
        >
          {editMode ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {editMode ? "Mode Edit Aktif" : "Aktifkan Mode Edit"}
        </button>
      </div>

      {editMode && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Pencil className="mt-0.5 h-4 w-4 shrink-0" />
          Mode edit aktif — Anda dapat mengubah atau menghapus data langsung di tabel Buku Kas, Mustahiq, dan Jadwal Petugas.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Wallet} label="Infaq Bulan Ini" value={formatIDR(kpis.monthPemasukan)} tone="emerald" sub="September 2026" />
        <StatCard icon={HandCoins} label="Total Zakat Terkumpul" value={formatIDR(kpis.totalZakat)} tone="gold" sub={`${kpis.mustahiqCount} mustahiq terdaftar`} />
        <StatCard icon={Users} label="Mustahiq Terdaftar" value={kpis.mustahiqCount} tone="slate" />
        <StatCard icon={ClipboardList} label="Permohonan Tertunda" value={kpis.pendingBookings} tone="rose" />
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition sm:text-sm ${tab === t.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "ringkasan" && <RingkasanTab kpis={kpis} transactions={transactions} />}
      {tab === "keuangan" && (
        <LedgerTab
          transactions={transactions}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
          deleteTransaction={deleteTransaction}
          editMode={editMode}
        />
      )}
      {tab === "zakat" && (
        <ZakatTab
          zakatRecipients={zakatRecipients}
          setZakatStatus={setZakatStatus}
          updateZakatRecipient={updateZakatRecipient}
          deleteZakatRecipient={deleteZakatRecipient}
          editMode={editMode}
        />
      )}
      {tab === "jadwal" && <ScheduleTab roster={roster} updateRosterDay={updateRosterDay} editMode={editMode} />}
      {tab === "booking" && <BookingAdminTab bookingRequests={bookingRequests} setBookingStatus={setBookingStatus} />}
    </main>
  );
}

function RingkasanTab({ kpis, transactions }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
        <h3 className="font-display text-base font-semibold text-slate-900">Transaksi Terbaru</h3>
        <div className="mt-4 space-y-3">
          {transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.type === "Pemasukan" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {t.type === "Pemasukan" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.description}</p>
                  <p className="text-xs text-slate-400">{t.category} &middot; {new Date(t.date).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${t.type === "Pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>
                {t.type === "Pemasukan" ? "+" : "-"}{formatIDR(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white">
        <h3 className="font-display text-base font-semibold">Saldo Kas</h3>
        <p className="mt-4 text-3xl font-semibold tabular-nums">{formatIDR(kpis.balance)}</p>
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Total Pemasukan</span>
            <span className="font-medium">{formatIDR(kpis.totalPemasukan)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300"><TrendingDown className="h-3.5 w-3.5 text-rose-400" /> Total Pengeluaran</span>
            <span className="font-medium">{formatIDR(kpis.totalPengeluaran)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_TX_FORM = { type: "Pemasukan", category: "Kas Masjid", description: "", amount: "", date: new Date().toISOString().slice(0, 10), status: "Lunas" };

function LedgerTab({ transactions, addTransaction, updateTransaction, deleteTransaction, editMode }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_TX_FORM);

  const categories = ["Semua", "Kas Masjid", "Anak Yatim", "Renovasi", "Operasional"];

  const filtered = transactions.filter((t) =>
    (category === "Semua" || t.category === category) &&
    (t.description.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditingId(null); setForm(EMPTY_TX_FORM); setModalOpen(true); };
  const openEdit = (t) => { setEditingId(t.id); setForm({ type: t.type, category: t.category, description: t.description, amount: String(t.amount), date: t.date, status: t.status }); setModalOpen(true); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const payload = { ...form, amount: Number(form.amount) };
    if (editingId) updateTransaction(editingId, payload);
    else addTransaction(payload);
    setModalOpen(false);
    setForm(EMPTY_TX_FORM);
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-base font-semibold text-slate-900">Buku Kas Masjid</h3>
        <button onClick={openAdd} className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Tambah Transaksi Baru
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari transaksi..." className="w-full text-sm outline-none" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Deskripsi</th>
              <th className="py-2 pr-4">Kategori</th>
              <th className="py-2 pr-4">Tanggal</th>
              <th className="py-2 pr-4">Jumlah</th>
              <th className="py-2 pr-4">Status</th>
              {editMode && <th className="py-2 pr-4">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 text-slate-400">{t.id}</td>
                <td className="py-3 pr-4 font-medium text-slate-800">{t.description}</td>
                <td className="py-3 pr-4"><Badge tone="slate">{t.category}</Badge></td>
                <td className="py-3 pr-4 text-slate-500">{new Date(t.date).toLocaleDateString("id-ID")}</td>
                <td className={`py-3 pr-4 font-semibold ${t.type === "Pemasukan" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "Pemasukan" ? "+" : "-"}{formatIDR(t.amount)}
                </td>
                <td className="py-3 pr-4">
                  <Badge tone={t.status === "Lunas" ? "emerald" : "gold"}>{t.status}</Badge>
                </td>
                {editMode && (
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(t)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-emerald-300 hover:text-emerald-700">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(t.id)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-300 hover:text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={editMode ? 7 : 6} className="py-6 text-center text-sm text-slate-400">Tidak ada transaksi ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Transaksi" : "Tambah Transaksi Baru"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Tipe</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>Pemasukan</option>
                <option>Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {["Kas Masjid", "Anak Yatim", "Renovasi", "Operasional"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Deskripsi</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Jumlah (Rp)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Tanggal</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Lunas</option>
              <option>Pending</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
          </button>
        </form>
      </Modal>

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Hapus Transaksi">
        <p className="text-sm text-slate-600">Yakin ingin menghapus transaksi <span className="font-semibold">{confirmDeleteId}</span>? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
          <button
            onClick={() => { deleteTransaction(confirmDeleteId); setConfirmDeleteId(null); }}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}

const EMPTY_ZAKAT_FORM = { name: "", asnaf: "Fakir", quota: "", phone: "", status: "Belum Disalurkan" };

function ZakatTab({ zakatRecipients, setZakatStatus, updateZakatRecipient, deleteZakatRecipient, editMode }) {
  const [asnafFilter, setAsnafFilter] = useState("Semua");
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_ZAKAT_FORM);
  const filtered = asnafFilter === "Semua" ? zakatRecipients : zakatRecipients.filter((z) => z.asnaf === asnafFilter);

  const openEdit = (z) => { setEditingId(z.id); setForm({ name: z.name, asnaf: z.asnaf, quota: String(z.quota), phone: z.phone, status: z.status }); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.quota) return;
    updateZakatRecipient(editingId, { ...form, quota: Number(form.quota) });
    setEditingId(null);
    setForm(EMPTY_ZAKAT_FORM);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-base font-semibold text-slate-900">Manajemen Mustahiq</h3>
        <select value={asnafFilter} onChange={(e) => setAsnafFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none">
          <option>Semua</option>
          {ASNAF_LIST.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4">Nama</th>
              <th className="py-2 pr-4">Asnaf</th>
              <th className="py-2 pr-4">Kontak</th>
              <th className="py-2 pr-4">Kuota</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((z) => (
              <tr key={z.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-slate-800">{z.name}</td>
                <td className="py-3 pr-4"><Badge tone="gold">{z.asnaf}</Badge></td>
                <td className="py-3 pr-4 text-slate-500">{z.phone}</td>
                <td className="py-3 pr-4 font-semibold text-slate-700">{formatIDR(z.quota)}</td>
                <td className="py-3 pr-4">
                  <Badge tone={z.status === "Selesai" ? "emerald" : "slate"}>{z.status}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    {z.status === "Belum Disalurkan" ? (
                      <button onClick={() => setZakatStatus(z.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
                        Salurkan
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-600"><BadgeCheck className="h-3.5 w-3.5" /> Tersalurkan</span>
                    )}
                    {editMode && (
                      <>
                        <button onClick={() => openEdit(z)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-emerald-300 hover:text-emerald-700">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDeleteId(z.id)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-300 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editingId} onClose={() => setEditingId(null)} title="Edit Data Mustahiq">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Nama</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Asnaf</label>
              <select value={form.asnaf} onChange={(e) => setForm({ ...form, asnaf: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {ASNAF_LIST.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Kuota (Rp)</label>
              <input type="number" value={form.quota} onChange={(e) => setForm({ ...form, quota: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Nomor Kontak</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Status Penyaluran</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Belum Disalurkan</option>
              <option>Selesai</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Simpan Perubahan</button>
        </form>
      </Modal>

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Hapus Data Mustahiq">
        <p className="text-sm text-slate-600">Yakin ingin menghapus data mustahiq ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
          <button
            onClick={() => { deleteZakatRecipient(confirmDeleteId); setConfirmDeleteId(null); }}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ScheduleTab({ roster, updateRosterDay, editMode }) {
  const [editingDay, setEditingDay] = useState(null);
  const [draft, setDraft] = useState({ imam: "", khatib: "", muadzin: "" });

  const startEdit = (r) => { setEditingDay(r.day); setDraft({ imam: r.imam, khatib: r.khatib, muadzin: r.muadzin }); };
  const save = (day) => { updateRosterDay(day, draft); setEditingDay(null); };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-display mb-5 text-base font-semibold text-slate-900">Jadwal Petugas Mingguan</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-4">Hari</th>
              <th className="py-2 pr-4">Imam</th>
              <th className="py-2 pr-4">Khatib Jumat</th>
              <th className="py-2 pr-4">Muadzin</th>
              {editMode && <th className="py-2 pr-4">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => {
              const isEditing = editingDay === r.day;
              return (
                <tr key={r.day} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-800">{r.day}</td>
                  {isEditing ? (
                    <>
                      <td className="py-2 pr-4">
                        <input value={draft.imam} onChange={(e) => setDraft({ ...draft, imam: e.target.value })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                      </td>
                      <td className="py-2 pr-4">
                        <input value={draft.khatib} onChange={(e) => setDraft({ ...draft, khatib: e.target.value })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                      </td>
                      <td className="py-2 pr-4">
                        <input value={draft.muadzin} onChange={(e) => setDraft({ ...draft, muadzin: e.target.value })} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 pr-4 text-slate-600">{r.imam}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.khatib}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.muadzin}</td>
                    </>
                  )}
                  {editMode && (
                    <td className="py-3 pr-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => save(r.day)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                            <Save className="h-3.5 w-3.5" /> Simpan
                          </button>
                          <button onClick={() => setEditingDay(null)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(r)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-emerald-300 hover:text-emerald-700">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingAdminTab({ bookingRequests, setBookingStatus }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-display mb-5 text-base font-semibold text-slate-900">Permohonan Penggunaan Aula</h3>
      <div className="space-y-3">
        {bookingRequests.map((b) => (
          <div key={b.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{b.fullName} &middot; {b.eventType}</p>
              <p className="mt-0.5 text-xs text-slate-500">{b.whatsapp} &middot; {new Date(b.start).toLocaleString("id-ID")}</p>
              {b.notes && <p className="mt-1 text-xs text-slate-400">{b.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={b.status === "Disetujui" ? "emerald" : b.status === "Ditolak" ? "red" : "gold"}>{b.status}</Badge>
              {b.status === "Pending" && (
                <>
                  <button onClick={() => setBookingStatus(b.id, "Disetujui")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Setujui</button>
                  <button onClick={() => setBookingStatus(b.id, "Ditolak")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Tolak</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
