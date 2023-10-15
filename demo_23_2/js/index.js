window.onload = () => {
  // 页面加载完成，就会执行这个方法，这是浏览器自带的
  if (!urlParams('username')) {  // 如果url中没有username这个参数，就跳转到login界面
    window.location.href = './login.html'
  }
  const nameNode = document.getElementsByClassName('username_div')[0]
  nameNode.innerHTML = 'Logged in as ' + decodeURIComponent(urlParams('name'))
  fetchAllThreads(renderThreads);
};

var urlParams = (name) => {
  // 从url中获取参数
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (!results) { return 0; }
  return results[1] || 0;
}

var clickNewThread = () => {
  // 用户点击页面上的 New Thread 按钮后，会执行这个函数
  console.log("click Btn new thread");
  let title = prompt("Please enter the title of the new Thread");
  let message = null;
  console.log("title", title);
  if (title !== null) {
    if (title === "") {
      alert("Title cannot be empty");
      return;
    }
    message = prompt("Please enter the first post");
    if (!message) {
      alert("post cannot be empty");
      return;
    }

    console.log(title, message);
    // 成功输入了title和第一条post，这里发送请求创建一个thread
    fetch("http://localhost:7777/api/threads/", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: urlParams('username'),
        thread_title: title,
        icon: "1",
        text: message,
      }),
    }).then(function (data) {
        fetchAllThreads(renderThreads); // 提交创建Thread请求后，再次请求所有Threads并渲染在页面上
      })
  } else {
    console.log("click cancel.");
  }
};

var clickThread = (id, username) => {
  // 用户点击某个 thread 后会执行这个函数
  console.log("click thread, thread ID:" + id);
  window.location.href = './thread.html?username=' + decodeURIComponent(urlParams('username')) + '&name=' + decodeURIComponent(urlParams('name')) + '&id=' + id + '&can_del=' + (username === urlParams('username') ? 'true': 'false' )
};

var fetchAllThreads = (callback) => {
  // 获取所有threads，这就是第二部
  fetch("http://localhost:7777/api/threads")
    .then((response) => response.json())
    .then((data) => {
      callback(data); // 获取成功，就调用传递进来的这个回调方法
    });
};

var renderThreads = (data) => {
  // 这是把获取到的所有的threads，通过js渲染到html页面上
  const ulNode = document.getElementById("threads_ul_co"); // 这是找到 id= threads_ul_co 这个ul标签
  ulNode.innerHTML = ``; // 设置这个标签的 HTML内容为空

  let liNode = "";
  data.forEach((element) => {
    liNode += `<li onclick="clickThread(${element.id}, '${element.user}')">${element.thread_title}</li>`; // 拼接html代码
  });
  ulNode.innerHTML = liNode; // 设置这个ul 标签的html代码为 liNode
};

var goBack = () => {
  history.back();
};
