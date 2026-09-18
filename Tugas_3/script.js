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

});