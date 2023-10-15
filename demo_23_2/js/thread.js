var intervalID = null;

window.onload = () => {
  // 页面加载完成，就会执行这个方法，这是浏览器自带的
  if (!urlParams("username")) {
    // 如果url中没有username这个参数，就跳转到login界面
    window.location.href = "./login.html";
  }
  const nameNode = document.getElementsByClassName("username_div")[0];
  nameNode.innerHTML = "Logged in as " + decodeURIComponent(urlParams("name"));

  getPosts(urlParams("id"), renderPost);

  intervalID = setInterval(() => {
    getPosts(urlParams("id"), renderPost);
  }, 1000 * 10);
};

var urlParams = (name) => {
  // 从url中获取参数
  var results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );
  if (!results) {
    return 0;
  }
  return results[1] || 0;
};
var goBack = () => {
  // 点击回退按钮们这里使用 history 的api 进行跳转
  if (intervalID) {
    clearInterval(intervalID);
  }
  history.back();
};

var clickDelThread = () => {
  // 点击删除按钮，这里只能删除自己的，不能删除别人的
  console.log("click Del Thread");
  if (urlParams('can_del') === 'false') {
    alert('no permission')
    return
  }
  const threadID = urlParams('id')
  fetch(`http://localhost:7777/api/threads/${threadID}`, {
    method: "delete",
    body: JSON.stringify({
      user: urlParams('username'),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(function (data) {
    // 删除成功后，需要回退到上一个页面
    history.back();
  });

};

var renderPost = (data) => {
  // 渲染所有的post到页面上
  const ulNode = document.getElementById("posts_ul_co");
  ulNode.innerHTML = "";
  let liNode = "";

  data.forEach((element) => {
    liNode += `<li>${element.text}&nbsp;&nbsp;&nbsp;- ${element.name}</li>`;
  });
  ulNode.innerHTML = liNode;

  ulNode.scrollTop = ulNode.scrollHeight;
};

var getPosts = (id, callback) => {
  // 获取这个thread的所有post
  fetch(`http://localhost:7777/api/threads/${id}/posts`)
    .then((response) => response.json())
    .then((data) => {
      callback(data); // 接口获取成功就调用回调函数，回调函数是传递进来的
    });
};

var addPost = () => {
  // 发送post
  const postMessage = document.getElementById("post_input").value;
  if (!postMessage) {
    alert("post can not be empty");
    return;
  }

  fetch(`http://localhost:7777/api/threads/${urlParams("id")}/posts`, {
    method: "post",
    body: JSON.stringify({
      user: urlParams("username"),
      text: postMessage,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((data) => {
    getPosts(urlParams("id"), renderPost); // 发送成功后，会再次请求获取所有的POST，并渲染在页面上
  }).then(() => {
    document.getElementById("post_input").value = ''
  });
};
