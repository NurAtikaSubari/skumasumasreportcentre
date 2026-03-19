// ================================
// main.js – Google Sheets Connector for 4 Forms
// ================================

// Paste your Web App URL here (from Apps Script deployment)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzJ8b2pFnLQmbTq9WNDkE8ZltAikdk5jsTC1mY5NT_xfX_s8dDH2cYWPfdjpR1F_wXI8g/exec";

// Universal function to send row data to Google Sheets
async function sendToGoogleSheet(sheetName, row) {

  try {

    const response = await fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({
        sheet: sheetName,
        row: row
      })
    });

    const result = await response.text();
    console.log(result);

    return { isOk: true };

  } catch (err) {

    console.error(err);
    return { isOk: false, error: err.message };

  }

}
// Generic form setup function
function setupForm(formId, sheetName, fields) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = [];

    for (const field of fields) {
      if (field.type === "radio") {
        const radios = document.getElementsByName(field.id);
        const checked = Array.from(radios).find((r) => r.checked);
        row.push(checked ? checked.value : "");
      } else {
        const input = document.getElementById(field.id);
        row.push(input ? input.value : "");
      }
    }

    // Append timestamp
    row.push(new Date());

    // Send to Google Sheets
    await sendToGoogleSheet(sheetName, row);

    // Optional: Reset form
    form.reset();

    alert("Rekod berjaya disimpan!");
  });
}

// ================================
// 1️⃣ Kawalan Kelas Form
// ================================
setupForm("formKawalanKelas", "Kawalan_Kelas", [
  { id: "tarikh" },
  { id: "guru" },
  { id: "kelas" },
  { id: "jumlah" },
  { id: "hadir" },
  { id: "tidak-hadir" },
  { id: "senarai-tidak-hadir" },
]);

// ================================
//  2️⃣ Kawalan Kelas Form
// ================================
setupForm("record-form", "rekodKawalanKelas", [
  { id: "teacher" },
  { id: "subject" },
  { id: "class-select" },
  { id: "date" },
  { id: "student-count" },
  { id: "time-in" },
  { id: "time-out" },
  { id: "discipline-remarks" },
  { id: "remarks" },
]);

// ================================
// 3️⃣ Borang Rekod Pemantauan Sesi PDP
// ================================
setupForm("pemantauanPDPForm", "pemantauanPDP", [
  { id: "nama-pentadbir-pdp" },
  { id: "tarikh-pdp" },
  { id: "masa-pdp" },
  { id: "hari-pdp" },
  { id: "kelas-pdp" },
  { id: "subjek-pdp" },
  { id: "nama-guru-dipantau" },
  { id: "fokus-pemantauan" },
  { id: "gred_pdp", type: "radio" },
  { id: "gred_rph", type: "radio" },
  { id: "gred_buku_latihan", type: "radio" },
  { id: "ulasan-cadangan-pdp" },
]);

// ================================
// 4️⃣ Rekod Kehadiran Harian Murid 
// ================================
document.getElementById("murid-form")?.addEventListener("submit", async function(e){
  e.preventDefault();

  const tarikh = document.getElementById("date-input").value;
  const guru = document.getElementById("teacher-select").value;
  const kelas = document.getElementById("class-select").value;
  const catatan = document.getElementById("notes-input").value || "";

  const students = document.querySelectorAll("#students-list .student-item");

  let jumlahMurid = students.length;
  let hadir = 0;
  let tidakHadir = 0;
  let senaraiTidakHadir = [];

  students.forEach(student => {

    const name = student.innerText.replace("❌","").trim();

    if(student.classList.contains("present")){
      hadir++;
    }
    else if(student.classList.contains("absent")){
      tidakHadir++;
      senaraiTidakHadir.push(name);
    }

  });

  const row = [
    tarikh,
    guru,
    kelas,
    jumlahMurid,
    hadir,
    tidakHadir,
    senaraiTidakHadir.join(", "),
    catatan,
    new Date()
  ];

  // ✅ send to Google Sheets
  await sendToGoogleSheet("rekodKehadiranMurid", row);

  // ✅ reload data AFTER save
  if(typeof loadRekodKehadiranMurid === "function"){
    loadRekodKehadiranMurid();
  }

  alert("Rekod berjaya disimpan!");

});

// ================================
// 4️⃣ Rekod Kehadiran Harian Murid 
// ================================
document.getElementById("murid-form")?.addEventListener("submit", async function(e){
  e.preventDefault();

  const tarikh = document.getElementById("date-input").value;
  const guru = document.getElementById("teacher-select").value;
  const kelas = document.getElementById("class-select").value;
  const catatan = document.getElementById("notes-input").value || "";

  const students = document.querySelectorAll("#students-list .student-item");

  let jumlahMurid = students.length;
  let hadir = 0;
  let tidakHadir = 0;
  let senaraiTidakHadir = [];

  students.forEach(student => {

    const name = student.innerText.replace("❌","").trim();

    if(student.classList.contains("present")){
      hadir++;
    }
    else if(student.classList.contains("absent")){
      tidakHadir++;
      senaraiTidakHadir.push(name);
    }

  });

  const row = [
    tarikh,
    guru,
    kelas,
    jumlahMurid,
    hadir,
    tidakHadir,
    senaraiTidakHadir.join(", "),
    catatan,
    new Date()
  ];

  // ✅ send to Google Sheets
  await sendToGoogleSheet("rekodKehadiranMurid", row);

  // ✅ reload data AFTER save
  if(typeof loadRekodKehadiranMurid === "function"){
    loadRekodKehadiranMurid();
  }

  alert("Rekod berjaya disimpan!");

});

// ================================
// RMT Murid Form
// ================================
setupForm("rmt-form", "laporanRMTMurid", [
  { id: "rmt-tarikh" },
  { id: "rmt-guru" },
  { id: "rmt-menu" },
  { id: "rmt-buah" },
  { id: "rmt-ulasan" }
]);

// ================================
// RMT Guru Form
// ================================
document.getElementById("guru-form")?.addEventListener("submit", async function(e){
  e.preventDefault();

  const guruTarikh = document.getElementById("guru-tarikh")?.value || "";
  const guruNama = document.getElementById("guru-nama")?.value || "";
  const guruJumlah = document.getElementById("guru-jumlah")?.value || "";
  const guruKelas = document.getElementById("guru-kelas")?.value || "";
  const guruUlasan = document.getElementById("guru-ulasan")?.value || "";

  const row = [
    guruTarikh,
    guruNama,
    guruJumlah,
    guruKelas,
    guruUlasan,
    new Date(),
    new Date().getFullYear()
  ];

  const result = await sendToGoogleSheet("laporanRMTGuru", row);

  if(result.isOk){
    alert("Laporan RMT Guru berjaya disimpan!");
    document.getElementById("guru-form").reset();
  } else {
    alert("Ralat: " + result.error);
  }
});

// ================================
// RMT Laporan – Murid + Guru (Fixed Definitive)
// ================================

// Cache the data to avoid losing it
let cachedRMTMurid = [];
let cachedRMTGuru = [];

// Fetch RMT data once
async function loadRMTData() {
  const container = document.getElementById("laporan-container");
  if (!container) return;

  container.innerHTML = "Memuatkan laporan...";

  try {
    const [muridRes, guruRes] = await Promise.all([
      fetch(`${SHEET_URL}?sheet=laporanRMTMurid`),
      fetch(`${SHEET_URL}?sheet=laporanRMTGuru`)
    ]);

    const muridJson = await muridRes.json();
    const guruJson = await guruRes.json();

    cachedRMTMurid = muridJson.result === "success" ? muridJson.data.slice(1) : [];
    cachedRMTGuru = guruJson.result === "success" ? guruJson.data.slice(1) : [];

    renderRMT("semua"); // Show all by default
  } catch (err) {
    console.error(err);
    container.innerHTML = "Gagal memuatkan laporan";
  }
}

// Render RMT by type
function renderRMT(type) {
  const container = document.getElementById("laporan-container");
  if (!container) return;

  let html = "";

  if (type === "rmt-murid" || type === "semua") {
    cachedRMTMurid.forEach(row => {
      html += `
        <div class="glass-card rounded-xl p-5 mb-4 laporan-item">
          <p><strong>📌 Jenis:</strong> RMT Murid</p>
          <p><strong>📅 Tarikh:</strong> ${row[0]}</p>
          <p><strong>👨‍🏫 Guru:</strong> ${row[1]}</p>
          <p><strong>🍚 Menu:</strong> ${row[2]}</p>
          <p><strong>🍎 Buah:</strong> ${row[3]}</p>
          <p><strong>💭 Ulasan:</strong> ${row[4] || "-"}</p>
        </div>
      `;
    });
  }

  if (type === "rmt-guru" || type === "semua") {
    cachedRMTGuru.forEach(row => {
      html += `
        <div class="glass-card rounded-xl p-5 mb-4 laporan-item">
          <p><strong>📌 Jenis:</strong> RMT Guru</p>
          <p><strong>📅 Tarikh:</strong> ${row[0]}</p>
          <p><strong>👨‍🏫 Guru:</strong> ${row[1]}</p>
          <p><strong>👥 Jumlah:</strong> ${row[2]}</p>
          <p><strong>🏫 Kelas:</strong> ${row[3]}</p>
          <p><strong>💭 Ulasan:</strong> ${row[4] || "-"}</p>
        </div>
      `;
    });
  }

  if (html === "") html = "Tiada laporan ditemui";

  container.innerHTML = html;
}

// Tab buttons
document.getElementById("tab-semua")?.addEventListener("click", () => renderRMT("semua"));
document.getElementById("tab-rmt-murid")?.addEventListener("click", () => renderRMT("rmt-murid"));
document.getElementById("tab-rmt-guru")?.addEventListener("click", () => renderRMT("rmt-guru"));

// INITIAL LOAD
loadRMTData();

// ================================
// 6️⃣ Borang Perjumpaan Mingguan
// ================================
document.getElementById("meetingForm")?.addEventListener("submit", async function(e){

  e.preventDefault();

  const meetingNumber = document.getElementById("meetingNumber")?.value || "";
  const meetingDate = document.getElementById("meetingDate")?.value || "";
  const meetingPlace = document.getElementById("meetingPlace")?.value || "";

  const uniformBody = document.getElementById("uniformBody")?.value || "";
  const clubAssociation = document.getElementById("clubAssociation")?.value || "";
  const sportsGames = document.getElementById("sportsGames")?.value || "";

  const meetingTime = document.getElementById("meetingTime")?.value || "";
  const studentAttendance = document.getElementById("studentAttendance")?.value || "";

  const meetingTitle = document.getElementById("meetingTitle")?.value || "";
  const meetingValues = document.getElementById("meetingValues")?.value || "";
  const meetingActivity = document.getElementById("meetingActivity")?.value || "";
  const meetingReflection = document.getElementById("meetingReflection")?.value || "";

  // Collect teachers (up to 10)
  const teachers = [];
  const teacherSelects = document.querySelectorAll("#teacherContainer select");

  teacherSelects.forEach(select => {
    if(select.value){
      teachers.push(select.value);
    }
  });

  // PIKeBM section
  const pikebmTiming = document.getElementById("pikebmTiming")?.value || "";
  const pikebmTitle = document.getElementById("pikebmTitle")?.value || "";
  const pikebmTeachingAids = document.getElementById("pikebmTeachingAids")?.value || "";
  const pikebmObjective = document.getElementById("pikebmObjective")?.value || "";
  const pikebmSteps = document.getElementById("pikebmSteps")?.value || "";
  const pikebmReflection = document.getElementById("pikebmReflection")?.value || "";

  // Civic section
  const civicValue = document.getElementById("civicValue")?.value || "";
  const civicTheme = document.getElementById("civicTheme")?.value || "";
  const civicGoal = document.getElementById("civicGoal")?.value || "";
  const civicActivity = document.getElementById("civicActivity")?.value || "";
  const civicSuggestion = document.getElementById("civicSuggestion")?.value || "";

  const row = [
    meetingNumber,
    meetingDate,
    meetingPlace,
    uniformBody,
    clubAssociation,
    sportsGames,
    meetingTime,
    studentAttendance,
    teachers.join(", "),
    meetingTitle,
    meetingValues,
    meetingActivity,
    meetingReflection,
    pikebmTiming,
    pikebmTitle,
    pikebmTeachingAids,
    pikebmObjective,
    pikebmSteps,
    pikebmReflection,
    civicValue,
    civicTheme,
    civicGoal,
    civicActivity,
    civicSuggestion,
    new Date(),
    new Date().getFullYear()
  ];

  const result = await sendToGoogleSheet("perjumpaanMingguan", row);

  if(result.isOk){
    alert("Laporan Perjumpaan Mingguan berjaya disimpan!");
    document.getElementById("meetingForm").reset();
  } else {
    alert("Ralat: " + result.error);
  }

});

async function loadPerjumpaanMingguan() {
  const container = document.getElementById("meeting-report-container");
  if (!container) return;

  container.innerHTML = "Memuatkan laporan...";

  try {
    const res = await fetch(`${SHEET_URL}?sheet=perjumpaanMingguan`);
    const json = await res.json();

    if (json.result !== "success") {
      container.innerHTML = "Gagal load data";
      return;
    }

    const rows = json.data.slice(1);

    let html = "";

    rows.forEach(row => {
      html += `
        <div class="glass-card p-5 mb-4 rounded-xl">
          <p><strong>📅 Tarikh:</strong> ${row[1]}</p>
          <p><strong>📍 Tempat:</strong> ${row[2]}</p>
          <p><strong>👨‍🏫 Guru:</strong> ${row[8]}</p>
          <p><strong>📘 Tajuk:</strong> ${row[9]}</p>
          <p><strong>📝 Aktiviti:</strong> ${row[11]}</p>
          <p><strong>💭 Refleksi:</strong> ${row[12]}</p>
        </div>
      `;
    });

    container.innerHTML = html || "Tiada laporan";

  } catch (err) {
    console.error(err);
    container.innerHTML = "Ralat loading";
  }
}

// ================================
// 2️⃣ Kehadiran Kokurikulum Form
// ================================
document.getElementById("attendance-form")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submit-btn");
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Menyimpan...";

  const namaGuru = document.getElementById("nama-guru")?.value || "";
  const tarikh = document.getElementById("tarikh")?.value || "";
  const perjumpaan = document.getElementById("perjumpaan")?.value || "";
  const kategori = document.getElementById("kategori")?.value || "";
  const aktiviti = document.getElementById("aktiviti")?.value || "";

  const students = document.querySelectorAll("#student-list input[type='checkbox']");
  const jumlah = students.length;
  let hadir = 0;
  let tidakHadir = 0;
  const senaraiTidakHadir = [];

  students.forEach(student => {
    const name = student.value || student.dataset.name || "Murid";
    if (student.checked) {
      hadir++;
    } else {
      tidakHadir++;
      senaraiTidakHadir.push(name);
    }
  });

  const row = [
    namaGuru,
    tarikh,
    perjumpaan,
    kategori,
    aktiviti,
    jumlah,
    hadir,
    tidakHadir,
    senaraiTidakHadir.join(", "),
    new Date().toLocaleString(),
    new Date().getFullYear()
  ];

  // Use the universal function
  const result = await sendToGoogleSheet("kehadiranKokurikulum", row);

  if (result.isOk) {
    alert("Rekod berjaya disimpan!");
  } else {
    alert("Ralat: " + result.error);
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;
});

// ================================
// LOAD Kehadiran Kokurikulum (MATCHED)
// ================================
async function loadKehadiranKokurikulum() {

  try {

    const res = await fetch(`${SHEET_URL}?sheet=kehadiranKokurikulum`);
    const json = await res.json();

    if (json.result !== "success") {
      console.error("Gagal load:", json.message);
      return;
    }

    const data = json.data;

    if (!data || data.length <= 1) {
      renderReportsTable([]);
      return;
    }

    // buang header
    const rows = data.slice(1);

    const formatted = rows.map((row, index) => {

      // IMPORTANT: match EXACT column index
      return {
        __backendId: index.toString(),

        nama_guru: row[0],
        tarikh: row[1],
        perjumpaan: parseInt(row[2]) || 0,
        kategori: row[3],
        aktiviti: row[4],
        jumlah_hadir: row[6],   // HADIR (bukan jumlah!)
        
        // you did NOT store hadir list → leave empty
        murid_hadir: "",

        created_at: row[9]
      };

    });

    // global (for view/delete)
    allReportsData = formatted;

    // display
    renderReportsTable(formatted);

  } catch (err) {
    console.error("Error load:", err);
  }

}

// ================================
// 3️⃣ Pencapaian Murid Form
// ================================
document.getElementById("achievementForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const tarikh = document.getElementById("tarikh")?.value || "";
  const penganjur = document.getElementById("penganjur")?.value || "";
  const pencapaian = document.getElementById("pencapaian")?.value || "";
  const peringkat = document.getElementById("peringkat")?.value || "";

  const guru = [];
  for (let i = 1; i <= 10; i++) {
    guru.push(document.getElementById(`guru${i}`)?.value || "");
  }

  const murid = [];
  for (let i = 1; i <= 10; i++) {
    murid.push(document.getElementById(`murid${i}`)?.value || "");
  }

  const row = [
    tarikh,
    penganjur,
    pencapaian,
    peringkat,
    ...guru,
    ...murid,
    new Date(),
    new Date().getFullYear()
  ];

  await sendToGoogleSheet("pencapaianMurid", row);

  alert("Rekod berjaya disimpan!");
  document.getElementById("achievementForm").reset();
});

// ================================
// 4️⃣ Pemantauan PDP – GB/PKanan Form
// ================================
setupForm("laporanGBPKForm", "laporanGBPK", [
  { id: "nama-pemantau" },
  { id: "tarikh-gbpk" },
  { id: "hari-gbpk" },
  { id: "masa-gbpk" },
  { id: "soalan_1", type: "radio" },
  { id: "soalan_2", type: "radio" },
  { id: "soalan_3", type: "radio" },
  { id: "soalan_4", type: "radio" },
  { id: "soalan_5", type: "radio" },
  { id: "soalan_6", type: "radio" },
  { id: "soalan_7", type: "radio" },
  { id: "soalan_8", type: "radio" },
  { id: "soalan_9", type: "radio" },
  { id: "soalan_10", type: "radio" },
  { id: "soalan_11", type: "radio" },
  { id: "soalan_12", type: "radio" },
]);

// Fetch all Laporan GB/PKanan from Google Sheets
async function loadLaporanGBPK() {

  const container = document.getElementById("laporan-gbpk-container");
  container.innerHTML = "Memuatkan rekod...";

  try {

    const res = await fetch(`${SHEET_URL}?sheet=laporanGBPK`);
    const json = await res.json();

    if(json.result !== "success"){
      container.innerHTML = "Ralat memuatkan rekod: " + json.message;
      return;
    }

    const data = json.data;

    if(!data || data.length <= 1){
      container.innerHTML = "Tiada rekod ditemui.";
      return;
    }

    let html = `
      <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-600 text-sm">
    `;

    // Header
    html += "<tr class='bg-gray-700 text-yellow-400'>";

    data[0].forEach(header=>{
      html += `<th class="px-4 py-2 border border-gray-600">${header}</th>`;
    });

    html += "</tr>";

    // Rows
    for(let i=1;i<data.length;i++){

      html += "<tr class='bg-gray-800 text-white'>";

      data[i].forEach(cell=>{
        html += `<td class="px-4 py-2 border border-gray-600">${cell}</td>`;
      });

      html += "</tr>";

    }

    html += "</table></div>";

    container.innerHTML = html;

  } catch(err){

    console.error(err);
    container.innerHTML = "Ralat memuatkan rekod: " + err.message;

  }

}

// Load when user switches to "Lihat Laporan" tab
function switchTabGBPK(tab){
  const tambah = document.getElementById("content-tambah-gbpk");
  const lihat = document.getElementById("content-lihat-gbpk");
  const tabTambahBtn = document.getElementById("tab-tambah-gbpk");
  const tabLihatBtn = document.getElementById("tab-lihat-gbpk");

  if(tab === "tambah"){
    tambah.classList.remove("hidden");
    lihat.classList.add("hidden");
    tabTambahBtn.classList.add("text-yellow-400", "border-yellow-400");
    tabLihatBtn.classList.remove("text-yellow-400", "border-yellow-400");
  } else if(tab === "lihat"){
    tambah.classList.add("hidden");
    lihat.classList.remove("hidden");
    tabLihatBtn.classList.add("text-yellow-400", "border-yellow-400");
    tabTambahBtn.classList.remove("text-yellow-400", "border-yellow-400");

    // Load records from Google Sheets
    loadLaporanGBPK();
  }
}
