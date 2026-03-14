// ================================
// main.js – Google Sheets Connector for 4 Forms
// ================================

// Paste your Web App URL here (from Apps Script deployment)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbycpdQ8m-a_Gjx2M3dnwXG7tI8ZQ_d0jzhXm-4F9OjGySjkzuHlP9WBIQKhHI-q-FXiyQ/exec";

// Universal function to send row data to Google Sheets
async function sendToGoogleSheet(sheetName, row) {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbygzmRHlrTyMRlejqdlLk93BQ7jMb9jopWTFE9mCYiGccHuuPorhFXkN1VZ5GNOxleoDw/exec", { // replace with your Web App URL
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sheet: sheetName,
        row: row
      })
    });

    if (!response.ok) throw new Error("HTTP error " + response.status);

    const text = await response.text();
    console.log("Google Sheets response:", text);

    return { isOk: true };
  } catch (err) {
    console.error("sendToGoogleSheet error:", err);
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

  await sendToGoogleSheet("rekodKehadiranMurid", row);

  alert("Rekod berjaya disimpan!");
});

// ================================
// 8️⃣ Laporan RMT Murid
// ================================
setupForm("rmt-form", "laporanRMTMurid", [
  { id: "rmt-tarikh" },
  { id: "rmt-guru" },
  { id: "rmt-menu" },
  { id: "rmt-buah" },
  { id: "rmt-ulasan" }
]);

// ================================
// 9️⃣ Laporan RMT Guru
// ================================
setupForm("guru-form", "laporanRMTGuru", [
  { id: "guru-tarikh" },
  { id: "guru-nama" },
  { id: "guru-jumlah" },
  { id: "guru-kelas" },
  { id: "guru-ulasan" }
]);

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

 const response = await fetch("https://script.google.com/macros/s/AKfycbycpdQ8m-a_Gjx2M3dnwXG7tI8ZQ_d0jzhXm-4F9OjGySjkzuHlP9WBIQKhHI-q-FXiyQ/exec", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sheet: "kehadiranKokurikulum", row })
});

const resultText = await response.text();

if (resultText === "Success") {
  alert("Rekod berjaya disimpan!");
} else {
  alert("Ralat: " + resultText);
}
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;
});

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
