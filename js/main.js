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

  await sendToGoogleSheet("rekodKehadiranMurid", row);

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
async function fetchLaporanGBPK() {
  try {
    // Assuming your Google Apps Script returns JSON array of rows
    const response = await fetch(`${SHEET_URL}?sheet=laporanGBPK`);
    const data = await response.json();

    const container = document.getElementById("laporan-gbpk-container");
    container.innerHTML = ""; // Clear previous content

    if (!data || data.length === 0) {
      container.innerHTML = `<p class="text-gray-400">Tiada rekod ditemui.</p>`;
      return;
    }

    // Render each row as a card
    data.forEach((row, index) => {
      // Adjust index according to your sheet column structure
      const [
        namaPemantau,
        tarikh,
        hari,
        masa,
        soalan_1,
        soalan_2,
        soalan_3,
        soalan_4,
        soalan_5,
        soalan_6,
        soalan_7,
        soalan_8,
        soalan_9,
        soalan_10,
        soalan_11,
        soalan_12,
        timestamp
      ] = row;

      const card = document.createElement("div");
      card.className = "bg-gray-700 p-4 mb-4 rounded-lg border border-gray-600";

      card.innerHTML = `
        <h6 class="font-semibold text-yellow-400 mb-2">Rekod #${index + 1} - ${namaPemantau}</h6>
        <p class="text-gray-300 mb-1"><strong>Tarikh:</strong> ${tarikh} (${hari})</p>
        <p class="text-gray-300 mb-1"><strong>Masa:</strong> ${masa}</p>
        <div class="mt-2 text-gray-300">
          <p><strong>1.</strong> ${soalan_1}</p>
          <p><strong>2.</strong> ${soalan_2}</p>
          <p><strong>3.</strong> ${soalan_3}</p>
          <p><strong>4.</strong> ${soalan_4}</p>
          <p><strong>5.</strong> ${soalan_5}</p>
          <p><strong>6.</strong> ${soalan_6}</p>
          <p><strong>7.</strong> ${soalan_7}</p>
          <p><strong>8.</strong> ${soalan_8}</p>
          <p><strong>9.</strong> ${soalan_9}</p>
          <p><strong>10.</strong> ${soalan_10}</p>
          <p><strong>11.</strong> ${soalan_11}</p>
          <p><strong>12.</strong> ${soalan_12}</p>
        </div>
        <p class="text-gray-400 text-sm mt-2"><em>Disimpan pada: ${timestamp}</em></p>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error fetching laporan GB/PK:", err);
    document.getElementById("laporan-gbpk-container").innerHTML = `<p class="text-red-500">Ralat memuatkan rekod.</p>`;
  }
}

function switchTabGBPK(tab) {
  const tambah = document.getElementById("content-tambah-gbpk");
  const lihat = document.getElementById("content-lihat-gbpk");

  const tabTambahBtn = document.getElementById("tab-tambah-gbpk");
  const tabLihatBtn = document.getElementById("tab-lihat-gbpk");

  if(tab === "tambah") {
    tambah.classList.remove("hidden");
    lihat.classList.add("hidden");
    tabTambahBtn.classList.add("text-yellow-400", "border-yellow-400");
    tabTambahBtn.classList.remove("text-gray-400", "border-transparent");
    tabLihatBtn.classList.add("text-gray-400", "border-transparent");
    tabLihatBtn.classList.remove("text-yellow-400", "border-yellow-400");
  } else {
    tambah.classList.add("hidden");
    lihat.classList.remove("hidden");
    tabLihatBtn.classList.add("text-yellow-400", "border-yellow-400");
    tabLihatBtn.classList.remove("text-gray-400", "border-transparent");
    tabTambahBtn.classList.add("text-gray-400", "border-transparent");
    tabTambahBtn.classList.remove("text-yellow-400", "border-yellow-400");

    // Fetch laporan only when switching to "Lihat Laporan"
    fetchLaporanGBPK();
  }
}
