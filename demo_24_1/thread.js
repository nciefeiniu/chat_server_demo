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

function renderPosts(posts) {
  // 判断这个post是否是该用户的，如果是该用户的，需要显示Delete按钮
  if (posts.user === currentUsername) {
    document.querySelector(".delete-btn").style.visibility = "visible";
  } else {
    document.querySelector(".delete-btn").style.visibility = "hidden";
  }

  // 渲染所有的thread到页面显示
  const threadsDom = document.getElementById("all-threads");
  threadsDom.innerHTML = `<p style="color: blue;">${posts.thread_title}</p>`;
  posts.posts.forEach((item) => {
    const threadNone = document.createElement("li");
    threadNone.style = "margin-left: 15px; margin-top: 20px;";
    threadNone.innerText = item.text + " - " + item.user;
    threadsDom.appendChild(threadNone);
  });
  threadsDom.scrollTop = threadsDom.scrollHeight;
}

function getAllPosts() {
  fetch("http://127.0.0.1:7777/api/threads/" + currentPostID)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        window.history.back(); // 出错直接返回上一页
      }
    })
    .then((res) => {
      renderPosts(res); // 渲染页面
    });
}

function sendPost() {
  const message = document.getElementById("new-post").value;
  if (!message) {
    return;
  }
  fetch(`http://127.0.0.1:7777/api/threads/${currentPostID}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // 指定内容类型为JSON
    },
    body: JSON.stringify({ user: currentUsername, text: message }), // 将数据对象转换为JSON字符串
  })
    .then((response) => {
      if (response.ok) {
        return response.json(); // 如果响应正常，解析JSON
      } else {
        throw new Error("网络响应不正常");
      }
    })
    .then((res) => {
      console.log(res);
      document.getElementById("new-post").value = "";
      getAllPosts();
    });
}

document.querySelector(".back-btn").addEventListener("click", () => {
  // 给 返回按钮增加监听 点击事件，只要点击了 Back 按钮，就会使用 window.history.back() 方法返回上一页
  window.history.back();
});

function deletePost() {
  if (confirm("Are you sure you want to delete this post?")) {
    fetch(`http://127.0.0.1:7777/api/threads/${currentPostID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: currentUsername,
      }),
    }).then((response) => {
      if (response.ok) {
        window.history.back();
      }
    });
  }
}

var currentUsername,
  currentName,
  currentPostID = undefined;

window.onload = () => {
  if (!checkLogined()) {
    // 如果没有登录，就跳转到登录页面
    window.location.href = "login.html";
    return;
  }
  currentUsername = decodeURIComponent(getQueryVariable("username")); // 获取登录的用户
  currentName = decodeURIComponent(getQueryVariable("name")); // 获取登录的Name
  currentPostID = getQueryVariable("id");
  document.getElementById("logged-name").innerText = currentName;

  getAllPosts(); // 获取所有thread

  setInterval(() => {
    console.log("interval refresh posts");
    getAllPosts();
  }, 10000);
};
