// main.js

let allRecords = [];
let isSubmitting = false;

// Initialize Data SDK on page load
async function initDataSdk() {
  allRecords = await window.dataSdk.getAll();
  filterLaporanKelas();
  filterLaporanPDP();
}

// ========================= KELAS =========================
function filterLaporanKelas() {
  const container = document.getElementById('laporan-kelas-container');
  let filtered = allRecords.filter(r => r.jenis_rekod === 'rekod_kelas');

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">Tiada laporan dijumpai</p>';
    return;
  }

  // Group by kelas
  const groupedByKelas = {};
  filtered.forEach(record => {
    if (!groupedByKelas[record.kelas]) groupedByKelas[record.kelas] = [];
    groupedByKelas[record.kelas].push(record);
  });

  // Sort each kelas by date descending
  Object.keys(groupedByKelas).forEach(kelas => {
    groupedByKelas[kelas].sort((a, b) => new Date(b.tarikh) - new Date(a.tarikh));
  });

  container.innerHTML = Object.keys(groupedByKelas).map(kelas => `
    <div class="mb-8">
      <h6 class="text-lg font-bold mb-4 p-3 rounded-lg" style="background: #FFD000; color: #1a1a1a;">📚 ${kelas}</h6>
      <div class="space-y-4">
        ${groupedByKelas[kelas].map((record, idx) => `
          <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="text-white font-semibold">👨‍ ${record.nama_guru}</p>
                <p class="text-gray-400 text-sm">${record.subjek}</p>
                <p class="text-gray-400 text-sm">${formatTarikh(record.tarikh)} | ${record.masa_masuk} - ${record.masa_keluar}</p>
              </div>
              <button onclick="padamRekodKelas('${record.__backendId}')" class="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all text-sm">
                🗑️ Padam
              </button>
            </div>
            
            <div class="bg-gray-800 rounded p-3 mt-3">
              <p class="text-yellow-400 font-semibold mb-2">💬 Ulasan Guru:</p>
              <p class="text-gray-300 text-sm">${record.ulasan_guru}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

async function padamRekodKelas(backendId) {
  const record = allRecords.find(r => r.__backendId === backendId);
  if (!record) return;

  createConfirmModal(async () => {
    const deleteResult = await window.dataSdk.delete(record);
    if (deleteResult.isOk) {
      showNotification('Rekod berjaya dipadam', 'success');
      filterLaporanKelas();
    } else {
      showNotification('Gagal memadam rekod', 'error');
    }
  });
}

// ========================= PDP =========================
function filterLaporanPDP() {
  const container = document.getElementById('laporan-pdp-container');
  let filtered = allRecords.filter(r => r.jenis_rekod === 'rekod_pemantauan_pdp');

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">Tiada laporan dijumpai</p>';
    return;
  }

  filtered.sort((a, b) => new Date(b.tarikh) - new Date(a.tarikh));

  container.innerHTML = `
    <div class="space-y-6">
      ${filtered.map((record, idx) => `
        <div class="bg-gray-700 rounded-lg p-6 border-2 border-gray-600">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-white font-bold text-lg">👨‍🏫 ${record.nama_guru_dipantau}</p>
              <p class="text-gray-300 text-sm">Dipantau oleh: ${record.nama_pentadbir}</p>
              <p class="text-gray-400 text-sm">${record.hari}, ${formatTarikh(record.tarikh)} | ${record.masa}</p>
              <p class="text-gray-400 text-sm">Kelas: ${record.kelas} | Subjek: ${record.subjek}</p>
            </div>
            <button onclick="padamRekodPDP('${record.__backendId}')" class="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all text-sm">
              🗑️ Padam
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="bg-gray-800 rounded-lg p-4">
              <p class="text-yellow-400 font-bold mb-2">📌 Fokus Pemantauan</p>
              <p class="text-gray-200 text-sm">${record.fokus_pemantauan || '-'}</p>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
              <p class="text-yellow-400 font-bold mb-2">📚 Gred PDP</p>
              <p class="text-gray-200 text-sm">${record.gred_pengajaran_pembelajaran || '-'}</p>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
              <p class="text-yellow-400 font-bold mb-2">📋 Gred RPH</p>
              <p class="text-gray-200 text-sm">${record.gred_buku_rph || '-'}</p>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-4">
              <p class="text-yellow-400 font-bold mb-2">✏️ Gred Buku Latihan</p>
              <p class="text-gray-200 text-sm">${record.gred_buku_latihan_murid || '-'}</p>
            </div>
          </div>
          
          <div class="bg-gray-800 rounded-lg p-4 mt-4">
            <p class="text-yellow-400 font-bold mb-2">💡 Ulasan & Cadangan</p>
            <p class="text-gray-200 text-sm whitespace-pre-wrap">${record.ulasan_cadangan || '-'}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function padamRekodPDP(backendId) {
  const record = allRecords.find(r => r.__backendId === backendId);
  if (!record) return;

  createConfirmModal(async () => {
    const deleteResult = await window.dataSdk.delete(record);
    if (deleteResult.isOk) {
      showNotification('Rekod berjaya dipadam', 'success');
      filterLaporanPDP();
    } else {
      showNotification('Gagal memadam rekod', 'error');
    }
  });
}

// ========================= GBPK =========================
async function padamRekodGBPK(backendId) {
  const record = allRecords.find(r => r.__backendId === backendId);
  if (!record) return;

  createConfirmModal(async () => {
    const deleteResult = await window.dataSdk.delete(record);
    if (deleteResult.isOk) {
      showNotification('Rekod berjaya dipadam', 'success');
      filterLaporanGBPK();
    } else {
      showNotification('Gagal memadam rekod', 'error');
    }
  });
}

// ========================= Helper Functions =========================
function createConfirmModal(onConfirm) {
  const confirmDiv = document.createElement('div');
  confirmDiv.style.cssText = `
    position: fixed; top:50%; left:50%;
    transform: translate(-50%, -50%);
    background: white; padding: 30px;
    border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 2000; text-align:center; min-width:300px;
  `;
  confirmDiv.innerHTML = `
    <h3 style="margin:0 0 15px 0;color:#1a1a1a">Padam Rekod?</h3>
    <p style="margin:0 0 20px 0;color:#666;">Rekod ini akan dipadam secara kekal.</p>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button id="confirm-delete" style="padding:10px 20px;background:#EF4444;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer">Padam</button>
      <button id="cancel-delete" style="padding:10px 20px;background:#6B7280;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer">Batal</button>
    </div>
  `;

  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.5); z-index:1999;
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(confirmDiv);

  document.getElementById('confirm-delete').onclick = async () => {
    await onConfirm();
    backdrop.remove();
    confirmDiv.remove();
  };

  document.getElementById('cancel-delete').onclick = () => {
    backdrop.remove();
    confirmDiv.remove();
  };

  backdrop.onclick = () => {
    backdrop.remove();
    confirmDiv.remove();
  };
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top:20px; right:20px;
    padding:16px 24px; border-radius:8px;
    font-weight:600; z-index:1000;
    animation: slideIn 0.3s ease;
    ${type === 'success' ? 'background:#10B981;color:white;' : 'background:#EF4444;color:white;'}
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function formatTarikh(tarikh) {
  const d = new Date(tarikh);
  return d.toLocaleDateString('ms-MY');
}

// ========================= Export this file for your dashboard =========================
initDataSdk();
