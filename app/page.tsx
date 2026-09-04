"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock, MapPin, Moon, Calendar as CalendarIcon, QrCode, Landmark, Smartphone,
  CheckCircle2, Bell, BookOpenText, Building2, Phone, ArrowRight, Sparkles,
  ShieldCheck, X,
} from "lucide-react";

/* ============================================================================
   MASJID AL KAROMAH — PORTAL JAMA'AH (Public Portal)

   This is a standalone, freely accessible file. It requires NO login — every
   feature here (prayer schedule, donations, kajian schedule, facility
   booking) is open to the public. Administrative functions live in the
   separate `takmir-dashboard.jsx` file, which is gated behind a Takmir-only
   domain login.
   ============================================================================ */

const MOSQUE = {
  name: "Masjid Al Karomah",
  address: "Jalan Bunga Rampai 9, Perumnas Klender, Malaka Jaya, Kecamatan Duren Sawit, Jakarta Timur",
};

// Where the Takmir (admin) portal is hosted — used only for the header link.
const TAKMIR_PORTAL_URL = "https://takmir.masjidalkaromah.id";

/* ---------------------------------- utils --------------------------------- */

function formatIDR(amount) {
  const n = Math.round(Number(amount) || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

function pad2(n) { return n.toString().padStart(2, "0"); }

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir",
  "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

// Approximate Gregorian -> Hijri (Kuwaiti algorithm, tabular estimate)
function toHijri(date) {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
            Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
             Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month: HIJRI_MONTHS[(month - 1 + 12) % 12], year };
}

const PRAYER_TIMES = [
  { name: "Subuh", time: "04:35" },
  { name: "Terbit", time: "05:50" },
  { name: "Dzuhur", time: "11:55" },
  { name: "Ashar", time: "15:15" },
  { name: "Maghrib", time: "18:00" },
  { name: "Isya", time: "19:10" },
];

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getNextPrayer(now) {
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const withIqamah = PRAYER_TIMES.filter((p) => p.name !== "Terbit");
  for (const p of withIqamah) {
    if (timeToMinutes(p.time) > nowMin) return p;
  }
  return withIqamah[0];
}

function getCountdown(now, prayer) {
  const nowMin = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let targetMin = timeToMinutes(prayer.time) * 60;
  let diff = targetMin - nowMin;
  if (diff < 0) diff += 24 * 3600;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = Math.floor(diff % 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/* ------------------------------- mock data -------------------------------- */

const initialEvents = [
  { id: "EV-01", title: "Tafsir Al-Qur'an Ba'da Subuh", category: "Kajian Pekanan", speaker: "Ust. Abdurrahman Hakim", date: "2026-09-06", time: "05:00 - 06:00" },
  { id: "EV-02", title: "TPQ Iqro & Tahsin Anak", category: "TPQ/Madrasah", speaker: "Ustadzah Halimah", date: "2026-09-05", time: "16:00 - 17:30" },
  { id: "EV-03", title: "Khutbah Jumat: Menjaga Amanah", category: "Khutbah Jumat", speaker: "Ust. Zainal Arifin", date: "2026-09-04", time: "11:55 - 13:00" },
  { id: "EV-04", title: "Peringatan Maulid Nabi Muhammad SAW", category: "Hari Besar Islam", speaker: "Ust. Miftahul Huda", date: "2026-09-13", time: "19:30 - 21:30" },
  { id: "EV-05", title: "Kajian Fiqih Muamalah", category: "Kajian Pekanan", speaker: "Ust. Abdurrahman Hakim", date: "2026-09-09", time: "20:00 - 21:00" },
  { id: "EV-06", title: "Madrasah Diniyah Kelas Lanjutan", category: "TPQ/Madrasah", speaker: "Ustadz Rifki Maulana", date: "2026-09-07", time: "15:30 - 17:00" },
];

const DONATION_TABS = ["Infaq Kas Utama", "Sadaqah", "Zakat Fitr", "Zakat Maal"];
const PRESET_AMOUNTS = [20000, 50000, 100000, 500000];
const EVENT_CATEGORIES = ["Semua", "Kajian Pekanan", "TPQ/Madrasah", "Khutbah Jumat", "Hari Besar Islam"];
const PAYMENT_CHANNELS = [
  { id: "qris", label: "QRIS", icon: QrCode, desc: "Pindai kode QR dengan aplikasi bank atau e-wallet apapun." },
  { id: "va", label: "Transfer / VA Bank", icon: Landmark, desc: "Transfer melalui Virtual Account BSI, Mandiri, atau BCA." },
  { id: "ewallet", label: "GoPay / ShopeePay", icon: Smartphone, desc: "Bayar langsung dari saldo GoPay atau ShopeePay Anda." },
];

/* ----------------------------- shared bits -------------------------------- */

function Badge({ children, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gold: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
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
   ROOT APP — Public Jama'ah Portal (no authentication, always free to access)
   ============================================================================ */

export default function JamaahPortalApp() {
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState({ show: false, message: "" });
  const [events] = useState(initialEvents);
  const [reminded, setReminded] = useState({});
  const [donationLedger, setDonationLedger] = useState([]); // local receipt history only

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2600);
  }, []);

  const hijri = useMemo(() => toHijri(now), [now.toDateString()]);
  const nextPrayer = useMemo(() => getNextPrayer(now), [now.getMinutes(), now.getHours()]);
  const countdown = getCountdown(now, nextPrayer);

  return (
    <div className="min-h-screen bg-[#f6f8f7]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Lora', serif; }
        .arch-top { border-radius: 999px 999px 0 0; }
      `}</style>

      <TopBar />

      <main>
        <Hero now={now} hijri={hijri} nextPrayer={nextPrayer} countdown={countdown} />
        <PrayerSchedule now={now} nextPrayer={nextPrayer} />
        <DonationHub onDonation={(tx) => { setDonationLedger((p) => [tx, ...p]); showToast("Terima kasih, donasi Anda telah tercatat"); }} />
        <EventsSection events={events} reminded={reminded} setReminded={setReminded} />
        <BookingSection onBooking={() => showToast("Permohonan booking terkirim, mohon tunggu konfirmasi Takmir")} />
        <Footer />
      </main>

      <Toast show={toast.show} message={toast.message} />
    </div>
  );
}

/* ============================================================================
   TOP BAR — no view switcher; this file is public-only and requires no login
   ============================================================================ */

function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-semibold text-slate-900">Masjid Al Karomah</p>
            <p className="text-[11px] text-slate-400">Duren Sawit, Jakarta Timur</p>
          </div>
        </div>

        <a
          href={TAKMIR_PORTAL_URL}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
          title="Portal khusus Takmir — memerlukan akun email resmi Takmir"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Portal Takmir
        </a>
      </div>
    </header>
  );
}

/* ============================================================================
   HERO
   ============================================================================ */

function Hero({ now, hijri, nextPrayer, countdown }) {
  const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, #059669 0%, transparent 40%), radial-gradient(circle at 80% 60%, #d97706 0%, transparent 40%)"
      }} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-20">
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3 w-3" /> WIB &middot; Asia/Jakarta
          </span>
          <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Masjid Al Karomah
          </h1>
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-300 sm:max-w-md">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            {MOSQUE.address}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                <Clock className="h-3.5 w-3.5" /> Waktu Saat Ini
              </p>
              <p className="font-display mt-2 text-3xl font-semibold text-white tabular-nums">{timeStr}</p>
              <p className="mt-1 text-xs text-slate-400">{dateStr}</p>
              <p className="mt-1 text-xs text-amber-300">{hijri.day} {hijri.month} {hijri.year} H</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-emerald-600/90 p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-100">
                <Bell className="h-3.5 w-3.5" /> Menuju {nextPrayer.name}
              </p>
              <p className="font-display mt-2 text-3xl font-semibold text-white tabular-nums">{countdown}</p>
              <p className="mt-1 text-xs text-emerald-100">Adzan pukul {nextPrayer.time} WIB</p>
            </div>
          </div>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <div className="arch-top h-full w-full max-w-xs border border-white/10 bg-gradient-to-b from-emerald-600/20 to-transparent p-8">
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Moon className="h-10 w-10 text-amber-400" />
              <p className="font-display text-lg text-white">Sholat tepat waktu,</p>
              <p className="font-display text-lg text-white">hati menjadi tenang.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PRAYER SCHEDULE
   ============================================================================ */

function PrayerSchedule({ now, nextPrayer }) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">Jadwal Sholat Hari Ini</h2>
        <Badge tone="slate">Duren Sawit, Jakarta Timur</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PRAYER_TIMES.map((p) => {
          const isNext = p.name === nextPrayer.name;
          const isPast = timeToMinutes(p.time) < nowMin && !isNext;
          return (
            <div
              key={p.name}
              className={`arch-top border p-4 text-center transition ${
                isNext
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : isPast
                  ? "border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <p className="text-sm font-medium">{p.name}</p>
              <p className="font-display mt-1 text-xl font-semibold tabular-nums">{p.time}</p>
              {isNext && <p className="mt-1 text-[11px] text-emerald-100">Selanjutnya</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================================
   DONATION & ZAKAT HUB
   ============================================================================ */

function DonationHub({ onDonation }) {
  const [tab, setTab] = useState(DONATION_TABS[0]);
  const [amount, setAmount] = useState(50000);
  const [custom, setCustom] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [channel, setChannel] = useState("qris");
  const [donorName, setDonorName] = useState("");

  const finalAmount = custom ? Number(custom) : amount;

  const confirmPay = () => {
    onDonation({
      category: tab,
      description: `${tab}${donorName ? " - " + donorName : ""}`,
      amount: finalAmount,
      date: new Date().toISOString().slice(0, 10),
      channel,
    });
    setPayOpen(false);
    setCustom("");
    setDonorName("");
  };

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Donasi & Zakat Digital</h2>
          <p className="mt-1 text-sm text-slate-500">Salurkan kebaikan Anda dengan mudah dan aman — gratis, tanpa perlu akun</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-slate-100 p-1.5">
          {DONATION_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 p-6 sm:p-8">
          <p className="mb-3 text-sm font-medium text-slate-600">Pilih nominal</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PRESET_AMOUNTS.map((v) => (
              <button
                key={v}
                onClick={() => { setAmount(v); setCustom(""); }}
                className={`rounded-xl border py-3 text-sm font-semibold transition ${
                  !custom && amount === v ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-700 hover:border-emerald-300"
                }`}
              >
                {formatIDR(v)}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-600">Atau masukkan nominal lain</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 px-3 py-2 focus-within:border-emerald-500">
              <span className="mr-2 text-sm text-slate-500">Rp</span>
              <input
                type="number"
                min="1000"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Contoh: 75000"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Total {tab}</span>
            <span className="font-display text-lg font-semibold text-emerald-700">{formatIDR(finalAmount)}</span>
          </div>

          <button
            onClick={() => setPayOpen(true)}
            disabled={!finalAmount}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
          >
            Lanjutkan Pembayaran <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Pilih Metode Pembayaran" wide>
        <p className="mb-4 text-sm text-slate-500">
          {tab} sebesar <span className="font-semibold text-emerald-700">{formatIDR(finalAmount)}</span>
        </p>
        <input
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Nama donatur (opsional)"
          className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {PAYMENT_CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChannel(c.id)}
              className={`rounded-xl border p-4 text-left transition ${channel === c.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}
            >
              <c.icon className={`h-5 w-5 ${channel === c.id ? "text-emerald-700" : "text-slate-500"}`} />
              <p className="mt-2 text-sm font-semibold text-slate-800">{c.label}</p>
              <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
            </button>
          ))}
        </div>

        {channel === "qris" && (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 p-6">
            <div className="grid h-40 w-40 grid-cols-6 grid-rows-6 gap-0.5 rounded-lg bg-slate-900 p-2">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className={`${(i * 7) % 5 === 0 ? "bg-white" : "bg-transparent"}`} />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Simulasi QRIS &middot; pindai untuk membayar</p>
          </div>
        )}
        {channel === "va" && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
            <p>Bank Syariah Indonesia (BSI) Virtual Account</p>
            <p className="font-display mt-1 text-lg font-semibold tracking-wide text-slate-900">8009 8812 3456 7890</p>
            <p className="mt-1 text-xs text-slate-400">Berlaku 24 jam sejak transaksi dibuat</p>
          </div>
        )}
        {channel === "ewallet" && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
            <p>Anda akan diarahkan ke aplikasi GoPay / ShopeePay untuk menyelesaikan pembayaran (simulasi).</p>
          </div>
        )}

        <button
          onClick={confirmPay}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Konfirmasi Pembayaran
        </button>
      </Modal>
    </section>
  );
}

/* ============================================================================
   EVENTS / KAJIAN
   ============================================================================ */

function EventsSection({ events, reminded, setReminded }) {
  const [filter, setFilter] = useState("Semua");
  const filtered = filter === "Semua" ? events : events.filter((e) => e.category === filter);

  const saveToCalendar = (ev) => {
    const start = ev.date.replace(/-/g, "");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${ev.title}\nDTSTART:${start}T090000\nDESCRIPTION:${ev.speaker}\nLOCATION:${MOSQUE.name}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.title}.ics`;
    a.click();
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-slate-900">Jadwal Kajian & Kegiatan</h2>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filter === c ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600 hover:border-emerald-300"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ev) => (
          <div key={ev.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Badge tone="gold">{ev.category}</Badge>
            <h3 className="font-display mt-3 text-base font-semibold text-slate-900">{ev.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{ev.speaker}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {new Date(ev.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {ev.time}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => saveToCalendar(ev)} className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:border-emerald-300">
                Simpan ke Kalender
              </button>
              <button
                onClick={() => setReminded((prev) => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${reminded[ev.id] ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                {reminded[ev.id] ? "Diingatkan ✓" : "Ingatkan Saya"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   FACILITY BOOKING
   ============================================================================ */

function BookingSection({ onBooking }) {
  const [form, setForm] = useState({ fullName: "", whatsapp: "", eventType: "Akad Nikah", start: "", end: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.whatsapp || !form.start) return;
    onBooking(form);
    setForm({ fullName: "", whatsapp: "", eventType: "Akad Nikah", start: "", end: "", notes: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">Permohonan Penggunaan Aula</h2>
            <p className="text-sm text-slate-500">Akad Nikah, Pengajian RT, dan kegiatan komunitas lainnya — gratis untuk warga</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-600">Nama Lengkap</label>
            <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Nomor WhatsApp</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
              <Phone className="h-4 w-4 text-slate-400" />
              <input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} required placeholder="0812xxxxxxx"
                className="w-full bg-transparent px-2 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Jenis Kegiatan</label>
            <select value={form.eventType} onChange={(e) => update("eventType", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500">
              {["Akad Nikah", "Pengajian RT", "Tasyakuran", "Acara Sosial", "Lainnya"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Mulai</label>
              <input type="datetime-local" value={form.start} onChange={(e) => update("start", e.target.value)} required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Selesai</label>
              <input type="datetime-local" value={form.end} onChange={(e) => update("end", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-600">Catatan Tambahan</label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              Ajukan Permohonan
            </button>
            {submitted && <p className="mt-2 text-center text-xs font-medium text-emerald-600">Permohonan terkirim! Takmir akan menghubungi Anda melalui WhatsApp.</p>}
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6">
        <p className="font-display text-sm text-slate-600">Masjid Al Karomah</p>
        <p className="mt-1">{MOSQUE.address}</p>
        <p className="mt-2">&copy; 2026 Takmir Masjid Al Karomah. Dikelola dengan amanah. Portal Jama'ah ini gratis dan terbuka untuk umum.</p>
      </div>
    </footer>
  );
}
