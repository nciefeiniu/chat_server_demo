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

function renderThreads(threads) {
  // 渲染所有的thread到页面显示
  const threadsDom = document.getElementById("all-threads");
  threadsDom.innerHTML = "";
  threads.forEach((item) => {
    const threadNone = document.createElement("a");
    threadNone.href = `thread.html?id=${item.id}&username=${getQueryVariable('username')}&name=${getQueryVariable('name')}`; // 使用实际的Thread URL替换
    threadNone.innerText = item.thread_title;
    threadsDom.appendChild(threadNone);
  });
}

function getAllThreads() {
  fetch("http://127.0.0.1:7777/api/threads")
    .then((response) => response.json())
    .then((res) => {
      allThreads = res;
      renderThreads(res); // 渲染页面
    });
}

function createNewPost() {
  // 创建一个新的post
  window.location.href = `new_thread.html?username=${encodeURIComponent(
    currentUsername
    )}&name=${encodeURIComponent(currentName)}`;      
}

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
  document.getElementById("logged-name").innerText = currentName;
  console.log(
    `Login Success, UserName: ${currentUsername}, name: ${currentName}`
  );
  getAllThreads(); // 获取所有thread
};
