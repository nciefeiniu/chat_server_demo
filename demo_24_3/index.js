window.onload = function () {
  // 页面加载完成
  const indexUrl = new URLSearchParams(window.location.search);
  const user = indexUrl.get("user");
  const name = indexUrl.get("name");
  console.log(user, name);
  if (user && name) {
    console.log("ok");
    window.location.href = `./threads/index.html?user=${user}&name=${name}`;
  } else {
    console.log("not ok");
    window.location.href = `./login/index.html`;
  }
};
