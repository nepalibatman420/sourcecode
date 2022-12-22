  $(document).ready(function() {
  $(".expand-trigger").click(function() {
    $(this).next().slideToggle();
  });
});

$(document).ready(function() {
  $('.toggleButton').click(function() {
    $('.toggleButton').each(function() {
      var target = $(this).data('target');
      $(target).css('display', 'none');
    });
    var target = $(this).data('target');
    $(target).css('display', 'block');
  });
});

