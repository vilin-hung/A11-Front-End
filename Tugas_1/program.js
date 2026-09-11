// Ambil elemen rumus V = I R
const teganganListrik = document.getElementById('teganganListrik');
const hambatanListrik = document.getElementById('hambatanListrik');
const arusListrik = document.getElementById('arusListrik');

// Ambil elemen slider tegangan & hambatan
const sliderTegangan = document.getElementById('sliderTegangan');
const sliderHambatan = document.getElementById('sliderHambatan');

// Ambil elemen input manual
const inputTegangan = document.getElementById('inputTegangan');
const inputHambatan = document.getElementById('inputHambatan');

// Ambil elemen nilai arus
const nilaiArus = document.getElementById('nilaiArus');

// Ambil elemen baterai
const kotakBaterai = document.getElementById('baterai');
const kotakHambatan = document.getElementById('hambatanVisual');

function updateText() {
  // Ambil nilai langsung dari slider
  let v = parseFloat(sliderTegangan.value);
  let r = parseFloat(sliderHambatan.value);

  // Hitung arus dan tampilkan ke layar
  let i = ((v/r)*1000).toFixed(1);
  nilaiArus.textContent = i;
  
  // Ukuran font V & R berubah-ubah mengikuti besar nilainya
  teganganListrik.style.fontSize = v * 10 + 50 + "px";
  hambatanListrik.style.fontSize = r / 11 + 50 + "px";

  // Mengatur ukuran font I
  let currentSize;
  if (i <= 30) {
      currentSize = 15 + (i / 30) * 70;
  } else {
      currentSize = 85 + ((i - 30) / 870) * 65;
  }

  arusListrik.style.fontSize = currentSize + "px";

  // Update visual rangkaian
  updateVisualBaterai(v);
  updateVisualHambatan(r);
  updateKecepatanArus(i);
}

function updateVisualBaterai(v) {
  kotakBaterai.innerHTML = ''; 
  let bateraiPenuh = Math.floor(v / 1.5);
  let sisaTegangan = (v % 1.5).toFixed(1);

  // Gambar baterai utuh (1.5V)
  for(let j = 0; j < bateraiPenuh; j++) {
    kotakBaterai.innerHTML += `
      <div style="display: flex; align-items: center;">
        <div class="bateraiItem" style="width: 40px;">1.5V</div>
        <div class="bateraiKutub"></div>
      </div>
    `;
  }
  
  // Gambar baterai sisa jika ada (misal 0.5V)
  if(sisaTegangan > 0) {
    let proporsiLebar = Math.max((sisaTegangan / 1.5) * 40, 22); // Lebar minimum 22px
    kotakBaterai.innerHTML += `
      <div style="display: flex; align-items: center;">
        <div class="bateraiItem" style="width: ${proporsiLebar}px; font-size: 0.6em;">${sisaTegangan}V</div>
        <div class="bateraiKutub"></div>
      </div>
    `;
  }
}

function updateVisualHambatan(r) {
  // Semakin besar R, semakin pekat warna merahnya dan partikelnya makin banyak
  let opasitasMerah = Math.min(0.3 + (r / 1000), 1);
  kotakHambatan.style.background = `rgba(192, 57, 43, ${opasitasMerah})`;
  
  kotakHambatan.innerHTML = '';
  // Menghasilkan bintik hitam (seperti di referensi) berdasarkan nilai R
  let jumlahPartikel = Math.floor(r / 5); 
  for(let j = 0; j < jumlahPartikel; j++) {
    let topPos = Math.random() * 85;
    let leftPos = Math.random() * 95;
    kotakHambatan.innerHTML += `<div class="partikelHambatan" style="top:${topPos}%; left:${leftPos}%;"></div>`;
  }
}

// Fungsi untuk menghubungkan slider dan input manual
function sinkronkanInput(sumber, target) {
  sumber.addEventListener('input', () => {
    target.value = sumber.value;
    updateText();
  });
}

// Slider digeser, update nilai kotak input & jalankan updateText
sinkronkanInput(sliderTegangan, inputTegangan);
sinkronkanInput(inputTegangan, sliderTegangan);

// Kotak input diketik manual, update nilai slider & jalankan updateText
sinkronkanInput(sliderHambatan, inputHambatan);
sinkronkanInput(inputHambatan, sliderHambatan);

// Inisialisasi awal saat halaman dimuat pertama kali
inputTegangan.value = sliderTegangan.value;
inputHambatan.value = sliderHambatan.value;
updateText();