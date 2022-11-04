/**
 * Created by chale on 2016/5/1.
 */
(function ($) {
  $(function () {
    $(".login-btn").click(function () {
      var _username = $(".username").val().trim();
      if (_username.length < 1) {
        alert("Please enter one user name");
        return;
      }

      let loginS = false
      $.get("http://127.0.0.1:7777/api/users", function (data, status) {
        data.forEach(item => {
          if (item.username === _username) {
            $(location).attr('href', './index.html?username=' + item.username + '&name=' + item.name);
            loginS = true
          }
        })

        if (loginS === false) {
          alert(`"${_username}" The account does not exist`)
        }

      });

    })
  })
})(jQuery);