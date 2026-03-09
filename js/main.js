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
// 4️⃣ Rekod Kehadiran Harian Murid - main.js
// ================================

// 1️⃣ Setup form for Google Sheets
setupForm("murid-form", "rekodKehadiranMurid", [
  { id: "teacher-select" },
  { id: "date-input" },
  { id: "class-select" },
  { id: "notes-input" },
  { 
    id: "students-list",
    type: "checkbox-list",
    getValue: () => {
      const studentDivs = document.querySelectorAll("#students-list .student-row");
      const attendance = {};
      studentDivs.forEach((div, index) => {
        attendance[index] = div.dataset.status || "absent"; // default absent
      });
      return JSON.stringify(attendance);
    }
  }
]);

// 2️⃣ Populate students when class changes
const classSelect = document.getElementById("class-select");
const studentsContainer = document.getElementById("students-container");
const studentsListDiv = document.getElementById("students-list");
const noClassMessage = document.getElementById("no-class-message");
const totalStudentsCount = document.getElementById("total-students-count");
const presentCount = document.getElementById("present-count");
const markAllPresentBtn = document.getElementById("mark-all-present");
const markAllAbsentBtn = document.getElementById("mark-all-absent");

classSelect.addEventListener("change", () => {
  const selectedClass = classSelect.value;
  if (!selectedClass || !studentLists[selectedClass]) {
    studentsContainer.classList.add("hidden");
    noClassMessage.classList.remove("hidden");
    return;
  }

  studentsListDiv.innerHTML = "";
  studentLists[selectedClass].forEach(name => {
    const div = document.createElement("div");
    div.classList.add("student-row", "flex", "items-center", "justify-between", "p-2", "rounded-lg", "bg-gray-900/50");
    div.dataset.status = "absent";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "❌"; // default absent
    toggleBtn.classList.add("px-3", "py-1", "rounded-lg", "bg-red-900/30", "text-red-400", "hover:bg-red-900/50");
    toggleBtn.addEventListener("click", () => {
      if (div.dataset.status === "present") {
        div.dataset.status = "absent";
        toggleBtn.textContent = "❌";
        toggleBtn.classList.replace("bg-green-900/30", "bg-red-900/30");
        toggleBtn.classList.replace("text-green-400", "text-red-400");
      } else {
        div.dataset.status = "present";
        toggleBtn.textContent = "✅";
        toggleBtn.classList.replace("bg-red-900/30", "bg-green-900/30");
        toggleBtn.classList.replace("text-red-400", "text-green-400");
      }
      updateCounts();
    });

    div.appendChild(nameSpan);
    div.appendChild(toggleBtn);
    studentsListDiv.appendChild(div);
  });

  totalStudentsCount.textContent = studentLists[selectedClass].length;
  studentsContainer.classList.remove("hidden");
  noClassMessage.classList.add("hidden");
  updateCounts();
});

// 3️⃣ Mark All Present / Absent buttons
markAllPresentBtn.addEventListener("click", () => {
  document.querySelectorAll("#students-list .student-row").forEach(div => {
    div.dataset.status = "present";
    const btn = div.querySelector("button");
    btn.textContent = "✅";
    btn.classList.replace("bg-red-900/30", "bg-green-900/30");
    btn.classList.replace("text-red-400", "text-green-400");
  });
  updateCounts();
});

markAllAbsentBtn.addEventListener("click", () => {
  document.querySelectorAll("#students-list .student-row").forEach(div => {
    div.dataset.status = "absent";
    const btn = div.querySelector("button");
    btn.textContent = "❌";
    btn.classList.replace("bg-green-900/30", "bg-red-900/30");
    btn.classList.replace("text-green-400", "text-red-400");
  });
  updateCounts();
});

// 4️⃣ Update attendance counts
function updateCounts() {
  const rows = document.querySelectorAll("#students-list .student-row");
  const present = Array.from(rows).filter(r => r.dataset.status === "present").length;
  presentCount.textContent = present;
}

// 5️⃣ Form submit
document.getElementById("murid-form").addEventListener("submit", e => {
  e.preventDefault();
  submitForm("murid-form");
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
