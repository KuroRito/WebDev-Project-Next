/* =========================================================
   Web Katalog UMKM Makanan + Login Supabase + Dashboard Manajer
   ========================================================= */

/* ---------- KONFIGURASI SUPABASE ----------
   Isi dari: Supabase Dashboard > Project Settings > API
   (pakai "anon public" key, JANGAN pakai service_role key) */
const SUPABASE_URL = "https://lrjyvxsfkdqsdqzceefi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyanl2eHNma2Rxc2RxemNlZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzExMzcsImV4cCI6MjEwODI0NzEzN30.8tJp4nKR3uJMZKnMN700H1kE2RsPX3coPoYzznqgrFw";

const sb =
  window.supabase && !SUPABASE_URL.includes("YOUR-PROJECT")
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/* ---------- DATA ---------- */
const umkmData = [
  { id: 1, nama: "Warung Bu Sari",     lokasi: "Bandung",    ikon: "🍚", wa: "6281234567801" },
  { id: 2, nama: "Keripik Mbak Rina",  lokasi: "Yogyakarta", ikon: "🥔", wa: "6281234567802" },
  { id: 3, nama: "Kopi Nusantara",     lokasi: "Jakarta",    ikon: "☕", wa: "6281234567803" },
  { id: 4, nama: "Dapur Kue Ayu",      lokasi: "Surabaya",   ikon: "🍰", wa: "6281234567804" },
  { Id: 5, nama: "Pak Hambali",        lokasi: "Ngawi Timur",ikon: "🍫", wa: "6281234567805" }
];

const produkData = [
  { id: 1, nama: "Nasi Liwet Komplit", harga: 25000, umkmId: 1, emoji: "🍛", warna: "#ffe8cc",
    deskripsi: "Nasi liwet gurih dengan ayam suwir, tahu, tempe, lalapan, dan sambal terasi." },
  { id: 2, nama: "Ayam Goreng Kremes", harga: 22000, umkmId: 1, emoji: "🍗", warna: "#ffd8a8",
    deskripsi: "Ayam goreng bumbu kuning dengan taburan kremes renyah, disajikan dengan sambal." },
  { id: 3, nama: "Keripik Singkong Pedas", harga: 15000, umkmId: 2, emoji: "🥔", warna: "#fff3bf",
    deskripsi: "Keripik singkong renyah dengan bumbu pedas manis. Kemasan 200 gram." },
  { id: 4, nama: "Keripik Pisang Cokelat", harga: 18000, umkmId: 2, emoji: "🍌", warna: "#ffec99",
    deskripsi: "Keripik pisang tipis dilapisi cokelat lumer. Cocok untuk camilan keluarga." },
  { id: 5, nama: "Kopi Susu Gula Aren", harga: 20000, umkmId: 3, emoji: "☕", warna: "#e9d8c4",
    deskripsi: "Perpaduan espresso, susu segar, dan gula aren asli. Tersedia panas atau dingin." },
  { id: 6, nama: "Biji Kopi Arabika 250g", harga: 65000, umkmId: 3, emoji: "🫘", warna: "#d9c3a5",
    deskripsi: "Biji kopi arabika single origin, sangrai medium dengan aroma floral dan manis." },
  { id: 7, nama: "Bolu Pandan Lembut", harga: 35000, umkmId: 4, emoji: "🍰", warna: "#d3f9d8",
    deskripsi: "Bolu pandan super lembut tanpa pengawet, dipanggang segar setiap hari." },
  { id: 8, nama: "Puding coklat", harga: 40000, umkmId: 5, emoji: "🍫", warna: "#e0cfc2",
    deskripsi: "Puding coklat yang kenyal dengan cokelat premium dan topping fla." }
];

/* ---------- HELPER ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const rupiah = (angka) => "Rp " + Number(angka).toLocaleString("id-ID");
const getUmkm = (id) => umkmData.find((u) => u.id === id);

let produkTerpilih = null;
let toastTimer = null;

/* ---------- STATE AUTH ---------- */
let currentUser = null;   // objek user Supabase (atau null)
let currentProfile = null; // { nama, role }
let authMode = "login";   // "login" | "register"
let viewSetelahLogin = null; // view tujuan setelah login berhasil

const isManager = () => currentProfile?.role === "manager";

function tampilToast(pesan) {
  const toast = $("#toast");
  toast.textContent = pesan;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

/* ---------- NAVIGASI ANTAR TAMPILAN ---------- */
function tampilkanView(nama) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-" + nama).classList.add("active");

  $$(".nav-btn[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === nama);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- RENDER KOMPONEN ---------- */
function buatKartuProduk(p) {
  const umkm = getUmkm(p.umkmId);
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-photo" style="background:${p.warna}">${p.emoji}</div>
    <div class="product-info">
      <h3></h3>
      <span class="product-umkm"></span>
      <span class="price">${rupiah(p.harga)}</span>
      <button class="btn btn-secondary btn-choose">Pilih Produk</button>
    </div>`;
  card.querySelector("h3").textContent = p.nama;
  card.querySelector(".product-umkm").textContent = umkm.nama + " • " + umkm.lokasi;

  card.addEventListener("click", () => tampilkanDetail(p.id));
  return card;
}

function renderDaftarUmkm() {
  const wadah = $("#umkm-list");
  wadah.innerHTML = "";
  umkmData.forEach((u) => {
    const jumlah = produkData.filter((p) => p.umkmId === u.id).length;
    const el = document.createElement("div");
    el.className = "umkm-card";
    el.innerHTML = `
      <div class="umkm-icon">${u.ikon}</div>
      <div><h3></h3><p></p></div>`;
    el.querySelector("h3").textContent = u.nama;
    el.querySelector("p").textContent = `${u.lokasi} • ${jumlah} produk`;
    wadah.appendChild(el);
  });
}

function renderDaftarProduk(wadahSel, daftar) {
  const wadah = $(wadahSel);
  wadah.innerHTML = "";
  daftar.forEach((p) => wadah.appendChild(buatKartuProduk(p)));
}

/* ---------- BERANDA ---------- */
function tampilkanBeranda() {
  renderDaftarUmkm();
  renderDaftarProduk("#featured-list", produkData.slice(0, 4));
  tampilkanView("home");
}

/* ---------- CARI MAKANAN ---------- */
function prosesPencarian(kataKunci) {
  const kunci = kataKunci.trim().toLowerCase();
  const hasil = produkData.filter((p) => {
    const umkm = getUmkm(p.umkmId);
    return (
      p.nama.toLowerCase().includes(kunci) ||
      p.deskripsi.toLowerCase().includes(kunci) ||
      umkm.nama.toLowerCase().includes(kunci)
    );
  });

  const info = $("#search-info");
  const notFound = $("#not-found");
  const wadahHasil = $("#search-results");

  if (hasil.length === 0) {
    wadahHasil.innerHTML = "";
    info.hidden = true;
    notFound.hidden = false;
  } else {
    notFound.hidden = true;
    info.hidden = false;
    info.textContent = `Ditemukan ${hasil.length} produk untuk "${kataKunci.trim()}"`;
    renderDaftarProduk("#search-results", hasil);
  }
}

function resetPencarian() {
  $("#keyword").value = "";
  $("#search-info").hidden = true;
  $("#not-found").hidden = true;
  $("#search-results").innerHTML = "";
}

/* ---------- LIHAT KATALOG ---------- */
function tampilkanKatalog() {
  renderDaftarProduk("#catalog-list", produkData);
  tampilkanView("catalog");
}

/* ---------- DETAIL PRODUK ---------- */
function ambilJumlah() {
  const n = parseInt($("#detail-qty").value, 10);
  if (Number.isNaN(n)) return 1;
  return Math.min(100, Math.max(1, n));
}

function perbaruiTotalDetail() {
  if (!produkTerpilih) return;
  const jumlah = ambilJumlah();
  $("#detail-total").textContent = "Total " + rupiah(produkTerpilih.harga * jumlah);
}

function tampilkanDetail(id) {
  const p = produkData.find((x) => x.id === id);
  if (!p) return;
  const umkm = getUmkm(p.umkmId);
  produkTerpilih = p;

  $("#detail-photo").textContent = p.emoji;
  $("#detail-photo").style.background = p.warna;
  $("#detail-name").textContent = p.nama;
  $("#detail-price").textContent = rupiah(p.harga);
  $("#detail-desc").textContent = p.deskripsi;
  $("#detail-umkm").textContent = umkm.nama;
  $("#detail-location").textContent = umkm.lokasi;
  $("#detail-qty").value = 1;
  perbaruiTotalDetail();
  $("#detail-login-hint").hidden = !!currentUser;

  tampilkanView("detail");
}

/* ---------- PESAN VIA WHATSAPP (+ catat pesanan) ---------- */
async function bukaWhatsApp() {
  if (!produkTerpilih) return;

  // Wajib login agar pembelian tercatat atas nama user
  if (!currentUser) {
    viewSetelahLogin = "detail";
    bukaHalamanLogin("Masuk dulu untuk memesan produk ini.");
    return;
  }

  const p = produkTerpilih;
  const umkm = getUmkm(p.umkmId);
  const jumlah = ambilJumlah();
  const pesan =
    `Halo ${umkm.nama}, saya tertarik dengan produk "${p.nama}" ` +
    `sebanyak ${jumlah} (${rupiah(p.harga * jumlah)}). Apakah masih tersedia?`;
  const url = `https://wa.me/${umkm.wa}?text=${encodeURIComponent(pesan)}`;

  // Buka WhatsApp langsung (sinkron) supaya tidak diblokir popup blocker
  window.open(url, "_blank", "noopener");

  // Catat pesanan ke Supabase
  const { error } = await sb.from("orders").insert({
    produk_id: p.id,
    umkm_id: p.umkmId,
    nama_produk: p.nama,
    harga: p.harga,
    jumlah
  });

  if (error) {
    console.error(error);
    tampilToast("Chat WhatsApp dibuka, tetapi pesanan gagal dicatat: " + error.message);
  } else {
    tampilToast("Pesanan tercatat. Terima kasih telah berbelanja di UMKM lokal! 🙏");
  }
}

/* =========================================================
   AUTH
   ========================================================= */
function bukaHalamanLogin(pesan) {
  setAuthMode("login");
  tampilkanPesanAuth(pesan || "", false);
  tampilkanView("login");
  $("#auth-email").focus();
}

function setAuthMode(mode) {
  authMode = mode;
  $$(".auth-tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
  $("#field-nama").hidden = mode !== "register";
  $("#auth-submit").textContent = mode === "register" ? "Buat akun" : "Masuk";
  $("#auth-password").autocomplete = mode === "register" ? "new-password" : "current-password";
  tampilkanPesanAuth("", false);
}

function tampilkanPesanAuth(teks, galat) {
  const el = $("#auth-message");
  el.textContent = teks;
  el.hidden = !teks;
  el.classList.toggle("error", !!galat);
}

function terjemahkanGalatAuth(err) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Cek kotak masuk Anda.";
  if (m.includes("already registered")) return "Email ini sudah terdaftar. Silakan masuk.";
  if (m.includes("password should be")) return "Kata sandi minimal 6 karakter.";
  if (m.includes("rate limit")) return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
  return err?.message || "Terjadi kesalahan. Coba lagi.";
}

async function prosesAuth(e) {
  e.preventDefault();
  if (!sb) {
    tampilkanPesanAuth("Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di script.js.", true);
    return;
  }

  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  const nama = $("#auth-nama").value.trim();

  if (!email || !password) {
    tampilkanPesanAuth("Email dan kata sandi wajib diisi.", true);
    return;
  }
  if (password.length < 6) {
    tampilkanPesanAuth("Kata sandi minimal 6 karakter.", true);
    return;
  }

  const tombol = $("#auth-submit");
  tombol.disabled = true;
  tampilkanPesanAuth("", false);

  try {
    if (authMode === "register") {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { nama } }
      });
      if (error) throw error;

      if (!data.session) {
        // Konfirmasi email aktif di Supabase
        tampilkanPesanAuth("Akun dibuat. Cek email Anda untuk konfirmasi, lalu masuk.", false);
        setAuthMode("login");
        tampilkanPesanAuth("Akun dibuat. Cek email Anda untuk konfirmasi, lalu masuk.", false);
      } else {
        tampilToast("Akun dibuat. Selamat datang!");
      }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      tampilToast("Berhasil masuk.");
    }
  } catch (err) {
    tampilkanPesanAuth(terjemahkanGalatAuth(err), true);
  } finally {
    tombol.disabled = false;
  }
}

async function keluar() {
  if (!sb) return;
  const { error } = await sb.auth.signOut();
  if (error) {
    tampilToast("Gagal keluar: " + error.message);
    return;
  }
  tampilToast("Anda sudah keluar.");
}

async function muatProfil(user) {
  const { data, error } = await sb
    .from("profiles")
    .select("nama, role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) console.error("Gagal memuat profil:", error);
  return data || { nama: user.email, role: "user" };
}

function perbaruiUIAuth() {
  const masuk = !!currentUser;
  $("#nav-login").hidden = masuk;
  $("#nav-logout").hidden = !masuk;
  $("#nav-dashboard").hidden = !(masuk && isManager());

  const chip = $("#user-chip");
  chip.hidden = !masuk;
  if (masuk) {
    const nama = currentProfile?.nama || currentUser.email;
    chip.textContent = isManager() ? `${nama} · Manajer` : nama;
    chip.classList.toggle("manager", isManager());
  }
  $("#detail-login-hint").hidden = masuk;
}

async function terapkanSesi(session) {
  currentUser = session?.user || null;
  currentProfile = currentUser ? await muatProfil(currentUser) : null;
  perbaruiUIAuth();

  const viewAktif = document.querySelector(".view.active")?.id;

  if (currentUser) {
    // Setelah login: lanjut ke tujuan semula, atau ke beranda jika masih di halaman login
    if (viewSetelahLogin) {
      const tujuan = viewSetelahLogin;
      viewSetelahLogin = null;
      tampilkanView(tujuan);
    } else if (viewAktif === "view-login") {
      if (isManager()) bukaDashboard();
      else tampilkanBeranda();
    }
  } else {
    // Setelah keluar: tutup halaman yang butuh login/role
    if (viewAktif === "view-dashboard") tampilkanBeranda();
  }
}

/* =========================================================
   DASHBOARD MANAJER
   ========================================================= */
function tampilkanStatusDash(teks) {
  const el = $("#dash-status");
  el.textContent = teks;
  el.hidden = !teks;
}

function bukaDashboard() {
  if (!currentUser || !isManager()) {
    tampilToast("Halaman ini hanya untuk manajer.");
    return;
  }
  tampilkanView("dashboard");
  muatDashboard();
}

function isiTabel(tbodySel, baris, kosongTeks) {
  const tbody = $(tbodySel);
  tbody.innerHTML = "";
  if (baris.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "empty";
    td.textContent = kosongTeks;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  baris.forEach((kolom) => {
    const tr = document.createElement("tr");
    kolom.forEach((nilai, i) => {
      const td = document.createElement("td");
      td.textContent = nilai;
      if (kolom.num && kolom.num.includes(i)) td.className = "num";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function barisAngka(arr, indeksAngka) {
  arr.num = indeksAngka;
  return arr;
}

async function muatDashboard() {
  if (!sb || !isManager()) return;

  const hari = parseInt($("#dash-period").value, 10);
  $("#dash-content").hidden = true;
  tampilkanStatusDash("Memuat data pembelian…");

  let query = sb
    .from("orders")
    .select("id, created_at, produk_id, umkm_id, nama_produk, harga, jumlah, user_id, profiles(email, nama)")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (hari > 0) {
    const sejak = new Date(Date.now() - hari * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", sejak);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    tampilkanStatusDash("Gagal memuat data: " + error.message);
    return;
  }

  const orders = data || [];
  tampilkanStatusDash(
    orders.length === 1000
      ? "Menampilkan 1.000 pesanan terbaru. Persempit periode untuk hasil yang lebih akurat."
      : ""
  );

  // ----- Ringkasan -----
  const totalItem = orders.reduce((s, o) => s + o.jumlah, 0);
  const totalNilai = orders.reduce((s, o) => s + o.harga * o.jumlah, 0);
  const pembeli = new Set(orders.map((o) => o.user_id));

  $("#stat-orders").textContent = orders.length.toLocaleString("id-ID");
  $("#stat-items").textContent = totalItem.toLocaleString("id-ID");
  $("#stat-revenue").textContent = rupiah(totalNilai);
  $("#stat-buyers").textContent = pembeli.size.toLocaleString("id-ID");

  // ----- Agregasi -----
  const kelompokkan = (kunciFn, labelFn) => {
    const peta = new Map();
    orders.forEach((o) => {
      const k = kunciFn(o);
      const r = peta.get(k) || { label: labelFn(o), trx: 0, item: 0, nilai: 0 };
      r.trx += 1;
      r.item += o.jumlah;
      r.nilai += o.harga * o.jumlah;
      peta.set(k, r);
    });
    return [...peta.values()].sort((a, b) => b.nilai - a.nilai);
  };

  const perUmkm = kelompokkan(
    (o) => o.umkm_id,
    (o) => getUmkm(o.umkm_id)?.nama || `UMKM #${o.umkm_id}`
  ).map((r) => barisAngka([r.label, r.trx, r.item, rupiah(r.nilai)], [1, 2, 3]));

  const perProduk = kelompokkan((o) => o.produk_id, (o) => o.nama_produk)
    .map((r) => barisAngka([r.label, r.trx, r.item, rupiah(r.nilai)], [1, 2, 3]));

  const terbaru = orders.slice(0, 20).map((o) =>
    barisAngka(
      [
        new Date(o.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
        o.profiles?.nama || o.profiles?.email || "—",
        o.nama_produk,
        o.jumlah,
        rupiah(o.harga * o.jumlah)
      ],
      [3, 4]
    )
  );

  isiTabel("#tbl-umkm", perUmkm, "Belum ada pembelian pada periode ini.");
  isiTabel("#tbl-produk", perProduk, "Belum ada pembelian pada periode ini.");
  isiTabel("#tbl-recent", terbaru, "Belum ada pembelian pada periode ini.");

  $("#dash-content").hidden = false;
}

/* ---------- EVENT LISTENER ---------- */
function pasangEvent() {
  $$("[data-view]").forEach((el) => {
    el.addEventListener("click", () => {
      const tujuan = el.dataset.view;
      if (tujuan === "home") tampilkanBeranda();
      else if (tujuan === "catalog") tampilkanKatalog();
      else if (tujuan === "search") { resetPencarian(); tampilkanView("search"); $("#keyword").focus(); }
      else if (tujuan === "login") { viewSetelahLogin = null; bukaHalamanLogin(); }
      else if (tujuan === "dashboard") bukaDashboard();
    });
  });

  $("#brand-link").addEventListener("click", (e) => {
    e.preventDefault();
    tampilkanBeranda();
  });

  // Pencarian
  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const kunci = $("#keyword").value;
    if (kunci.trim() !== "") prosesPencarian(kunci);
  });
  $("#not-found-back").addEventListener("click", tampilkanBeranda);

  // Detail produk
  $("#btn-wa").addEventListener("click", bukaWhatsApp);
  $("#btn-back-catalog").addEventListener("click", tampilkanKatalog);
  $("#detail-qty").addEventListener("input", perbaruiTotalDetail);

  // Auth
  $$(".auth-tab").forEach((t) =>
    t.addEventListener("click", () => setAuthMode(t.dataset.mode))
  );
  $("#auth-form").addEventListener("submit", prosesAuth);
  $("#nav-logout").addEventListener("click", keluar);

  // Dashboard
  $("#dash-period").addEventListener("change", muatDashboard);
  $("#dash-refresh").addEventListener("click", muatDashboard);
}

/* ---------- MULAI ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  pasangEvent();
  tampilkanBeranda();

  if (!sb) {
    console.warn("Supabase belum dikonfigurasi: isi SUPABASE_URL dan SUPABASE_ANON_KEY di script.js.");
    return;
  }

  // Pantau perubahan sesi (login, logout, refresh token).
  // Panggilan Supabase di dalam callback ini ditunda agar tidak terjadi deadlock.
  sb.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
    setTimeout(() => terapkanSesi(session), 0);
  });

  const { data } = await sb.auth.getSession();
  await terapkanSesi(data.session);
});
