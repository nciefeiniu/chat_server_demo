var currentUser = {}; // 保存当前的用户是谁
var allThreads = []; // 保存所有的Threads
var currentThreadID = null; // 当前打开的thread id
var intervalID2 = null; // 定时器的ID

window.onload = function () {
  // 页面加载完成，执行这个方法  这里是第一步
  currentUser = {
    username: decodeURIComponent(getQueryFromUrl("username")),
    name: decodeURIComponent(getQueryFromUrl("name")),
  };
  getAllThreads();
};

function getQueryFromUrl(key) {
  // 获取url中的参数
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == key) {
      return pair[1];
    }
  }
  return false;
}

function getAllThreads() {
  // 获取所有threads，这就是第二部
  fetch("http://localhost:7777/api/threads")
    .then((response) => response.json())
    .then((data) => {
      allThreads = data;
    })
    .then(() => {
      renderThreadsPage();
    });
}

function renderThreadsPage() {
  // 这里显示threads，获取到threads，然后用JavaScript渲染到页面上，这也就是第三步
  const container = document.getElementById("container");
  container.innerHTML = `  <div class="back-container" onclick="goBack()">Back</div>`; // 清空container 里面的HTML
  
  const welcomeTextNode = document.createElement("div"); // 创建一个document，也就是创建了一个div标签
  welcomeTextNode.innerText = `Logged in as ${currentUser.name}`; // 给这个标签设置里面的文字
  welcomeTextNode.setAttribute("style", "text-align: right;"); // 设置style
  container.appendChild(welcomeTextNode); //  把上面创建的标签添加到 container 标签里面去

  const thredsTitleNode = document.createElement("div"); // 创建一个document，也就是创建了一个div标签
  thredsTitleNode.innerHTML = `<div class="threads_button">
                                  <span>Threads</span>
                                  <button class="newbtn" id="new-threads-btn">New threads</button>
                                </div>`; // 设置这个标签里面的HTML内容，和上面的不一样，上面是设置的文字，这个里面是设置的HTML
  container.appendChild(thredsTitleNode); //  把上面创建的标签添加到 container 标签里面去

  // 下面的步骤就类似了
  const ulContainer = document.createElement("ul");
  ulContainer.setAttribute("class", "threads-list");
  allThreads.forEach(function (item) {
    const threadNode = document.createElement("li");
    threadNode.innerHTML =
      `<a onclick="openThread('${item.id}')">${item.thread_title}</a>` +
      (item.user === currentUser.username
        ? `<em onclick=deleteThread(${item.id})>Del</em>`
        : "");
    ulContainer.appendChild(threadNode);
  });
  container.appendChild(ulContainer);

  document.getElementById("new-threads-btn").onclick = function () {
    showNewThreadModal();
  };
}

function showNewThreadModal() {
  // 显示新建thread的弹出层，这里就是输入thread的title以及第一条消息的地方
  closeModal(false);
  const container = document.body;

  const modalNode = document.createElement("div");
  modalNode.setAttribute("id", "modal-container");

  modalNode.innerHTML = `
    <div class="modal">
      <div class="modal-container">
        <div class="input-row">
          <div class="label-text">thread_title:</div>
          <input type="text" id="thread-title" />
        </div>
        <div class="input-row">
          <div class="label-text">first message:</div>
          <input type="text" id="thread-first-message" />
        </div>
        <div class="input-row">
          <button type="submit" onclick="newThreadSumbit()">submit</button>
        </div>
        <div class="modal-close" onclick="closeModal">
            X
        </div>
      </div>
    </div>`;
  container.appendChild(modalNode);
}

function closeModal(closeInter) {
  // 关闭弹出层
  const modalNode = document.getElementById("modal-container");
  if (modalNode) {
    modalNode.remove();
  }
  if (intervalID2 && closeInter === true) {
    console.log('clear')
    clearInterval(intervalID2)
  }
}

function newThreadSumbit() {
  // 用户点击创建Thread的确定按钮
  const threadTitle = document.getElementById("thread-title").value;
  const threadFirstMessage = document.getElementById(
    "thread-first-message"
  ).value;

  if (
    threadFirstMessage === "" ||
    threadFirstMessage === undefined ||
    threadFirstMessage === null
  ) {
    alert("Message cannot be empty");
    return;
  }
  if (threadTitle === "" || threadTitle === undefined || threadTitle === null) {
    alert("Title cannot be empty");
    return;
  }
  console.log("current user:", currentUser);
  // 提交请求
  fetch("http://localhost:7777/api/threads/", {
    method: "post",
    body: JSON.stringify({
      user: currentUser.username,
      thread_title: threadTitle,
      icon: "🚀",
      text: threadFirstMessage,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (data) {
      getAllThreads(); // 提交创建Thread请求后，再次请求所有Threads并渲染在页面上
    })
    .then(() => {
      closeModal();
    });
}

function openThread(tid) {
  // 当用户点击某个Thread后，会执行这里的方法
  if (tid) {
    currentThreadID = tid;
  }
  

  closeModal();
  const container = document.body;

  const modalNode = document.createElement("div");
  modalNode.setAttribute("id", "modal-container");

  modalNode.innerHTML = `
    <div class="modal">
      <div class="modal-container">
        <ul class="posts-container" id="posts-container-ul">
        </ul>
        <div class="modal-close" onclick="closeModal()">
            X
        </div>
        <div class="modal-post">
          <input id="new-post-input"/>
          <button onclick="submitNewPost()">Post</button>
        </div>
      </div>
    </div>`;
  container.appendChild(modalNode);

  function _getData() {
    fetch(`http://localhost:7777/api/threads/${currentThreadID}/posts`)
    .then((response) => response.json())
    .then((data) => {
      showThreadModal(data);
    });
  }

  _getData()

  intervalID2 = setInterval(_getData, 10000)  // 设置定时任务，每10秒获取一次数据
  
}

function showThreadModal(postsData) {
  // 这里是弹出Thread的界面，参数是获取到的当前thread的posts
 
  let ulHtml = "";
  postsData.forEach((item) => {
    ulHtml =
      ulHtml + `<li style="margin: 5px 0;">${item.text}<br/>-${item.name}</li>`;
  });
  const ulNode = document.getElementById('posts-container-ul')
  if (ulNode) {
    ulNode.innerHTML = ulHtml
  } 
}

function submitNewPost() {
  // 这是发送post
  const id = currentThreadID;
  const newStr = document.getElementById("new-post-input").value;

  if (newStr === "" || newStr === null || newStr === undefined) {
    alert("Please enter valid information");
    return;
  }

  fetch(`http://localhost:7777/api/threads/${id}/posts`, {
    method: "post",
    body: JSON.stringify({
      user: currentUser.username,
      text: newStr,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(function (data) {
    openThread(currentThreadID); // 发送成功后，会再次请求获取所有的POST，并渲染在页面上
  });
}

function deleteThread(tid) {
  // 删除 thread
  fetch(`http://localhost:7777/api/threads/${tid}`, {
    method: "delete",
    body: JSON.stringify({
      user: currentUser.username,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(function (data) {
    getAllThreads(); // 发送成功后，会再次请求获取所有的POST，并渲染在页面上
  });
}


function goBack() {
  // 这里使用history 跳转
  history.back()
}
