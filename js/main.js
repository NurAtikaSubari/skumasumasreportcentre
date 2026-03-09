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
// ================================
// main.js - Rekod Kehadiran Murid
// ================================

const teachers = ["A'in Fhatin Hanani binti Rijan", "Guru 2", "Guru 3"]; // add all teachers here

const studentLists = {
  "Prasekolah Exora": ["Murid A", "Murid B"], // fill all classes
  "5 Inovatif": ["ADAM BIN MOHAMMAD", "AFFIQ HAKIMI BIN HERWIN", "AHMAD AL AIDIL BIN AHMAD SHARIZAL"]
  // ... fill rest as in your HTML
};

const teacherSelect = document.getElementById("teacher-select");
teachers.forEach(g => {
  const opt = document.createElement("option");
  opt.value = g; opt.textContent = g;
  teacherSelect.appendChild(opt);
});

const classSelect = document.getElementById("class-select");
const studentsContainer = document.getElementById("students-container");
const studentsListEl = document.getElementById("students-list");
const noClassMessage = document.getElementById("no-class-message");
const presentCountEl = document.getElementById("present-count");
const totalStudentsCountEl = document.getElementById("total-students-count");
const recordsTable = document.getElementById("records-table");
const notesInput = document.getElementById("notes-input");

let currentClass = "";
let studentCheckboxes = [];

// Display students when class is selected
classSelect.addEventListener("change", () => {
  currentClass = classSelect.value;
  const students = studentLists[currentClass] || [];
  studentsListEl.innerHTML = "";
  studentCheckboxes = [];
  if(students.length === 0){
    studentsContainer.classList.add("hidden");
    noClassMessage.classList.remove("hidden");
    return;
  }
  studentsContainer.classList.remove("hidden");
  noClassMessage.classList.add("hidden");

  students.forEach((name, idx) => {
    const div = document.createElement("div");
    div.className = "student-item border p-2 rounded-lg flex justify-between items-center";
    div.innerHTML = `
      <span>${name}</span>
      <input type="checkbox" data-idx="${idx}" class="present-checkbox" />
    `;
    studentsListEl.appendChild(div);
    studentCheckboxes.push(div.querySelector("input"));
  });

  updateCounts();
});

// Update Hadir / Total counts
function updateCounts(){
  let present = 0;
  studentCheckboxes.forEach(cb => { if(cb.checked) present++; });
  presentCountEl.textContent = present;
  totalStudentsCountEl.textContent = studentCheckboxes.length;
}

// Mark all present / absent
document.getElementById("mark-all-present").addEventListener("click", () => {
  studentCheckboxes.forEach(cb => cb.checked = true);
  updateCounts();
});
document.getElementById("mark-all-absent").addEventListener("click", () => {
  studentCheckboxes.forEach(cb => cb.checked = false);
  updateCounts();
});

// Update counts on individual checkbox click
studentsListEl.addEventListener("change", (e) => {
  if(e.target.matches("input.present-checkbox")){
    updateCounts();
  }
});

// Submit form
function submitKehadiranMurid(e){
  e.preventDefault();
  const teacher = teacherSelect.value;
  const date = document.getElementById("date-input").value;
  const notes = notesInput.value;
  const students = studentLists[currentClass] || [];

  if(!teacher || !date || !currentClass) return alert("Sila lengkapkan borang!");

  const presentStudents = [];
  const absentStudents = [];
  studentCheckboxes.forEach((cb, idx) => {
    if(cb.checked) presentStudents.push(students[idx]);
    else absentStudents.push(students[idx]);
  });

  const record = {
    Tarikh: date,
    Guru: teacher,
    Kelas: currentClass,
    Catatan: notes,
    Jumlah: students.length,
    Hadir: presentStudents.length,
    "T.Hadir": absentStudents.join(", ")
  };

  addRecordToTable(record);
  saveRecordToGoogleSheet(record);
  alert("Rekod berjaya disimpan!");
}

// Add record to table
function addRecordToTable(record){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${record.Tarikh}</td>
    <td>${record.Guru}</td>
    <td>${record.Kelas}</td>
    <td class="text-center">${record.Jumlah}</td>
    <td class="text-center">${record.Hadir}</td>
    <td class="text-center">${record["T.Hadir"]}</td>
    <td class="text-center">-</td>
  `;
  recordsTable.appendChild(tr);
}

// Save to Google Sheets (replace with your function)
function saveRecordToGoogleSheet(record){
  // Example placeholder for Google Sheets API
  // You can adapt your previous setup here
  console.log("Saving to Google Sheet:", record);
}

// Update counts when checkboxes change
studentsListEl.addEventListener("change", updateCounts);

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
