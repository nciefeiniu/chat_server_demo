const usernameEle = document.getElementById("username");

window.onload = () => {
  // 页面加载完成
  localStorage.removeItem("username"); // 去除登录
  localStorage.removeItem("name"); // 去除登录
};

const goToLogin = () => {
  // 点击登录按钮，去登录
  const username = usernameEle.value;
  if (!username) {
    alert("Please input username");
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", `http://localhost:7777/api/users/${username}`, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log(xhr);
        const data = JSON.parse(xhr.responseText);
        localStorage.setItem("username", username);
        localStorage.setItem("name", data.name);
        window.location.href = `./index.html`;
      } else {
        alert("user does not exist");
      }
    }
  };
  xhr.send();
};
