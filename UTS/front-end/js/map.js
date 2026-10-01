// aktifkan popover pada setiap pin
const petaPins = document.querySelectorAll('[data-bs-toggle="popover"]');

petaPins.forEach(function (pin) {
  new bootstrap.Popover(pin);
});


// zoom peta
const petaContainer = document.getElementById("petaContainer");
const btnZoomIn = document.getElementById("btnZoomIn");
const btnZoomOut = document.getElementById("btnZoomOut");
const btnResetZoom = document.getElementById("btnResetZoom");

let skalaPeta = 1;

function perbaruiZoom() {
  petaContainer.style.transform = "scale(" + skalaPeta + ")";
}

if (petaContainer && btnZoomIn && btnZoomOut && btnResetZoom) {
  btnZoomIn.addEventListener("click", function () {
    skalaPeta += 0.1;
    perbaruiZoom();
  });

  btnZoomOut.addEventListener("click", function () {
    if (skalaPeta > 0.5) {
      skalaPeta -= 0.1;
      perbaruiZoom();
    }
  });

  btnResetZoom.addEventListener("click", function () {
    skalaPeta = 1;
    perbaruiZoom();
  });
}