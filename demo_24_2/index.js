var IntervalPosts = {};

function goForward() {
  console.log("forward", history.length);
  history.forward();
}

function goBack() {
  console.log("back", history.length);
  history.back();
}

function showThread(threadId, isPopstatus = false) {
  hiddenAllThreads();
  console.log(`thread${threadId}`);
  const thread = document.getElementById(`thread${threadId}`);
  // 显示这个thread
  thread.classList.add("fade-in");
  thread.style.display = "";
  getPosts(threadId); // 去获取所有的posts
  // 设置一个定时任务，每10秒钟去获取一次posts
  const IntervalID = setInterval(() => {
    getPosts(threadId);
  }, 10000);
  IntervalPosts[threadId] = IntervalID;
  if (!isPopstatus) {
    history.pushState(
      { id: threadId },
      `Thread ${threadId}`,
      `?id=${threadId}`
    );
  }

  thread.scrollTop = thread.scrollHeight;
}

function hiddenAllThreads() {
  // 隐藏所有的thread
  const threads = document.querySelectorAll(".thread-posts");
  threads.forEach((thread) => {
    thread.classList.remove("fade-in");
    thread.style.display = "none";
    const threadId = thread.getAttribute("ref");
    if (IntervalPosts[threadId]) {
      // 如果有定时任务，需要清除这个定时任务
      clearInterval(IntervalPosts[threadId]);
      IntervalPosts[threadId] = null;
    }
  });
}

function renderThreads(data) {
  // 渲染所有threads到页面上
  const threadsContainer = document.querySelector(".threads");
  threadsContainer.innerHTML = "";
  data.forEach((item) => {
    const divDom = document.createElement("div"); // 创建一个div标签
    divDom.setAttribute("class", "thread"); // 设置class
    divDom.setAttribute("onclick", `showThread('${item.id}')`); // 点击事件
    divDom.innerText = item.thread_title; // 设置innerText

    const ulDom = document.createElement("ul"); // 创建一个ul标签
    ulDom.setAttribute("ref", item.id);
    ulDom.setAttribute("class", "thread-posts");
    ulDom.setAttribute("id", `thread${item.id}`); // 设置id
    ulDom.style.display = "none"; // 隐藏

    if (item.user === username) {
      console.log("can del");
      // 如果这个thread的user和当前登录的user一致，则显示删除按钮
      const delDom = document.createElement("button");
      delDom.innerText = "Del";
      delDom.setAttribute("class", "del-btn");
      delDom.onclick = () => {
        // 点击事件
        // 删除这个thread
        fetch(`http://localhost:7777/api/threads/${item.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: username,
          }),
        }).then((res) => {
          if (res.ok) {
            // 删除成功
            allThreads(renderThreads); // 重新获取所有的Threads
            if (IntervalPosts[item.id]) {
              // 如果有定时任务，需要清除
              clearInterval(IntervalPosts[item.id]);
            }
          }
        });
      };
      divDom.appendChild(delDom);
    }
    threadsContainer.appendChild(divDom); // 添加到threadsContainer
    threadsContainer.appendChild(ulDom); // 添加到threadsContainer
  });
}

const allThreads = (callback) => {
  // 获取所有的thread
  fetch(`http://localhost:7777/api/threads`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      // 获取成功，交给callback进行渲染到页面上
      callback(data);
    });
};

function renderPosts(threadID, threadsData) {
  // 渲染某thread的所有posts到页面显示
  const ulDom = document.getElementById(`thread${threadID}`);
  ulDom.innerHTML = "";
  threadsData.forEach((item) => {
    const liDom = document.createElement("li");
    liDom.innerText = item.text + " - " + item.name;
    ulDom.appendChild(liDom);
  });
  const inputDom = document.createElement("input");
  inputDom.placeholder = "Enter your post";
  const buttonDom = document.createElement("button");
  buttonDom.innerText = "Post";
  buttonDom.setAttribute("class", "new-post-btn");
  buttonDom.onclick = () => {
    // 点击事件
    const text = inputDom.value;
    fetch(`http://localhost:7777/api/threads/${threadID}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        user: username,
      }),
    }).then((res) => {
      if (res.ok) {
        console.log("post success");
        getPosts(threadID);
      }
    });
  };
  ulDom.appendChild(inputDom);
  ulDom.appendChild(buttonDom);
  ulDom.scrollTop = ulDom.scrollHeight;
}

function getPosts(threadID) {
  // 获取某thread的所有posts
  fetch(`http://localhost:7777/api/threads/${threadID}/posts`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      renderPosts(threadID, data);
    });
}
var username,
  name = undefined;

window.onload = function () {
  console.log("load");
  // 判断下是否登录了
  username = localStorage.getItem("username");
  name = localStorage.getItem("name");
  if (!username || !name) {
    // 未登录，跳转到登录页面
    window.location.href = "./login.html";
    return;
  }
  document.querySelector(".logged-name").innerText = name;
  allThreads(renderThreads); // 渲染所有threads
};
var modal = document.getElementById("myModal");
var form = document.getElementById("create-thread-form");
function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

// 点击模态框外部区域也可关闭模态框
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// 点击表单的提交按钮，触发这个函数
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const threadTitle = document.getElementById("threadTitle").value;
  const icon = document.getElementById("icon").value;
  const text = document.getElementById("text").value;

  const data = {
    thread_title: threadTitle,
    icon: icon,
    text: text,
    user: username,
  };

  fetch("http://127.0.0.1:7777/api/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        alert("Successfully created thread");
        closeModal();
        allThreads(renderThreads); // 重新获取所有的Threads
      } else {
        throw new Error("发生错误，请重试！");
      }
    })
    .catch((error) => {
      console.error("发生错误:", error.message);
      alert("发生错误，请重试！");
    });
});

// 监听 popstate 事件，用于处理后退按钮
window.addEventListener("popstate", (event) => {
  console.log("event:", event);
  hiddenAllThreads();
  if (event.state) {
    showThread(event.state.id, true);
  }
  // if (event.state) {
  //   showThread(event.state.id);
  // } else {
  //   hiddenAllThreads();
  //   // window.history.back();
  // }
});
