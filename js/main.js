// ================================
// main.js – Google Sheets Connector for 4 Forms
// ================================

// Paste your Web App URL here (from Apps Script deployment)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz1tLniAcnIA046zDVU8Sczvxi3fZ5HK-zD3FGgzQtYDPEyUTyA5tz4QMM4ro2Upln9KQ/exec";

// Universal function to send row data to Google Sheets
async function sendToGoogleSheet(sheetName, row) {
  try {
    await fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({ sheet: sheetName, row: row }),
    });
  } catch (err) {
    console.error("Error sending data to Google Sheet:", err);
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
const SHEET_HEADERS = [
  "Tarikh",
  "Guru",
  "Kelas",
  "Catatan",
  "Hadir",
  "Jumlah Tidak Hadir",
  "Senarai Tidak Hadir"
];

// ----------------------------
// 2️⃣ Function to gather attendance
// ----------------------------
function getAttendanceData() {
  const date = document.getElementById("date-input").value;
  const teacher = document.getElementById("teacher-select").value;
  const kelas = document.getElementById("class-select").value;
  const notes = document.getElementById("notes-input").value;

  // Students container
  const studentElements = document.querySelectorAll("#students-list .student-item");
  
  let hadirCount = 0;
  let absentCount = 0;
  let absentNames = [];

  studentElements.forEach(student => {
    const name = student.dataset.name; // ensure each student-item has data-name
    if (student.classList.contains("present")) {
      hadirCount++;
    } else {
      absentCount++;
      absentNames.push(name);
    }
  });

  return {
    Tarikh: date,
    Guru: teacher,
    Kelas: kelas,
    Catatan: notes,
    Hadir: hadirCount,
    "Jumlah Tidak Hadir": absentCount,
    "Senarai Tidak Hadir": absentNames.join(", ")
  };
}

// ----------------------------
// 3️⃣ Save to Google Sheets
// ----------------------------
// Assumes you have set up your Sheets API or firebase 'dataSdk' object
async function saveAttendance() {
  const rowData = getAttendanceData();
  try {
    await window.dataSdk.save("rekodKehadiranMurid", rowData); // Sheet page name: rekod_kehadiran_murid
    showToast("✅ Rekod berjaya disimpan!");
    updateStats(); // optional, refresh dashboard stats
  } catch (err) {
    console.error(err);
    showToast("❌ Gagal menyimpan rekod. Sila cuba lagi.");
  }
}

// ----------------------------
// 4️⃣ Form submission
// ----------------------------
document.getElementById("murid-form").addEventListener("submit", e => {
  e.preventDefault();
  saveAttendance();
});
// ================================
// 2️⃣ Kehadiran Kokurikulum Form
// ================================
setupForm("formKehadiranKokurikulum", "Kehadiran_Kokurikulum", [
  { id: "tarikh" },
  { id: "guru" },
  { id: "kelas" },
  { id: "jumlah" },
  { id: "hadir" },
  { id: "tidak-hadir" },
  { id: "senarai-tidak-hadir" },
]);

// ================================
// 3️⃣ Pencapaian Murid Form
// ================================
setupForm("formPencapaianMurid", "Pencapaian_Murid", [
  { id: "nama-murid" },
  { id: "subjek" },
  { id: "tarikh" },
  { id: "pencapaian" },
]);

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
