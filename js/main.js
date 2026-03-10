// ==========================================
// main.js – Google Sheets Connector for All Forms
// ==========================================

// Your Web App URL from Apps Script deployment
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxGjDCPayz4JeAsceC_RwsU1VB555z0_4TGZe7nnQFjroWOY-NiXJtOKQE5Mm1nwR3r7Q/exec";

// Send a row to Google Sheets
async function sendToGoogleSheet(sheetName, row) {
  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet: sheetName, row: row }),
    });
    const data = await res.json();
    if (data.status !== "success") {
      console.error("Google Sheets error:", data.message);
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error sending data to Google Sheet:", err);
    alert("Error sending data. Check console.");
  }
}

// Universal form setup
function setupForm(formId, sheetName, fields) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = [];

    for (const field of fields) {
      if (field.type === "radio") {
        const radios = document.getElementsByName(field.id);
        const checked = Array.from(radios).find(r => r.checked);
        row.push(checked ? checked.value : "");
      } else {
        const input = document.getElementById(field.id);
        row.push(input ? input.value : "");
      }
    }

    row.push(new Date()); // Timestamp

    await sendToGoogleSheet(sheetName, row);
    form.reset();
    alert("Rekod berjaya disimpan!");
  });
}

// ==========================
// Example: Setup all forms
// ==========================

// 1️⃣ Kawalan Kelas
setupForm("formKawalanKelas", "Kawalan_Kelas", [
  { id: "tarikh" },
  { id: "guru" },
  { id: "kelas" },
  { id: "jumlah" },
  { id: "hadir" },
  { id: "tidak-hadir" },
  { id: "senarai-tidak-hadir" },
]);

// 2️⃣ Rekod Kehadiran Murid (dynamic list)
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
    } else if(student.classList.contains("absent")){
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

// 3️⃣ RMT Murid
setupForm("rmt-form", "laporanRMTMurid", [
  { id: "rmt-tarikh" },
  { id: "rmt-guru" },
  { id: "rmt-menu" },
  { id: "rmt-buah" },
  { id: "rmt-ulasan" }
]);

// 4️⃣ RMT Guru
setupForm("guru-form", "laporanRMTGuru", [
  { id: "guru-tarikh" },
  { id: "guru-nama" },
  { id: "guru-jumlah" },
  { id: "guru-kelas" },
  { id: "guru-ulasan" }
]);
