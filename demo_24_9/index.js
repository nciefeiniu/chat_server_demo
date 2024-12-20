var user,
  name = null;
var IntervalRunning = null;

function showUserCreateNewThread() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("new-thread").classList.remove("hidden");
  window.history.pushState(
    { page: "newThreadPage" },
    "New Thread",
    "./new-thread"
  );
}

function showThreadListPage() {
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("new-thread").classList.add("hidden");
}

function userCreateNewThread() {
  const newThreadTitle = document.getElementById("new-thread-title").value;
  const newThreadContent = document.getElementById("new-thread-content").value;
  const newThreadIcon = document.getElementById("new-thread-icon").value;

  fetch("http://127.0.0.1:7777/api/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      thread_title: newThreadTitle,
      text: newThreadContent,
      icon: newThreadIcon,
      user,
    }),
  }).then((response) => {
    if (response.ok) {
      alert("Thread created successfully!");
      document.getElementById("app").classList.remove("hidden");
      document.getElementById("new-thread").classList.add("hidden");
      window.history.back();
    } else {
      alert("Failed to create thread. Please try again.");
    }
  });
}

function login() {
  const username = document.getElementById("username").value;
  fetch(`http://127.0.0.1:7777/api/users/${username}`)
    .then((response) => {
      if (response.status === 200) {
        response.json().then((userInfo) => {
          console.log(userInfo);
          document.getElementById("login").classList.add("hidden");
          document.getElementById("app").classList.remove("hidden");
          user = userInfo.username;
          name = userInfo.name;
          window.history.pushState({ page: "threads" }, "Threads", "./threads");
          document.querySelector(
            "h4"
          ).innerHTML = `Logged in as ${userInfo.name}`;
          loadThreads();
        });
      } else {
        alert("User not found");
      }
    })
    .catch((error) => console.error("Error:", error));
}

// ThreadList Component
function loadThreads() {
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("new-thread").classList.add("hidden");

  fetch("http://127.0.0.1:7777/api/threads")
    .then((response) => response.json())
    .then((threads) => {
      const threadsContainerTag = document.getElementById("threadsListWap");
      threadsContainerTag.innerHTML = "";
      for (let a = 0; a < threads.length; a++) {
        const thread = threads[a];
        const threadItemContainerTag = document.createElement("div");
        threadItemContainerTag.className = "thread-item";
        threadItemContainerTag.setAttribute("data-thread-id", thread.id);
        threadItemContainerTag.innerHTML = `<strong>${thread.thread_title}</strong>`;
        threadItemContainerTag.onclick = (event) => {
          console.log("Who triggered load posts", event.target.tagName);
          if (event.target.tagName === "INPUT") {
            event.stopPropagation();
            return;
          } else if (event.target.tagName === "BUTTON") {
            UserSendNewPost2Thread(thread.id);
            return;
          }
          console.log("load posts");
          loadPosts(thread.id, threadItemContainerTag);
        };

        const parentDivTag = document.createElement("div");
        parentDivTag.style = "display: flex; align-items: center;";
        parentDivTag.appendChild(threadItemContainerTag);
        if (thread.user === user) {
          const userDelSelfThreadBtnTag = document.createElement("button");
          userDelSelfThreadBtnTag.innerText = "Del";
          parentDivTag.appendChild(userDelSelfThreadBtnTag);
          userDelSelfThreadBtnTag.onclick = (event) => {
            event.stopPropagation();
            console.log("delete thread");
            userdeleteSelfThread(thread.id);
          };
        }
        threadsContainerTag.appendChild(parentDivTag);
      }
    })
    .catch((error) => console.error("Error fetching threads:", error));
}

function userdeleteSelfThread(threadId) {
  fetch(`http://127.0.0.1:7777/api/threads/${threadId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user,
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert("Thread deleted successfully!");
        loadThreads();
      } else {
        alert("Failed to delete thread. Please try again.");
      }
    })
    .catch((error) => {});
}

function loadPosts(threadId, threadItemContainerTag, setDingshiRenwu = true) {
  console.log("threadItemContainerTag: ", threadItemContainerTag);
  if (!threadItemContainerTag) {
    threadItemContainerTag = document.querySelector(
      `.thread-item[data-thread-id='${threadId}']`
    );
  } else {
    console.log("set history");
    window.history.pushState(
      { page: "posts", threadId: threadId },
      "Posts",
      "./posts?id=" + threadId
    );
  }

  if (setDingshiRenwu === true) {
    if (IntervalRunning) {
      clearInterval(IntervalRunning);
      IntervalRunning = null;
    }
    IntervalRunning = setInterval(() => {
      loadPosts(threadId, null, false);
    }, 10000);
  }

  fetch(`http://127.0.0.1:7777/api/threads/${threadId}/posts`)
    .then((response) => response.json())
    .then((threadPostsData) => {
      if (
        document.querySelector(`.posts-container[data-thread-id='${threadId}']`)
      ) {
        var postsContainerTag = document.querySelector(
          `.posts-container[data-thread-id='${threadId}']`
        );
        postsContainerTag.innerHTML = "";
      } else {
        var postsContainerTag = document.createElement("div");
        postsContainerTag.classList.add("posts-container");
        postsContainerTag.setAttribute("data-thread-id", threadId);
      }

      const AllThreadsPosts = document.querySelectorAll(".posts-container");
      for (let i = 0; i < AllThreadsPosts.length; i++) {
        const currentPostsTag = AllThreadsPosts[i];
        if (currentPostsTag.getAttribute("data-thread-id") != threadId) {
          currentPostsTag.remove();
        }
      }

      for (let a = 0; a < threadPostsData.length; a++) {
        const post = threadPostsData[a];
        const postElement = document.createElement("div");
        postElement.className = "post-item";
        postElement.innerHTML = `${post.text} <br> &nbsp;&nbsp;&nbsp;&nbsp; - ${post.name}`;
        postsContainerTag.appendChild(postElement);
      }
      postsContainerTag.innerHTML += `<div class="new-post-container">
                <input class="new-post-input-tag-${threadId}"></input><button onlick="UserSendNewPost2Thread(${threadId})">Enter</button>
              </div>`;

      threadItemContainerTag.appendChild(postsContainerTag);
    })
    .catch((error) => console.error("Error fetching posts:", error));
}

function UserSendNewPost2Thread(threadId) {
  console.log("UserSendNewPost2Thread");
  event.preventDefault();
  const userInputVal = document.querySelector(
    `.new-post-input-tag-${threadId}`
  ).value;
  if (!userInputVal) {
    return;
  }
  fetch("http://127.0.0.1:7777/api/threads/" + threadId + "/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: userInputVal,
      user,
    }),
  }).then((response) => {
    if (response.ok) {
      loadPosts(threadId, null);
    } else {
      alert("Failed to send post.");
    }
  });
}

window.onpopstate = function (event) {
  const currentPage = event.state ? event.state.page : null;
  const threadId = event.state ? event.state.threadId : null;
  console.log(currentPage);
  if (currentPage === "threads") {
    loadThreads();
  } else if (currentPage === "posts") {
    loadPosts(threadId);
  } else if (currentPage === "newThreadPage") {
    showUserCreateNewThread();
  } else {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("new-thread").classList.add("hidden");
  }
};
