$(document).ready(function() {
    $('.menu-toggle').click(function() {
      $('.nav-items').slideToggle();
    });
  });
  $(document).ready(function() {
    $(".expand-trigger").click(function() {
      $(this).next().slideToggle();
    });
  });
  