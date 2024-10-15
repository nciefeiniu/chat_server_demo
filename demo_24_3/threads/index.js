var currentThreadId,
  username,
  name = null;
var currentInterval = undefined;

function deleteThread(deleteThreadID) {
  fetch(`http://127.0.0.1:7777/api/threads/${deleteThreadID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: username }),
  })
    .then((response) => response.json())
    .then((data) => {
      getAllThreads();
    });
}

function getAllThreads() {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = undefined;
  }

  const threadsContainer = document.getElementById("threads");
  threadsContainer.innerHTML = "";
  fetch("http://127.0.0.1:7777/api/threads")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((thread) => {
        const threadElement = document.createElement("div");
        threadElement.classList.add("thread");
        threadElement.innerText = thread.thread_title;
        threadElement.setAttribute(
          "onclick",
          `togglePosts('thread${thread.id}', '${thread.thread_title}')`
        );
        threadsContainer.appendChild(threadElement);
        const postsContainer = document.createElement("div");
        postsContainer.classList.add("posts");
        postsContainer.id = `thread${thread.id}`;
        postsContainer.setAttribute("thread_id", thread.id);
        threadsContainer.appendChild(postsContainer);
        if (thread.user === username) {
          // 如果是自己的，那么就可删除
          const deleteButton = document.createElement("button");
          deleteButton.innerText = "Delete";
          deleteButton.setAttribute("onclick", `deleteThread(${thread.id})`);
          threadElement.appendChild(deleteButton);
        }
      });
    });
}

function getAllPosts(threadId) {
  // 获取该Thread的所有post
  fetch(`http://127.0.0.1:7777/api/threads/${threadId}/posts`)
    .then((response) => response.json())
    .then((data) => {
      const postsContainer = document.getElementById(`thread${threadId}`);
      postsContainer.innerHTML = "";
      data.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerText = post.text + " - " + post.name;
        postsContainer.appendChild(postElement);
      });
      const newPostForm = document.createElement("div");
      newPostForm.innerHTML = `
      <form action="#" method="post" onsubmit="return false;">
        <input type="text" name="text" class="post-input" id="input${threadId}" placeholder="Enter your post">
        <button type="submit" onclick="submitNewPost('${threadId}')">Submit</button>
      </form>
    `;
      postsContainer.appendChild(newPostForm);
    });
}

function submitNewPost(currentThreadID) {
  const text = document.getElementById(`input${currentThreadID}`).value;
  if (!text) {
    alert("Please enter your post");
    return;
  }
  fetch(`http://127.0.0.1:7777/api/threads/${currentThreadID}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      user: username,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      getAllPosts(currentThreadID);
    });
}

function setIntervalGetPosts(currentThreadId) {
  // 定时自动获取post
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = undefined;
  }
  currentInterval = setInterval(() => {
    getAllPosts(currentThreadId);
  }, 10000);
}

function togglePosts(threadId, threadTitle) {
  // 隐藏所有帖子
  const allPosts = document.querySelectorAll(".posts");
  allPosts.forEach((post) => {
    post.style.display = "none";
  });

  // 切换显示当前线程的帖子
  const currentPosts = document.getElementById(threadId);
  if (currentPosts.style.display === "block") {
    currentPosts.style.display = "none";
    currentThreadId = null; // 重置为无
    history.pushState(null, "", window.location.pathname); // 更新 URL
  } else {
    getAllPosts(currentPosts.getAttribute("thread_id"));
    setIntervalGetPosts(currentPosts.getAttribute("thread_id"));
    currentPosts.style.display = "block";
    currentThreadId = threadId; // 保存当前线程 ID
    history.pushState(
      { threadId, threadTitle },
      `Viewing ${threadTitle}`,
      `#${threadId}`
    );
  }
}

function newThread() {
  window.location.href = "./new_thread.html?username=" + encodeURIComponent(username);
}

function goBack() {
  window.history.back();
}

function goForward() {
  window.history.forward();
}

// 监听 popstate 事件
window.addEventListener("popstate", (event) => {
  const allPosts = document.querySelectorAll(".posts");
  allPosts.forEach((post) => {
    post.style.display = "none"; // 隐藏所有帖子
  });

  if (event.state) {
    const currentPosts = document.getElementById(event.state.threadId);
    if (currentPosts) {
      currentPosts.style.display = "block"; // 显示当前线程的帖子
      console.log(currentPosts);
      setIntervalGetPosts(currentPosts.getAttribute("thread_id"));
    }
  } else {
    currentThreadId = null; // 没有状态时重置
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = undefined;
    }
  }
});

window.onload = function () {
  // 获取当前 URL 中的参数
  const loggedUserSearch = new URLSearchParams(window.location.search);
  username = loggedUserSearch.get("user");
  name = loggedUserSearch.get("name");

  if (!username || !name) {
    window.location.href = "../login/index.html";
    return;
  }

  username = decodeURIComponent(username);
  name = decodeURIComponent(name);
  document.getElementById("current-user").innerText = name;
  getAllThreads();
};
