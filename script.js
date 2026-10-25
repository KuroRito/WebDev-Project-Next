/* =========================================================
   Toko JosJis — Katalog UMKM Makanan + Login Supabase + Dashboard Manajer
   ========================================================= */

/* ---------- KONFIGURASI SUPABASE ----------
   Isi dari: Supabase Dashboard > Project Settings > API */
const SUPABASE_URL = "https://lrjyvxsfkdqsdqzceefi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyanl2eHNma2Rxc2RxemNlZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzExMzcsImV4cCI6MjEwODI0NzEzN30.8tJp4nKR3uJMZKnMN700H1kE2RsPX3coPoYzznqgrFw";

const sb =
  window.supabase && !SUPABASE_URL.includes("YOUR-PROJECT")
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/* ---------- DATA ----------
   Field opsional pada produk:
   - gambar : foto produk, mis. "img/nasi-liwet.jpg" atau URL penuh (kosong = tampil emoji)
   - badge  : label di pojok foto, mis. "Terlaris", "Baru", "Promo"
   Field opsional pada UMKM:
   - logo   : foto logo UMKM, mis. "img/logo-bu-sari.png" (kosong = tampil emoji "ikon") */
const kategoriData = [
  { nama: "Makanan Berat", ikon: "🍛" },
  { nama: "Camilan",       ikon: "🥔" },
  { nama: "Minuman",       ikon: "☕" },
  { nama: "Kue & Dessert", ikon: "🍰" }
];

const umkmData = [
  { id: 1, nama: "Warung Bu Sari",     lokasi: "Bandung",     ikon: "🍚", logo: "img/UMKM.jpeg", warna: "#ffe8cc", wa: "6288212222891" },
  { id: 2, nama: "Keripik Mbak Rina",  lokasi: "Yogyakarta",  ikon: "🥔", logo: "img/keripik umkm.jpeg", warna: "#fff3bf", wa: "6288212222891" },
  { id: 3, nama: "Kopi Nusantara",     lokasi: "Jakarta",     ikon: "☕", logo: "img/UMKM.jpeg", warna: "#e9d8c4", wa: "6288212222891" },
  { id: 4, nama: "Pak Hambali",        lokasi: "Ngawi Timur", ikon: "🍫", logo: "img/pak-hambali.png", warna: "#e0cfc2", wa: "6281525969883" }
];

const produkData = [
  { id: 1, nama: "Nasi Liwet Komplit", harga: 25000, umkmId: 1, emoji: "🍛", warna: "#ffe8cc",
    kategori: "Makanan Berat", badge: "Terlaris", gambar: "img/nasi liwet.jpeg",
    deskripsi: "Nasi liwet gurih dengan ayam suwir, tahu, tempe, lalapan, dan sambal terasi." },
  { id: 2, nama: "Ayam Goreng Kremes", harga: 22000, umkmId: 1, emoji: "🍗", warna: "#ffd8a8",
    kategori: "Makanan Berat", badge: "", gambar: "img/ayam.jpeg",
    deskripsi: "Ayam goreng bumbu kuning dengan taburan kremes renyah, disajikan dengan sambal." },
  { id: 3, nama: "Keripik Singkong Pedas", harga: 15000, umkmId: 2, emoji: "🥔", warna: "#fff3bf",
    kategori: "Camilan", badge: "", gambar: "img/keripik singkong.jpeg",
    deskripsi: "Keripik singkong renyah dengan bumbu pedas manis. Kemasan 200 gram." },
  { id: 4, nama: "Keripik Pisang Cokelat", harga: 18000, umkmId: 2, emoji: "🍌", warna: "#ffec99",
    kategori: "Camilan", badge: "", gambar: "img/piscok.jpg",
    deskripsi: "Keripik pisang tipis dilapisi cokelat lumer. Cocok untuk camilan keluarga." },
  { id: 5, nama: "Kopi Susu Gula Aren", harga: 20000, umkmId: 3, emoji: "☕", warna: "#e9d8c4",
    kategori: "Minuman", badge: "", gambar: "img/kopi.jpeg",
    deskripsi: "Perpaduan espresso, susu segar, dan gula aren asli. Tersedia panas atau dingin." },
  { id: 6, nama: "Biji Kopi Arabika 250g", harga: 65000, umkmId: 3, emoji: "🫘", warna: "#d9c3a5",
    kategori: "Minuman", badge: "", gambar: "img/biji kopi.jpeg",
    deskripsi: "Biji kopi arabika single origin, sangrai medium dengan aroma floral dan manis." },
  { id: 7, nama: "Bolu Pandan Lembut", harga: 35000, umkmId: 4, emoji: "🍰", warna: "#d3f9d8",
    kategori: "Kue & Dessert", badge: "", gambar: "img/bolu.jpeg",
    deskripsi: "Bolu pandan super lembut tanpa pengawet, dipanggang segar setiap hari." },
  { id: 8, nama: "Puding coklat", harga: 10000, umkmId: 4, emoji: "🍫", warna: "#e0cfc2",
    kategori: "Kue & Dessert", badge: "Baru", gambar: "img/puding.jpeg",
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

/* ---------- STATE KATALOG ---------- */
const filterKatalog = { kategori: "Semua", umkmId: null, urut: "default" };

function tampilToast(pesan) {
  const toast = $("#toast");
  toast.textContent = pesan;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

/* ---------- NAVIGASI ANTAR TAMPILAN + RIWAYAT (TOMBOL KEMBALI) ----------
   Setiap perpindahan halaman dicatat di riwayat browser (History API),
   sehingga tombol "Kembali" di web, tombol back browser, dan tombol back HP
   semuanya membawa user ke halaman sebelumnya dengan kondisi yang sama
   (filter katalog, hasil pencarian, atau produk yang dibuka). */
let viewAktifNama = "home";
let kataKunciAktif = "";       // kata kunci pencarian yang sedang ditampilkan
let sedangPulih = false;       // true saat memulihkan halaman dari riwayat
let gantiEntri = false;        // true = ganti entri riwayat saat ini, bukan menambah baru
let jumlahSetelahLogin = null; // jumlah beli yang dipertahankan saat user harus login dulu

function ambilSnapshot(nama) {
  const snap = { view: nama };
  if (nama === "catalog") snap.filter = { ...filterKatalog };
  if (nama === "search") snap.keyword = kataKunciAktif;
  if (nama === "detail") snap.produkId = produkTerpilih ? produkTerpilih.id : null;
  return snap;
}

// Perbarui entri riwayat saat ini (mis. filter atau hasil pencarian berubah) tanpa menambah entri
function simpanSnapshot() {
  const idx = history.state?.idx ?? 0;
  history.replaceState({ idx, snap: ambilSnapshot(viewAktifNama) }, "");
}

function catatRiwayat(nama) {
  if (sedangPulih) return; // sedang kembali lewat riwayat, jangan tambah entri
  const snap = ambilSnapshot(nama);
  const sekarang = history.state;
  const idx = sekarang?.idx ?? 0;

  if (gantiEntri) {
    history.replaceState({ idx, snap }, "");
    return;
  }
  // Halaman yang sama persis tidak dicatat dua kali (mis. klik Beranda saat sudah di Beranda)
  if (sekarang?.snap && JSON.stringify(sekarang.snap) === JSON.stringify(snap)) return;
  history.pushState({ idx: idx + 1, snap }, "");
}

function perbaruiTombolKembali() {
  const idx = history.state?.idx ?? 0;
  $("#backbar").hidden = !(idx > 0 && viewAktifNama !== "home");
}

function tampilkanView(nama) {
  viewAktifNama = nama;
  catatRiwayat(nama);

  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-" + nama).classList.add("active");

  $$(".nav-btn[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === nama);
  });
  perbaruiTombolKembali();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function kembali() {
  if ((history.state?.idx ?? 0) > 0) history.back();
  else tampilkanBeranda();
}

// Tampilkan ulang halaman dari snapshot riwayat
function pulihkan(snap) {
  sedangPulih = true;
  try {
    switch (snap?.view) {
      case "search":
        resetPencarian();
        tampilkanView("search");
        if (snap.keyword) {
          $("#keyword").value = snap.keyword;
          prosesPencarian(snap.keyword);
        }
        break;
      case "catalog":
        tampilkanKatalog(snap.filter);
        break;
      case "detail":
        tampilkanDetail(snap.produkId);
        if (jumlahSetelahLogin) {
          $("#detail-qty").value = jumlahSetelahLogin;
          perbaruiTotalDetail();
          jumlahSetelahLogin = null;
        }
        break;
      case "login":
        if (currentUser) tampilkanBeranda();
        else bukaHalamanLogin();
        break;
      case "dashboard":
        if (currentUser && isManager()) bukaDashboard();
        else tampilkanBeranda();
        break;
      default:
        tampilkanBeranda();
    }
  } finally {
    sedangPulih = false;
  }
  // Pastikan entri riwayat mencerminkan halaman yang benar-benar tampil
  simpanSnapshot();
  perbaruiTombolKembali();
}

/* ---------- RENDER KOMPONEN ---------- */

// Isi kotak foto: emoji sebagai dasar, foto asli (jika ada) menutupinya.
// Bila foto gagal dimuat, foto dihapus dan emoji tampil kembali.
function isiFoto(el, p) {
  el.innerHTML = "";
  el.style.background = p.warna;

  const tambahEmoji = () => {
    const emoji = document.createElement("span");
    emoji.className = "photo-emoji";
    emoji.textContent = p.emoji;
    el.insertBefore(emoji, el.firstChild);
  };

  if (p.gambar) {
    // Ada foto: tampilkan foto saja. Emoji hanya muncul jika foto gagal dimuat.
    const img = document.createElement("img");
    img.src = p.gambar;
    img.alt = p.nama;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.remove();
      tambahEmoji();
    });
    el.appendChild(img);
  } else {
    tambahEmoji();
  }

  if (p.badge) {
    const b = document.createElement("span");
    b.className = "badge";
    b.dataset.tipe = p.badge.toLowerCase();
    b.textContent = p.badge;
    el.appendChild(b);
  }
}

// Logo UMKM: foto jika u.logo diisi; jika kosong atau gagal dimuat tampil emoji u.ikon
function isiLogo(el, u) {
  el.innerHTML = "";
  if (u.logo) {
    const img = document.createElement("img");
    img.src = u.logo;
    img.alt = "Logo " + u.nama;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.remove();
      el.textContent = u.ikon;
    });
    el.appendChild(img);
  } else {
    el.textContent = u.ikon;
  }
}

function buatKartuProduk(p) {
  const umkm = getUmkm(p.umkmId);
  const card = document.createElement("article");
  card.className = "product-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.innerHTML = `
    <div class="product-photo photo-box"></div>
    <div class="product-info">
      <span class="product-cat"></span>
      <h3></h3>
      <span class="product-umkm"></span>
      <div class="product-foot">
        <span class="price">${rupiah(p.harga)}</span>
        <button type="button" class="btn-mini" tabindex="-1">Pilih</button>
      </div>
    </div>`;
  isiFoto(card.querySelector(".product-photo"), p);
  card.querySelector(".product-cat").textContent = p.kategori || "";
  card.querySelector("h3").textContent = p.nama;
  card.querySelector(".product-umkm").textContent = umkm.nama + " • " + umkm.lokasi;

  card.addEventListener("click", () => tampilkanDetail(p.id));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tampilkanDetail(p.id);
    }
  });
  return card;
}

function renderDaftarProduk(wadahSel, daftar) {
  const wadah = $(wadahSel);
  wadah.innerHTML = "";
  daftar.forEach((p) => wadah.appendChild(buatKartuProduk(p)));
}

function renderChips(wadah, aktif, onPilih) {
  wadah.innerHTML = "";
  [{ nama: "Semua", ikon: "✨" }, ...kategoriData].forEach((k) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (k.nama === aktif ? " active" : "");
    b.textContent = `${k.ikon} ${k.nama}`;
    b.addEventListener("click", () => onPilih(k.nama));
    wadah.appendChild(b);
  });
}

function renderDaftarUmkm() {
  const wadah = $("#umkm-list");
  wadah.innerHTML = "";
  umkmData.forEach((u) => {
    const jumlah = produkData.filter((p) => p.umkmId === u.id).length;
    const el = document.createElement("article");
    el.className = "umkm-card";
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.style.setProperty("--umkm-warna", u.warna);
    el.innerHTML = `
      <div class="umkm-banner"><span>${u.ikon}</span><span>${u.ikon}</span><span>${u.ikon}</span></div>
      <div class="umkm-body">
        <div class="umkm-logo"></div>
        <div class="umkm-text"><h3></h3><p></p></div>
      </div>
      <span class="umkm-link">Lihat produk →</span>`;
    isiLogo(el.querySelector(".umkm-logo"), u);
    el.querySelector("h3").textContent = u.nama;
    el.querySelector("p").textContent = `📍 ${u.lokasi} · ${jumlah} produk`;

    const buka = () => tampilkanKatalog({ kategori: "Semua", umkmId: u.id });
    el.addEventListener("click", buka);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        buka();
      }
    });
    wadah.appendChild(el);
  });
}

/* ---------- BERANDA ---------- */
function tampilkanBeranda() {
  renderChips($("#hero-chips"), null, (k) => tampilkanKatalog({ kategori: k, umkmId: null }));
  renderDaftarProduk("#featured-list", produkData.slice(0, 8));
  renderDaftarUmkm();
  tampilkanView("home");
}

/* ---------- CARI MAKANAN ---------- */
function prosesPencarian(kataKunci) {
  kataKunciAktif = kataKunci.trim();
  const kunci = kataKunci.trim().toLowerCase();
  const hasil = produkData.filter((p) => {
    const umkm = getUmkm(p.umkmId);
    return (
      p.nama.toLowerCase().includes(kunci) ||
      p.deskripsi.toLowerCase().includes(kunci) ||
      (p.kategori || "").toLowerCase().includes(kunci) ||
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
  simpanSnapshot(); // agar tombol Kembali memulihkan hasil pencarian ini
}

function resetPencarian() {
  kataKunciAktif = "";
  $("#keyword").value = "";
  $("#search-info").hidden = true;
  $("#not-found").hidden = true;
  $("#search-results").innerHTML = "";
}

/* ---------- LIHAT KATALOG ---------- */
function daftarKatalogTerfilter() {
  const hasil = produkData.filter(
    (p) =>
      (filterKatalog.kategori === "Semua" || p.kategori === filterKatalog.kategori) &&
      (filterKatalog.umkmId === null || p.umkmId === filterKatalog.umkmId)
  );
  if (filterKatalog.urut === "termurah") hasil.sort((a, b) => a.harga - b.harga);
  else if (filterKatalog.urut === "termahal") hasil.sort((a, b) => b.harga - a.harga);
  else if (filterKatalog.urut === "nama") hasil.sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  return hasil;
}

function renderKatalog() {
  renderChips($("#catalog-chips"), filterKatalog.kategori, (k) => {
    filterKatalog.kategori = k;
    renderKatalog();
    simpanSnapshot();
  });
  $("#catalog-sort").value = filterKatalog.urut;

  const tag = $("#catalog-umkm-tag");
  if (filterKatalog.umkmId !== null) {
    tag.hidden = false;
    $("#catalog-umkm-nama").textContent = getUmkm(filterKatalog.umkmId)?.nama || "";
  } else {
    tag.hidden = true;
  }

  const daftar = daftarKatalogTerfilter();
  $("#catalog-count").textContent = `${daftar.length} produk`;
  $("#catalog-empty").hidden = daftar.length > 0;
  renderDaftarProduk("#catalog-list", daftar);
}

// opsi (opsional) mengubah filter; tanpa opsi, filter terakhir dipertahankan
function tampilkanKatalog(opsi) {
  if (opsi) Object.assign(filterKatalog, opsi);
  renderKatalog();
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

  isiFoto($("#detail-photo"), p);
  $("#detail-cat").textContent = p.kategori || "";
  $("#detail-cat").hidden = !p.kategori;
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
    jumlahSetelahLogin = ambilJumlah();
    bukaHalamanLogin("Masuk dulu untuk memesan produk ini.");
    return;
  }

  const p = produkTerpilih;
  const umkm = getUmkm(p.umkmId);
  const jumlah = ambilJumlah();
  const namaPemesan = currentProfile?.nama || currentUser.email;
  const pesan = [
    `Halo ${umkm.nama}, saya ingin memesan:`,
    "",
    `Produk : ${p.nama}`,
    `Jumlah : ${jumlah}`,
    `Harga  : ${rupiah(p.harga)} /item`,
    `Total  : ${rupiah(p.harga * jumlah)}`,
    "",
    `Atas nama: ${namaPemesan}`,
    "Apakah pesanan ini masih tersedia? Terima kasih "
  ].join("\n");
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
    if (viewAktif === "view-login") {
      const tujuan = viewSetelahLogin;
      viewSetelahLogin = null;

      if (tujuan && history.state?.snap?.view === "login" && (history.state?.idx ?? 0) > 0) {
        // Kembali ke halaman sebelum login (produk tadi) lewat riwayat,
        // jadi halaman login tidak menumpuk di riwayat.
        history.back();
      } else {
        // Halaman login digantikan, bukan ditumpuk
        gantiEntri = true;
        if (tujuan) tampilkanView(tujuan);
        else if (isManager()) bukaDashboard();
        else tampilkanBeranda();
        gantiEntri = false;
      }
    }
  } else if (viewAktif === "view-dashboard") {
    // Setelah keluar: tutup halaman yang butuh login/role
    gantiEntri = true;
    tampilkanBeranda();
    gantiEntri = false;
  }
}

/* =========================================================
   DASHBOARD MANAJER
   ========================================================= */
let grafikHarian = null;
let grafikUmkm = null;

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

/* ----- Grafik (Chart.js) ----- */
const kunciHari = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD (waktu lokal)

function singkatRupiah(v) {
  if (v >= 1000000) return v / 1000000 + " jt";
  if (v >= 1000) return v / 1000 + " rb";
  return v;
}

function gambarGrafik(orders, hari, umkmMentah) {
  const grid = $("#chart-grid");
  if (!window.Chart) {
    grid.hidden = true;
    return;
  }
  grid.hidden = false;

  Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
  Chart.defaults.color = "#7a6f66";

  // ----- Nilai pembelian per hari -----
  const perHari = new Map();
  orders.forEach((o) => {
    const k = kunciHari(new Date(o.created_at));
    perHari.set(k, (perHari.get(k) || 0) + o.harga * o.jumlah);
  });

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  let mulai = new Date(hariIni);
  if (hari > 0) {
    mulai.setDate(mulai.getDate() - (hari - 1));
  } else if (orders.length) {
    mulai = new Date(Math.min(...orders.map((o) => new Date(o.created_at).getTime())));
    mulai.setHours(0, 0, 0, 0);
  }

  const label = [];
  const nilai = [];
  for (let d = new Date(mulai); d <= hariIni; d.setDate(d.getDate() + 1)) {
    label.push(d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }));
    nilai.push(perHari.get(kunciHari(d)) || 0);
  }

  if (grafikHarian) grafikHarian.destroy();
  grafikHarian = new Chart($("#chart-daily"), {
    type: "line",
    data: {
      labels: label,
      datasets: [{
        label: "Nilai pembelian",
        data: nilai,
        borderColor: "#e8590c",
        backgroundColor: "rgba(232, 89, 12, 0.12)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: label.length > 45 ? 0 : 3,
        pointBackgroundColor: "#e8590c"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => rupiah(c.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { beginAtZero: true, ticks: { callback: singkatRupiah }, grid: { color: "#f5ebdf" } }
      }
    }
  });

  // ----- Nilai per UMKM -----
  const palet = ["#e8590c", "#2f9e44", "#fcc419", "#7950f2", "#1c7ed6", "#e64980"];
  if (grafikUmkm) grafikUmkm.destroy();
  grafikUmkm = new Chart($("#chart-umkm"), {
    type: "bar",
    data: {
      labels: umkmMentah.map((r) => r.label),
      datasets: [{
        data: umkmMentah.map((r) => r.nilai),
        backgroundColor: umkmMentah.map((_, i) => palet[i % palet.length]),
        borderRadius: 8,
        maxBarThickness: 34
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => rupiah(c.parsed.x) } }
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: singkatRupiah }, grid: { color: "#f5ebdf" } },
        y: { grid: { display: false } }
      }
    }
  });
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

  const umkmMentah = kelompokkan(
    (o) => o.umkm_id,
    (o) => getUmkm(o.umkm_id)?.nama || `UMKM #${o.umkm_id}`
  );
  const perUmkm = umkmMentah.map((r) => barisAngka([r.label, r.trx, r.item, rupiah(r.nilai)], [1, 2, 3]));

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

  // Tampilkan dulu agar grafik mendapat ukuran yang benar
  $("#dash-content").hidden = false;
  gambarGrafik(orders, hari, umkmMentah);
}

/* ---------- EVENT LISTENER ---------- */
function pasangEvent() {
  $$("[data-view]").forEach((el) => {
    el.addEventListener("click", () => {
      const tujuan = el.dataset.view;
      if (tujuan === "home") tampilkanBeranda();
      else if (tujuan === "catalog") tampilkanKatalog({ kategori: "Semua", umkmId: null });
      else if (tujuan === "search") { resetPencarian(); tampilkanView("search"); $("#keyword").focus(); }
      else if (tujuan === "login") { viewSetelahLogin = null; bukaHalamanLogin(); }
      else if (tujuan === "dashboard") bukaDashboard();
    });
  });

  $("#brand-link").addEventListener("click", (e) => {
    e.preventDefault();
    tampilkanBeranda();
  });

  // Pencarian di hero
  $("#hero-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const kunci = $("#hero-keyword").value.trim();
    if (!kunci) {
      tampilkanKatalog({ kategori: "Semua", umkmId: null });
      return;
    }
    resetPencarian();
    $("#keyword").value = kunci;
    tampilkanView("search");
    prosesPencarian(kunci);
    $("#hero-keyword").value = "";
  });

  // Carousel makanan pilihan
  const geser = (arah) =>
    $("#featured-list").scrollBy({ left: arah * 520, behavior: "smooth" });
  $("#car-prev").addEventListener("click", () => geser(-1));
  $("#car-next").addEventListener("click", () => geser(1));

  // Pencarian
  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const kunci = $("#keyword").value;
    if (kunci.trim() !== "") prosesPencarian(kunci);
  });
  $("#not-found-back").addEventListener("click", tampilkanBeranda);

  // Katalog
  $("#catalog-sort").addEventListener("change", (e) => {
    filterKatalog.urut = e.target.value;
    renderKatalog();
    simpanSnapshot();
  });
  $("#catalog-umkm-clear").addEventListener("click", () => {
    filterKatalog.umkmId = null;
    renderKatalog();
    simpanSnapshot();
  });

  // Tombol kembali (web) + tombol back browser/HP
  $("#btn-back").addEventListener("click", kembali);
  window.addEventListener("popstate", (e) => pulihkan(e.state?.snap));

  // Detail produk
  $("#btn-wa").addEventListener("click", bukaWhatsApp);
  $("#btn-back-catalog").addEventListener("click", () => tampilkanKatalog());
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

  // Titik awal riwayat: selalu mulai dari Beranda (juga setelah refresh)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  history.replaceState({ idx: 0, snap: { view: "home" } }, "");
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
