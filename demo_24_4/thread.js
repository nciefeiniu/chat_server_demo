var currentThread = undefined;
var currentInterval = undefined;
var deletedThreadsID = [];
var username = undefined;
var name = undefined;

const threadList = document.getElementById("thread-list");
const backBtn = document.getElementById("back-btn");
const forwardBtn = document.getElementById("forward-btn");
let historyStack = [];
let currentThreadIndex = -1;

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  name = decodeURIComponent(urlParams.get("name"));
  username = decodeURIComponent(urlParams.get("username"));
  document.getElementById("logged-name").textContent = `Logged in as ${name}`;
};

function renderThreads(threads) {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = undefined;
  }
  document.getElementById("del-thread-btn").style.display = "none";
  document.getElementById("new-thread-btn").style.display = "inline";
  console.log("render threads");
  threadList.innerHTML = "";

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const index = i;
    const threadElem = document.createElement("div");
    threadElem.className = "thread";
    threadElem.textContent = thread.thread_title;
    threadElem.onclick = function () {
      showThreadPosts(thread, index);
    };
    threadList.appendChild(threadElem);
  }
}

function showThreadPosts(thread, index, add2History = true) {
  currentThread = thread;
  currentThreadIndex = index;
  if (add2History) {
    window.history.pushState(
      { thread, index },
      thread.thread_title,
      `threads.html#${index}`
    );
  }

  getPosts(thread, renderPosts);
  currentInterval = setInterval(() => {
    getPosts(thread, renderPosts);
  }, 10000);
}

backBtn.addEventListener("click", function () {
  window.history.back();
});

forwardBtn.addEventListener("click", function () {
  window.history.forward();
});

window.addEventListener("popstate", function (event) {
  console.log(event.state);
  if (event.state && event.state.thread) {
    if (deletedThreadsID.includes(event.state.thread.id)) {
      return;
    }
    showThreadPosts(event.state.thread, event.state.index, false);
  } else {
    currentThreadID = undefined;
    getAllThreads(renderThreads);
  }
});

getAllThreads(renderThreads);

function renderPosts(thread) {
  console.log("thread:", thread);
  threadList.innerHTML = "";
  const postsContainer = document.createElement("div");
  const postsTitle = document.createElement("h2");
  postsTitle.innerHTML = `Posts in <span class="thread-title-span">${thread.thread_title}</span>`;
  postsContainer.appendChild(postsTitle);

  for (let i = 0; i < thread.posts.length; i++) {
    const post = thread.posts[i];
    const postElem = document.createElement("div");
    postElem.className = "post";
    postElem.textContent = post.text + " - " + post.name;
    postsContainer.appendChild(postElem);
  }

  threadList.appendChild(postsContainer);
  threadList.innerHTML +=
    '<input class="post-input"></input><button class="post-btn" onclick="sendPost()">Post</button>';
  if (thread.user === username) {
    document.getElementById("del-thread-btn").style.display = "inline";
  }
  document.getElementById("new-thread-btn").style.display = "none";
}

function sendPost() {
  const postText = document.querySelector(".post-input").value;
  if (!postText) {
    console.log("No post text");
    return;
  }
  fetch(`http://localhost:7777/api/threads/${currentThread.id}/posts`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      text: postText,
      user: username,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Post created:", data);
      getPosts(currentThread, renderPosts);
    });
}

document.getElementById("del-thread-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this thread?")) {
    fetch(`http://127.0.0.1:7777/api/threads/${currentThread.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify({
        user: username,
      }),
    }).then((response) => {
      if (response.ok) {
        deletedThreadsID.push(currentThread.id);
        window.history.back();
      }
    });
  }
});

const openPopupBtn = document.getElementById("new-thread-btn");
const popup = document.getElementById("popup");
const close = document.getElementsByClassName("close")[0];
const threadForm = document.getElementById("thread-form");

openPopupBtn.onclick = function () {
  popup.style.display = "flex";
};

close.onclick = function () {
  popup.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === popup) {
    popup.style.display = "none";
  }
};

threadForm.onsubmit = function (event) {
  event.preventDefault();
  const threadTitle = document.getElementById("thread_title").value;
  const icon = document.getElementById("icon").value;
  const text = document.getElementById("text").value;

  const formData = {
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
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      popup.style.display = "none";
      getAllThreads(renderThreads);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
