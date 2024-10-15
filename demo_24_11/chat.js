var allApis = {
  loginApi: "http://localhost:7777/api/users/",
  threadApi: "http://localhost:7777/api/threads",
  postApi: "http://localhost:7777/api/threads/{threadID}/posts",
  deleteApi: "http://localhost:7777/api/threads/{threadID}",
};

var jsonHeaders = {
  "Content-Type": "application/json",
};

var autoRefreshIntervalTask = null;
var autoRefreshIntervalTimeout = 10000;

const loginContainer = document.querySelector(".login");
const threadListContainer = document.getElementById("thread-list");
const createThreadContainer = document.getElementById("create-thread");
let currentUser = null;

async function login() {
  const username = document.getElementById("username").value;
  const loginMessage = document.getElementById("login-message");

  try {
    const response = await fetch(allApis.loginApi + username);
    if (response.status === 200) {
      const userData = await response.json();
      currentUser = userData;
      loginContainer.style.display = "none";
      threadListContainer.style.display = "block";
      createThreadContainer.style.display = "block";
      document.getElementById("logged-as").innerHTML =
        `Logged in as <span class="logged-name">` +
        currentUser.name +
        "</span>";
      window.history.pushState({ showPage: "Threads" }, "", "");
      loadThreads();
    } else {
      loginMessage.textContent = "User not found.";
    }
  } catch (error) {
    loginMessage.textContent = "Error logging in.";
  }
}

async function loadThreads() {
  const threadsContainer = document.getElementById("threads");
  threadsContainer.innerHTML = "";

  try {
    const response = await fetch(allApis.threadApi);
    const threads = await response.json();
    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const threadElement = document.createElement("div");
      threadElement.className = "thread";
      threadElement.innerHTML = `
              <div class="thread-title">
                  ${thread.thread_title}
                  <button onclick="userClickShowThreadBtn(${thread.id})">☘Posts</button>
                  <button onclick="deleteUserOwnerThread(${thread.id}, '${thread.user}')">X</button>
              </div>
              <div class="posts" id="posts-${thread.id}" style="display:none;"></div>
              <div class="new-posts" id="new-posts-${thread.id}" style="display:none;">
                <input id="new-posts-input-container-${thread.id}"></input><button onclick="threadSendNewPost(${thread.id})">New</button>

                </div>
          `;
      threadsContainer.appendChild(threadElement);
    }
  } catch (error) {
    console.error("Error loading threads:", error);
  }
}

async function deleteUserOwnerThread(threadID, ownerUser) {
  if (ownerUser !== currentUser.username) {
    alert(
      "You are not the owner of this thread. You can delete only your own threads."
    );
    return;
  }
  const response = await fetch(
    allApis.deleteApi.replace("{threadID}", threadID),
    {
      method: "DELETE",
      headers: jsonHeaders,
      body: JSON.stringify({
        user: currentUser.username,
      }),
    }
  );
  if (response.ok) {
    loadThreads();
  } else {
    alert("Delete Thread Failed");
  }
}

async function threadSendNewPost(threadID) {
  const newPostInput = document.getElementById(
    `new-posts-input-container-${threadID}`
  );
  const newPostMessage = newPostInput.value;
  if (!newPostMessage) return;

  try {
    const response = await fetch(
      allApis.postApi.replace("{threadID}", threadID),
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          user: currentUser.username,
          text: newPostMessage,
        }),
      }
    );
    if (response.ok) {
      newPostInput.value = "";
      autoRefreshThreadPosts(threadID);
    }
  } catch (error) {
    console.log(error);
  }
}

async function userClickShowThreadBtn(threadID) {
  if (await showThreadPosts(threadID)) {
    window.history.pushState(
      { showPage: "Threads-Posts", threadID: threadID },
      "",
      ""
    );
  }
}

async function showThreadPosts(threadID) {
  const postsContainerID = `posts-${threadID}`;
  const newPostContainerID = `new-posts-${threadID}`;
  const postsContainer = document.getElementById(postsContainerID);
  const newPostContainer = document.getElementById(newPostContainerID);
  const allPostsContainer = document.getElementsByClassName("posts");
  const allNewPostsContainer =
    document.getElementsByClassName("new-posts");
  for (let i = 0; i < allPostsContainer.length; i++) {
    const choicePostsContainer = allPostsContainer[i];
    if (choicePostsContainer.id !== postsContainerID)
      choicePostsContainer.style.display = "none";
  }

  for (let i = 0; i < allNewPostsContainer.length; i++) {
    const choiceNewPostsContainer = allNewPostsContainer[i];
    if (choiceNewPostsContainer.id !== newPostContainerID)
      choiceNewPostsContainer.style.display = "none";
  }

  if (postsContainer.style.display === "none") {
    if (autoRefreshIntervalTask) clearInterval(autoRefreshIntervalTask);
    autoRefreshIntervalTask = setInterval(() => {
      autoRefreshThreadPosts(threadID);
    }, autoRefreshIntervalTimeout);

    postsContainer.style.display = "block";
    newPostContainer.style.display = "block";
    try {
      const response = await fetch(
        allApis.postApi.replace(/{threadID}/, threadID)
      );
      const posts = await response.json();
      postsContainer.innerHTML = "";
      for (let p = 0; p < posts.length; p++) {
        const post = posts[p];
        postsContainer.innerHTML += `
              <div class="post">
                  <strong class="post-text">${post.text}</strong> - <span class="post-owner-name">${post.name} </span>
              </div>
          `;
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }

    return true;
  }
  return false;
}

async function autoRefreshThreadPosts(threadID) {
  const postsContainer = document.getElementById(`posts-${threadID}`);
  const response = await fetch(
    allApis.postApi.replace(/{threadID}/, threadID)
  );
  const posts = await response.json();
  postsContainer.innerHTML = "";

  for (let p = 0; p < posts.length; p++) {
    const post = posts[p];
    postsContainer.innerHTML += `
              <div class="post">
                  <strong class="post-text">${post.text}</strong> - <span class="post-owner-name">${post.name} </span>
              </div>
          `;
  }
}

async function createThread() {
  const title = document.getElementById("new-thread-title").value;
  const icon = document.getElementById("new-thread-icon").value;
  const firstPostMessage =
    document.getElementById("new-thread-post").value;
  const createThreadMessage = document.getElementById(
    "create-thread-message"
  );

  const newThreadData = {
    thread_title: title,
    icon: icon,
    user: currentUser.username,
    text: firstPostMessage,
  };

  try {
    const response = await fetch(allApis.threadApi, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(newThreadData),
    });

    if (response.ok) {
      createThreadMessage.textContent = "Thread created successfully!";
      loadThreads();
    } else {
      createThreadMessage.textContent = "Error creating thread.";
    }
  } catch (error) {
    createThreadMessage.textContent = "Error creating thread.";
  }
}

window.onpopstate = function (event) {
  const state = event.state;
  if (state) {
    const showPage = state.showPage;
    if (showPage === "Threads") {
      const allPostsContainer = document.getElementsByClassName("posts");
      const allNewPostsContainer =
        document.getElementsByClassName("new-posts");
      for (let i = 0; i < allPostsContainer.length; i++) {
        const choicePostsContainer = allPostsContainer[i];
        choicePostsContainer.style.display = "none";
      }

      for (let i = 0; i < allNewPostsContainer.length; i++) {
        const choiceNewPostsContainer = allNewPostsContainer[i];
        choiceNewPostsContainer.style.display = "none";
      }
    } else if (showPage === "Threads-Posts") {
      showThreadPosts(state.threadID);
    }
  } else {
    loginContainer.style.display = "block";
    threadListContainer.style.display = "none";
    createThreadContainer.style.display = "none";
  }
};
