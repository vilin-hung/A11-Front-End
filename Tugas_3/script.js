$(document).ready(function() {

  // FAQ Accordion
  $('.faq-question').on('click', function() {

    // tutup FAQ lain
    $('.faq-answer').not($(this).next('.faq-answer')).slideUp();
    $('.faq-item').not($(this).parent('.faq-item')).removeClass('active');

    // buka/tutup FAQ yang diklik
    $(this).next('.faq-answer').slideToggle();
    $(this).parent('.faq-item').toggleClass('active');
  });

  // Mobile Navigation
  $('#menu-btn').on('click', function () {
    $('.nav-bar').toggleClass('active');
  });

  $('.nav-link').on('click', function () {
    $('.nav-bar').removeClass('active');
  });

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

        if (nama.indexOf(kataKunci) > -1) {
          $(this).show();
          jumlahTampil++;
        } else {
          $(this).hide();
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
    $('.card-produk').show();
    $('.judul-kategori').show();
  });

});