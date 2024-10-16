const apiUrl = "http://localhost:7777";
let loggedUserInfo = undefined;
let currentShowThreadId = undefined;
let currentRunningThreadPost = undefined;

function loginHandleApi(username) {
  fetch(apiUrl + "/api/users/" + username)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      return Promise.reject(new Error("User not found"));
    })
    .then((successData) => {
      // Login success
      loggedUserInfo = successData;
      window.history.pushState(
        { currentPage: "threads" },
        "Threads",
        "/threads"
      );
      showThreadPage();
    })
    .catch((error) => {
      // Login failed
      alert(error);
    });
}

function threadsHandleApi() {
  // Get all threads
  fetch(apiUrl + "/api/threads")
    .then((response) => response.json())
    .then((successData) => {
      // Successfully obtained data, needs to be rendered onto the page
      const loginBox = document.querySelector("#loginBox");
      loginBox.innerHTML = "";
      let threadsPageContent = `<h1>Logged in as ${loggedUserInfo.name}</h1>`;
      // render threads
      for (let i = 0; i < successData.length; i++) {
        threadsPageContent += `<div class="threadBox" id="threadBox-${
          successData[i].id
        }" onclick="showThreadPostsPage('${successData[i].id}')">
                  <div class="threadTitle">${successData[i].thread_title} ${
          successData[i].user === loggedUserInfo.username
            ? `<span class="deleteTreadButton" onclick="deleteThreadHandle(${successData[i].id})"> X </span>`
            : ""
        }</div>
                  <div class="postsBox" id="thread-${successData[i].id}">
                  </div>
              </div>`;
      }
      threadsPageContent += `<div class="navigation-buttons">
                                        <button onclick="window.history.back()">Back</button>
                                        <button onclick="window.history.forward()">Forward</button>
                                        <button onclick="showNewThreadPage()">New Thread</button>
                                    </div>`;
      loginBox.innerHTML = threadsPageContent;
    });
}

function threadPostsHandleApi(threadId, addIn = true) {
  // Get all posts in a thread
  // Hidden Other thread posts
  currentShowThreadId = threadId;
  document.querySelectorAll(".postsBox").forEach((postBox) => {
    if (postBox.id !== "thread-" + threadId) {
      postBox.style.display = "none";
    }
  });
  fetch(apiUrl + "/api/threads/" + threadId + "/posts")
    .then((response) => response.json())
    .then((successData) => {
      // Successfully obtained data, needs to be rendered onto the page
      const threadPostsBox = document.querySelector("#thread-" + threadId);
      threadPostsBox.innerHTML = "";
      for (let i = 0; i < successData.length; i++) {
        threadPostsBox.innerHTML += `<div class="postInline">${
          successData[i].text + " - " + successData[i].name
        }</div>`;
      }
      threadPostsBox.innerHTML += `<input class="inputField" id="threadNewPostInput-${threadId}" onclick="event.stopPropagation();"></input><button onclick="threadNewPostHandle()">Send</button>`;

      threadPostsBox.style.display = "block";
    })
    .catch((err) => {
      console.log("This thread is not available");
    });

  if (addIn === false) {
    return;
  }

  if (currentRunningThreadPost) {
    clearInterval(currentRunningThreadPost);
    currentRunningThreadPost = undefined;
  }
  currentRunningThreadPost = setInterval(() => {
    threadPostsHandleApi(threadId, false);
  }, 10000);
}

function threadNewPostHandleApi(threadId, content) {
  // Create a new post in a thread
  fetch(apiUrl + "/api/threads/" + threadId + "/posts", {
    method: "POST",
    body: JSON.stringify({
      text: content,
      user: loggedUserInfo.username,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((successData) => {
      threadPostsHandleApi(threadId);
    });
}

function newThreadHandleApi(title, content, username, icon) {
  // Create a new thread
  fetch(apiUrl + "/api/threads", {
    method: "POST",
    body: JSON.stringify({
      thread_title: title,
      text: content,
      user: username,
      icon: icon,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((successData) => {
      alert("Thread created successfully");
      window.history.back();
    });
}

function deleteThreadHandleApi(threadId) {
  // Delete a thread
  fetch(apiUrl + "/api/threads/" + threadId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: loggedUserInfo.username }),
  }).then((response) => {
    console.log(response);
    if (response.status === 204) {
      console.log("Delete Thread success");
      document.querySelector("#threadBox-" + threadId).remove();
    }
  });
}

function newThreadPageHandle() {
  document.querySelector("#loginBox").innerHTML = `<h1>Create Thread</h1>
    <div class="formGroup">
        <label for="threadTitle">Thread Title:</label>
        <input type="text" class="inputField" id="threadTitle" placeholder="Enter thread title...">
    </div>
    <div class="formGroup">
        <label for="thread-icon">Icon:</label>
        <input type="text" class="inputField" id="threadIcon" placeholder="Enter icon name...">
    </div>
    <div class="formGroup">
        <label for="threadText">Text:</label>
        <textarea id="threadText" class="inputField" rows="4" placeholder="Enter thread text..."></textarea>
    </div>
    <button class="loginBtn" onclick="createThreadHandle()">Create Thread</button>
    <button style="margin-top: 10px;" onclick="window.history.back()">Back</button>`;
}

function loginHandle() {
  const username = document.querySelector("#usernameInput").value;
  if (username === undefined || username === "" || username === null) {
    return;
  }
  loginHandleApi(username);
}

function createThreadHandle() {
  const title = document.getElementById("threadTitle").value;
  const icon = document.getElementById("threadIcon").value;
  const text = document.getElementById("threadText").value;
  if (!title || !icon || !text) {
    alert("Please complete the form before submitting!");
    return;
  }
  newThreadHandleApi(title, text, loggedUserInfo.username, icon);
}

function showThreadPage() {
  threadsHandleApi();
}

function showNewThreadPage() {
  window.history.pushState(
    { currentPage: "new" },
    "New Thread Page",
    "/new_thread"
  );
  newThreadPageHandle();
}

function showLoginPage() {
  document.querySelector(
    "#loginBox"
  ).innerHTML = `<h2 class="loginTitle">Login</h2>
      <input
        type="text"
        class="inputField"
        placeholder="Please enter your username"
        id="usernameInput"
      />
      <button class="loginBtn" onclick="loginHandle()">Submit</button>`;
}

function showThreadPostsPage(threadId) {
  const thisPosts = document.querySelector("#thread-" + threadId);
  if (thisPosts.style.display === "block") {
    thisPosts.style.display = "none";
    return;
  }

  window.history.pushState(
    { currentPage: "posts", threadId: threadId },
    "Thread Posts",
    "/thread-posts?id=" + threadId
  );
  threadPostsHandleApi(threadId);
}

function threadNewPostHandle() {
  if (currentShowThreadId === undefined) {
    return false;
  }
  const newPostText = document.querySelector(
    "#threadNewPostInput-" + currentShowThreadId
  ).value;
  if (!newPostText || newPostText === "") {
    return false;
  }
  threadNewPostHandleApi(currentShowThreadId, newPostText);
  return false;
}

function deleteThreadHandle(threadId) {
  event.stopPropagation();
  deleteThreadHandleApi(threadId);
}

window.onpopstate = function (event) {
  if (event.state) {
    const currentPageState = event.state;
    if (currentPageState.currentPage === "posts") {
      // This is show the posts
      if (document.querySelectorAll(".postsBox").length <= 0) {
        threadsHandleApi();
      }
      threadPostsHandleApi(currentPageState.threadId);
    } else if (currentPageState.currentPage === "threads") {
      // This is threads page
      threadsHandleApi();
    } else if (currentPageState.currentPage === "new") {
      newThreadPageHandle();
    }
  } else {
    showLoginPage();
  }
};

window.onload = function () {
  showLoginPage();
};
