function navExpamd(x) {
      x.classList.toggle("enabler");
    }
    function myFunction(x) {
      x.classList.toggle("change");
    }


    $(document).ready(function () {

      // jQuery methods go here...
      $(".navbut2").toggle(500);
      //$("#l1").hide(1000);
      //$("#Gallery").hide();
      //$("#l4").hide();
      //$("#l2").hide();
      //$("#l3").hide();
      $("#blog1").hide();
      $("#blog2").hide();
      $("#blog3").hide();
      $("#blog0").fadeIn(1500);


      $("#l1").click(function () {
        $("#blog3").hide();
        $("#blog1").hide();
        $("#blog2").hide();
        $("#blog0").fadeIn(100);

      });

      $("#bb1").click(function () {
        $("#l1").fadeToggle(300);
        $("#l2").fadeToggle(350);
        $("#l3").fadeToggle(400);
        $("#l4").fadeToggle(450);
        $("#blog3").hide();
        $("#blog1").hide();
        $("#blog2").hide();
        $("#blog0").fadeIn(200);

      });

      $("#bb2").click(function () {
        $(".nav2").fadeToggle(250);
        $("#blog3").hide();
        $("#blog1").hide();
        $("#blog2").hide();
      $("#blog0").show(100);
      });
      $("#l2").click(function () {
        $("#blog1").fadeIn(300);
        $("#blog2").hide();
        $("#blog3").hide();
        $("#blog0").hide();
      });

      $("#l3").click(function () {
        $("#blog2").fadeIn(500);
        $("#blog1").hide();
        $("#blog3").hide();
        $("#blog0").hide();
      });
      $("#l4").click(function () {
        $("#blog3").fadeIn(500);
        $("#blog1").hide();
        $("#blog2").hide();
        $("#blog0").hide();

      });

    });
