var loggedUserInfo = {};
var runningInterval = null;

const app = document.getElementById("app");

showLoginPageHandle();

function fetchLoginApi(username, callback) {
  fetch("http://localhost:7777/api/users/" + username)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(`Username: ${username} not found!`);
    })
    .then((data) => callback(data))
    .catch((err) => console.log(err));
}

function showLoginPageHandle() {
  // show the login page
  app.innerHTML = `
      <div class="container">
        <div>Welcome, Please Login.</div>
        <input type="text" id="username" placeholder="Enter username" style="width: 400px; margin-top: 20px;"/>
        <button onclick="userClickLoginButton()">Login</button>
      </div>
      `;
}

function userClickLoginButton() {
  // login
  const username = document.getElementById("username").value;
  if (!username) {
    return alert("Please enter username!");
  }
  fetchLoginApi(username, function (data) {
    // login success
    loggedUserInfo = data;
    showThreadPageHandle();
  });
}

function fetchThreadApi(callback) {
  fetch("http://localhost:7777/api/threads")
    .then((res) => res.json())
    .then((data) => {
      // show the thread list
      callback(data);
    })
    .catch((err) => console.log(err));
}

function showThreadPageHandle() {
  fetchThreadApi(function (apiResult) {
    let pageHtml = `<div class="container">
            <div class="user-name">Welcome, ${loggedUserInfo.name}</div>
            <div>
              <button onclick="showCreateThreadPageHandle()">Create Thread</button>
              <button onclick="window.history.back()">Back</button>
              <button onclick="window.history.forward()">Forward</button>

            </div>
            <div id="threads">`;
    for (let i = 0; i < apiResult.length; i++) {
      pageHtml += `
          <div class="thread-item">
            <div class="thread-item-title">${apiResult[i].thread_title} 
              <span><button onclick="showThreadPosts(${
                apiResult[i].id
              })">👇</button></span>
              ${
                loggedUserInfo.username === apiResult[i].user
                  ? `<span><button onclick="userClickDeletethreadHandle(${apiResult[i].id})">Delete</button></span>`
                  : ""
              }
              </div>
            <div class="thread-item-posts" id="thread-item-posts-${
              apiResult[i].id
            }" style="display: none;">
              <div class="posts-list"></div>
              <div class="new-post">
                <input id="new-post-${apiResult[i].id}"></input>
                <button onclick="userSendNewPost2Thread(${
                  apiResult[i].id
                })">👊</button>
                </div>
              </div>
          </div>
          `;
    }
    pageHtml += `</div></div>`;
    app.innerHTML = pageHtml;
  });
}

function fetchThreadPostsApi(threadID, callback) {
  fetch(`http://localhost:7777/api/threads/${threadID}/posts`)
    .then((res) => res.json())
    .then((data) => {
      // show the thread list
      callback(data);
    })
    .catch((err) => console.log(err));
}

function showThreadPosts(threadID, needSetWindowState) {
  if (needSetWindowState === undefined || needSetWindowState === null)
    needSetWindowState = true;

  const showThreadPostsContainerID = `thread-item-posts-${threadID}`;
  const threadItemPostsDiv = document.getElementById(
    showThreadPostsContainerID
  );

  if (threadItemPostsDiv.style.display !== "none") return;

  if (runningInterval) clearInterval(runningInterval);
  runningInterval = setInterval(function () {
    fetchThreadPostsApi(threadID, function (apiResult) {
      // console.log(apiResult);
      let threadPostsHtml = "";
      for (let i = 0; i < apiResult.length; i++) {
        threadPostsHtml += `
          <p class="post">${apiResult[i].text} - ${apiResult[i].name}</p>
          `;
      }
      // console.log("threadPostsHtml: ", threadPostsHtml);
      threadItemPostsDiv.querySelector(".posts-list").innerHTML =
        threadPostsHtml;
    });
  }, 10000);

  // hidden other thread posts
  const threadsAllPostsDiv =
    document.getElementsByClassName("thread-item-posts");
  for (let i = 0; i < threadsAllPostsDiv.length; i++) {
    if (threadsAllPostsDiv[i].id !== showThreadPostsContainerID) {
      threadsAllPostsDiv[i].style.display = "none";
    }
  }

  fetchThreadPostsApi(threadID, function (apiResult) {
    // console.log(apiResult);
    let threadPostsHtml = "";
    for (let i = 0; i < apiResult.length; i++) {
      threadPostsHtml += `
          <p class="post">${apiResult[i].text} - ${apiResult[i].name}</p>
          `;
    }
    // console.log("threadPostsHtml: ", threadPostsHtml);
    threadItemPostsDiv.querySelector(".posts-list").innerHTML = threadPostsHtml;
    threadItemPostsDiv.style.display = "block";
  });
  if (needSetWindowState) {
    console.log("set window state");
    window.history.pushState({ id: threadID }, "", "?id=" + threadID);
  }
}

function fetchNewPostApi(newPost, threadID, callback) {
  fetch(`http://localhost:7777/api/threads/${threadID}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: loggedUserInfo.username, text: newPost }),
  })
    .then((res) => {
      if (res.ok) {
        callback();
        return;
      }
      throw new Error(`Failed to send new post to thread: ${threadID}`);
    })
    .catch((err) => console.log(err));
}

function userSendNewPost2Thread(threadID) {
  console.log("userSendNewPost2Thread");
  const newPostText = document.getElementById(`new-post-${threadID}`).value;
  if (!newPostText) {
    return alert("Please enter new post text!");
  }
  const threadItemPostsDiv = document.getElementById(
    `thread-item-posts-${threadID}`
  );
  fetchNewPostApi(newPostText, threadID, function () {
    const threadItemPostsDiv = document.getElementById(
      `thread-item-posts-${threadID}`
    );
    threadItemPostsDiv.querySelector(
      ".posts-list"
    ).innerHTML += `<p class="post">${newPostText} - ${loggedUserInfo.name}</p>`;
    document.getElementById(`new-post-${threadID}`).value = "";
  });
}

function userClickDeletethreadHandle(threadID) {
  const confirmed = confirm("Are you sure you want to delete this thread?");
  if (!confirmed) return;
  fetch(`http://localhost:7777/api/threads/${threadID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: loggedUserInfo.username }),
  })
    .then((res) => {
      if (res.ok) {
        if (runningInterval) clearInterval(runningInterval);
        showThreadPageHandle();
        return;
      }
      throw new Error(`Failed to delete thread: ${threadID}`);
    })
    .catch((err) => console.log(err));
}

function showCreateThreadPageHandle() {
  if (runningInterval) clearInterval(runningInterval);
  app.innerHTML = `
      <div class="create-thread">
        <p>Create a New Thread, You Need Input some information.</p>
        <div><input type="text" id="new-thread-title" placeholder="Thread Title" /></div>
        <div><input type="text" id="new-thread-icon" placeholder="Thread Icon" /></div>
        <div><textarea
          id="new-thread-post"
          placeholder="First post message"
        ></textarea></div>
        <button onclick="createThreadHandle()">Create Thread</button>
        <button onclick="cancelThreadHandle()">Cancel</button>
        </div>`;
}

function cancelThreadHandle() {
  showThreadPageHandle();
}

function createThreadHandle() {
  const newThreadTitle = document.getElementById("new-thread-title").value;
  const newThreadIcon = document.getElementById("new-thread-icon").value;
  const newThreadPost = document.getElementById("new-thread-post").value;

  if (!newThreadTitle || !newThreadPost) {
    return alert("Please enter all information!");
  }

  fetch("http://localhost:7777/api/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      thread_title: newThreadTitle,
      icon: newThreadIcon,
      user: loggedUserInfo.username,
      text: newThreadPost,
    }),
  }).then((res) => {
    if (res.ok) {
      showThreadPageHandle();
    }
  });
}

window.onpopstate = function (event) {
  console.log("event: ", event);
  if (event.state && event.state.id) {
    const currentThreadID = event.state.id;
    console.log(`Show Thread ${currentThreadID} Posts Page`);
    showThreadPosts(currentThreadID, false);
  } else {
    showThreadPageHandle();
  }
};
