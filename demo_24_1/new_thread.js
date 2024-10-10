function getQueryVariable(variable) {
  // 从URL中获取参数
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function checkLogined() {
  // 判断是否登录了，也就是判断URL中是否有username这个参数
  if (!getQueryVariable("username")) {
    return false;
  }
  return true;
}

document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById("myForm"));
  formData.append("user", currentUsername);

  fetch("http://127.0.0.1:7777/api/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  })
    .then((response) => {
      if (response.ok) {
        alert("Data submission successful!");
        window.history.back();
      } else {
        alert("Data submission failed!");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

document.querySelector(".back-btn").addEventListener("click", () => {
  // 给 返回按钮增加监听 点击事件，只要点击了 Back 按钮，就会使用 window.history.back() 方法返回上一页
  window.history.back();
});

var currentUsername,
  currentName,
  allThreads = undefined;

window.onload = () => {
  if (!checkLogined()) {
    // 如果没有登录，就跳转到登录页面
    window.location.href = "login.html";
    return;
  }
  currentUsername = decodeURIComponent(getQueryVariable("username")); // 获取登录的用户
  currentName = decodeURIComponent(getQueryVariable("name")); // 获取登录的Name
};
