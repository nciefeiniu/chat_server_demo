let username;
let currentThreadId;
let currentThreadTitle = null;
let currentThreadInv = null;

function fetchThreads() {
  fetch("http://127.0.0.1:7777/api/threads")
    .then((response) => response.json())
    .then((data) => {
      renderThreadsFunc(data);
    });
}

function logout() {
  if (currentThreadInv) {
    clearInterval(currentThreadInv);
  }
  currentThreadId = null;
  username = null;
  currentThreadTitle = null;
  document.getElementById("login-container").style.display = "block";
  document.getElementById("app-container").style.display = "none";
}

function login() {
  username = document.getElementById("username").value;
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  fetch(`http://127.0.0.1:7777/api/users/${username}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        alert("Username not found.");
      }
    })
    .then((userInfo) => {
      document.getElementById("current-user").innerText = userInfo.name;
      document.getElementById("login-container").style.display = "none";
      document.getElementById("app-container").style.display = "block";
      fetchThreads(); // Start the interval here
    });
}

function renderThreadsFunc(threads) {
  const threadsContainer = document.getElementById("threads");
  threadsContainer.innerHTML = "";
  for (let i = 0; i < threads.length; i++) {
    let thread = threads[i];
    const threadDiv = document.createElement("div");
    threadDiv.innerHTML = `${thread.icon}  ${thread.thread_title}  <span class="thread-owner"> - ${thread.user}</span>`;
    threadDiv.style.cursor = "pointer";
    threadDiv.setAttribute("style", "cursor: pointer; margin: 20px 2px;");
    threadDiv.onclick = () => {
      currentThreadTitle = thread.thread_title;
      fetchPosts(thread.id);
      history.pushState(
        { threadId: thread.id, threadTitle: thread.thread_title },
        thread.thread_title,
        `#${thread.id}`
      );
    };

    if (thread.user === username) {
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.onclick = (event) => {
        event.stopPropagation();
        deleteThread(thread.id);
      };
      threadDiv.appendChild(deleteButton);
    }

    threadsContainer.appendChild(threadDiv);
  }
}

function deleteThread(threadId) {
  fetch(`http://127.0.0.1:7777/api/threads/${threadId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: username }),
  }).then((response) => {
    if (response.ok) {
      fetchThreads(); // Refresh the threads list
      alert("Thread deleted successfully!");
    } else {
      alert("Failed to delete thread.");
    }
  });
}

function createNewThread() {
  const threadTitle = document.getElementById("threadTitle").value;
  const initialPost = document.getElementById("initialPost").value;
  const threadIcon = document.getElementById("threadIcon").value;
  if (!threadTitle || !initialPost) {
    alert("Please fill in all fields.");
    return;
  }

  const data = {
    thread_title: threadTitle,
    icon: threadIcon, // 可根据需求更改
    user: username,
    text: initialPost,
  };

  fetch("http://127.0.0.1:7777/api/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
    })
    .then((response) => {
      console.log(response);
      alert("Thread created successfully!");
      closeNewThreadModal();
      fetchThreads();
    })
    .catch((error) => {
      alert("Failed to create thread: " + error.message);
    });
}

function closeNewThreadModal() {
  document.getElementById("new-thread-modal").style.display = "none";
}

function openNewThreadModal() {
  document.getElementById("new-thread-modal").style.display = "block";
}

function fetchPosts(threadId) {
  currentThreadId = threadId;
  fetch(`http://127.0.0.1:7777/api/threads/${threadId}/posts`)
    .then((response) => response.json())
    .then((posts) => {
      renderPosts(posts);
    });
  autoFetchPostsTentSeconds();
}

function autoFetchPostsTentSeconds() {
  currentThreadInv = setInterval(() => {
    fetch(`http://127.0.0.1:7777/api/threads/${currentThreadId}/posts`)
      .then((response) => response.json())
      .then((posts) => {
        renderPosts(posts);
      });
  }, 10000);
}

function renderPosts(posts) {
  document.getElementById("current-thread-title").innerText =
    currentThreadTitle;
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const postDiv = document.createElement("div");
    postDiv.setAttribute("style", "margin: 10px 5px;");
    postDiv.innerText = `${post.text} - ${post.name}`;
    postsContainer.appendChild(postDiv);
  }

  document.getElementById("app-container").style.display = "none";
  document.getElementById("posts-container").style.display = "block";
}

function submitPost() {
  const postText = document.getElementById("newPost").value;
  if (!postText) {
    alert("Please enter a post.");
    return;
  }

  fetch(`http://127.0.0.1:7777/api/threads/${currentThreadId}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: postText, user: username }),
  }).then((response) => {
    if (response.ok) {
      document.getElementById("newPost").value = "";
      fetchPosts(currentThreadId);
    } else {
      alert("Failed to add post.");
    }
  });
}

function goBackToThreads() {
  console.log("clear interval");
  clearInterval(currentThreadInv);
  document.getElementById("posts-container").style.display = "none";
  document.getElementById("app-container").style.display = "block";
}

window.onpopstate = function (event) {
  if (event.state) {
    fetchPosts(event.state.threadId);
  } else {
    goBackToThreads();
  }
};
