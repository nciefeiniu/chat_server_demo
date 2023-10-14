window.onload = function () {
  // 页面加载完成，执行这个方法  这里是第一步
  getAllUsers();
};

var allUsers = []; // 用来保存所有的用户信息
var currentUser = {}; // 保存当前的用户是谁

function getAllUsers() {
  // 获取所有的用户，通过fetch请求API获取
  fetch("http://localhost:7777/api/users")
    .then((response) => response.json())
    .then((data) => {
      allUsers = data;
    });
}



function login() {
  // 点击登录按钮，触发的js事件  这里是第二步
  const username = document.getElementById("username").value;
  if (username === "" || username === undefined || username === null) {
    alert("Please enter a valid Username");
    return;
  }
  for (let i = 0; i < allUsers.length; i++) {
    let item = allUsers[i];
    if (item.username === username) {
      window.location.href = './threads.html?username=' + item.username +'&name=' + item.name  // 调用登录成功方法， 如果登录成功，这里就是第三步
      return;
    }
  }
  alert("Please enter a valid Username");
}
