function setCookie(name, value, expires) {
  if (expires) {
    var exp = new Date();
    exp.setTime(exp.getTime() + expires * 1000);
    document.cookie =
      name + "=" + escape(value) + ";expires=" + exp.toGMTString();
  } else {
    document.cookie = name + "=" + escape(value) + ";";
  }
}

function getCookie(name) {
  var result = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]*)(;|$)")
  );
  if (result != null) {
    return unescape(result[2]);
  }
  return null;
}

//删除cookie
function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
