var username,
  name = undefined;
var existsAutoGetPost = undefined;

window.onload = function () {
  username = sessionStorage.getItem("username");
  name = sessionStorage.getItem("name");
  if (!username || !name) {
    window.location.href = "login.html";
    return;
  }
  document.getElementById("logged-name").textContent = name;
  allThread();
};

function delThread(threadId) {
  fetch(`http://localhost:7777/api/threads/${threadId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: username,
    }),
  }).then((res) => {
    if (res.ok) {
      allThread();
    }
  });
}

function allThread() {
  const threadsContainer = document.getElementById("threads");
  threadsContainer.innerHTML = "";
  fetch("http://localhost:7777/api/threads")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((thread) => {
        const threadContainer = document.createElement("div");
        threadContainer.classList.add("thread");
        const threadTitle = document.createElement("div");
        threadTitle.classList.add("thread-title");
        threadTitle.setAttribute("onclick", `togglePosts(${thread.id})`);
        threadTitle.textContent = thread.thread_title;

        // del
        if (thread.user === username) {
          const del = document.createElement("button");
          del.textContent = "del";
          del.classList.add("del-btn");
          del.setAttribute("onclick", `delThread(${thread.id})`);
          threadTitle.appendChild(del);
        }

        const postContainer = document.createElement("div");
        postContainer.id = `post-${thread.id}`;
        postContainer.classList.add("post");
        threadContainer.appendChild(threadTitle);
        threadContainer.appendChild(postContainer);
        threadsContainer.appendChild(threadContainer);
      });
    });
}

function hiddenAllPosts() {
  const threads = document.querySelectorAll(".post");
  threads.forEach((post) => (post.style.display = "none"));
}

function showPosts(threadId) {
  fetch(`http://localhost:7777/api/threads/${threadId}/posts`)
    .then((res) => res.json())
    .then((data) => {
      const post = document.getElementById(`post-${threadId}`);
      post.innerHTML = "";
      data.forEach((item) => {
        post.innerText += `${item.text}`;
        const br = document.createElement("br");
        post.appendChild(br);
        post.innerText += `- ${item.name}`;
        post.appendChild(br);
        post.innerText += "";
        post.appendChild(br);
      });
      // new Post btn
      const newPost = document.createElement("input");
      newPost.id = `input-${threadId}`;
      newPost.classList.add("new-post-input");
      const postButton = document.createElement("button");
      postButton.textContent = "Post";
      postButton.setAttribute("onclick", `sendNewPost(${threadId})`);
      post.appendChild(newPost);
      post.appendChild(postButton);
      post.scrollTo(0, post.scrollHeight);
    });
}

function togglePosts(threadId) {
  hiddenAllPosts();
  const post = document.getElementById(`post-${threadId}`);
  post.style.display = post.style.display === "block" ? "none" : "block";
  window.history.pushState(
    { thread: threadId },
    `Thread ${threadId}`,
    `#thread${threadId}`
  );
  showPosts(threadId);
  autoLoadPosts(threadId); // 自动加载post
}

function sendNewPost(threadId) {
  const newPost = document.getElementById(`input-${threadId}`).value;
  if (!newPost) {
    return;
  }
  fetch(`http://localhost:7777/api/threads/${threadId}/posts`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      text: newPost,
      user: username,
    }),
  }).then((res) => {
    if (res.ok) {
      showPosts(threadId);
    }
  });
}

function autoLoadPosts(threadId) {
  if (existsAutoGetPost) {
    clearInterval(existsAutoGetPost);
  }
  existsAutoGetPost = setInterval(() => {
    showPosts(threadId);
  }, 10000);
}

window.onpopstate = function (event) {
  hiddenAllPosts();
  if (event.state && event.state.thread) {
    document.getElementById(`post-${event.state.thread}`).style.display =
      "block";
  }
  autoLoadPosts(event.state.thread);
};

function goBack() {
  window.history.back();
}

function goForward() {
  window.history.forward();
}

var modal = document.getElementById("myModal");
var btn = document.getElementById("openModalBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// 表单提交处理
document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault(); // 阻止表单默认提交行为

  // 获取表单数据
  var threadTitle = document.getElementById("thread_title").value;
  var icon = document.getElementById("icon").value;
  var text = document.getElementById("text").value;

  // 构建JSON数据
  var data = {
    thread_title: threadTitle,
    icon: icon,
    text: text,
    user: username,
  };

  // 发送POST请求
  fetch(`http://localhost:7777/api/threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      modal.style.display = "none"; // 关闭模态框
      allThread();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
