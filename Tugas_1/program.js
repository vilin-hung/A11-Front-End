// ambil elemen rumus V = I R
const teganganListrik = document.getElementById('teganganListrik');
const hambatanListrik = document.getElementById('hambatanListrik');
const arusListrik = document.getElementById('arusListrik');

// ambil elemen slider tegangan & hambatan
const sliderTegangan = document.getElementById('sliderTegangan');
const sliderHambatan = document.getElementById('sliderHambatan');

const nilaiArus = document.getElementById('nilaiArus');

function updateText() {
  let v = sliderTegangan.value;
  let r = sliderHambatan.value;
  let i = ((v/r)*1000).toFixed(1);
  
  nilaiTegangan.textContent = v;
  nilaiHambatan.textContent = r;
  nilaiArus.textContent = i;
  
  // ukuran font V & R berubah-ubah mengikuti besar nilainya
  teganganListrik.style.fontSize = v * 10 + 50 + "px";
  hambatanListrik.style.fontSize = r / 11 + 50 + "px";

  // mengatur ukuran font I
  if (i <= 30) {
      currentSize = 15 + (i / 30) * 70;
  } else {
      currentSize = 85 + ((i - 30) / 870) * 65;
  }

  arusListrik.style.fontSize = currentSize + "px";
}

// jalankan updateText setiap kali slider digeser
sliderTegangan.addEventListener('input',updateText);
sliderHambatan.addEventListener('input',updateText);

updateText();