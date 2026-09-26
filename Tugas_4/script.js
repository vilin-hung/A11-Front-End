$(document).ready(function() {

  // Back to Top
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 300) {
      $('#backToTop').fadeIn();
    } else {
      $('#backToTop').fadeOut();
    }
  });

  $('#backToTop').on('click', function () {
    $('html, body').animate({
        scrollTop: 0
    }, 0);
  });

  // Nav kategori berubah warna saat menempel
  $(window).on('scroll', function () {
    var navEl = $('.kategori-nav')[0];
    // Baca nilai top sticky langsung dari CSS
    var batas = parseFloat(getComputedStyle(navEl).top) || 0;
    var navTop = navEl.getBoundingClientRect().top;

    if (navTop <= batas + 1) {
        $('.kategori-nav').addClass('stuck');
    } else {
        $('.kategori-nav').removeClass('stuck');
    }
  });

  // Pencarian menu
  $('#searchMenu').on('input', function () {
    var kataKunci = $(this).val().toLowerCase();

    $('.kategori-menu').each(function () {
      var jumlahTampil = 0;

      $(this).find('.card-produk').each(function () {
        var nama = $(this).find('h4').text().toLowerCase();
        var kolom = $(this).closest('.col-12');

        if (nama.indexOf(kataKunci) > -1) {
          kolom.show();
          jumlahTampil++;
        } else {
          kolom.hide();
        }
      });

      // Sembunyikan judul kategori jika tidak ada kartu yang cocok
      if (jumlahTampil === 0) {
        $(this).find('.judul-kategori').hide();
      } else {
        $(this).find('.judul-kategori').show();
      }
    });
  });

  // Mereset pencarian saat kategori diklik
  $('.kategori-btn').on('click', function () {
    $('#searchMenu').val('');
    $('.card-produk').parent().show();
    $('.judul-kategori').show();
  });

});