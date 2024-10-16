let currentThreadId = null;
let username = undefined;
let name = undefined;
let autoLoadPosts = undefined;

function displayCreateThread() {
  document.querySelector(".container-new-thread").style.display = "block";
  document.querySelector(".container-thread").style.display = "none";
}

function displayThreadList() {
  document.querySelector(".container-new-thread").style.display = "none";
  document.querySelector(".container-thread").style.display = "block";
}

async function createThread() {
  const formData = {
    thread_title: document.getElementById("postTitle").value,
    icon: document.getElementById("postIcon").value,
    text: document.getElementById("postText").value,
    user: username,
  };

  fetch("http://localhost:7777/api/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (response.ok) {
        alert("Post submitted successfully!");
        displayThreadList();
        fetchThreads();
      } else {
        alert("Failed to submit post.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while submitting the post.");
    });
}

function hiddenAllPosts() {
  const postsDivs = document.querySelectorAll(".posts");
  for (var i=0; i < postsDivs.length; i++) {
    postsDivs[i].style.display = "none";
  }
}

async function fetchThreads() {
  try {
    const response = await fetch("http://localhost:7777/api/threads");
    const threads = await response.json();
    displayThreads(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
  }
}

async function deleteThread(threadId) {
  if (confirm("Are you sure you want to delete this thread?")) {
    const response = await fetch(
      `http://localhost:7777/api/threads/${threadId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: username }),
      }
    );

    if (response.ok) {
      // Remove the thread from the UI
      const threadDiv = document.querySelector(`#thread-${threadId}`);
      threadDiv.parentNode.removeChild(threadDiv);
      const postsDiv = document.getElementById(`posts-${threadId}`);
      postsDiv.parentNode.removeChild(postsDiv);
    }
  }
  return false;
}

function displayThreads(threads) {
  const container = document.getElementById("threads-container");
  container.innerHTML = "";
  for (var i=0; i < threads.length; i++) {
    let thread = threads[i];
    const threadDiv = document.createElement("div");
    threadDiv.classList.add("thread-title");
    threadDiv.id = `thread-${thread.id}`;
    threadDiv.innerHTML = `${thread.icon} ${thread.thread_title}`;
    threadDiv.onclick = () => {
      loadPosts(thread.id);
      history.pushState({ threadId: thread.id }, "", `?thread=${thread.id}`);
    };

    if (thread.user === username) {
      const delSpan = document.createElement("span");
      delSpan.classList.add("del-thread-btn");
      delSpan.innerHTML = "❌";
      delSpan.setAttribute("onclick", `deleteThread(${thread.id})`);
      threadDiv.appendChild(delSpan);
    }

    container.appendChild(threadDiv);

    const postsDiv = document.createElement("div");
    postsDiv.classList.add("posts");
    postsDiv.id = `posts-${thread.id}`;
    container.appendChild(postsDiv);
  }
}

async function loadPosts(threadId, setIntervalMark = true) {
  if (setIntervalMark === true) {
    if (autoLoadPosts) {
      clearInterval(autoLoadPosts);
    }
    autoLoadPosts = setInterval(() => {
      loadPosts(threadId, false);
    }, 10000);
  }

  hiddenAllPosts();
  const postsDiv = document.getElementById(`posts-${threadId}`);

  if (postsDiv.style.display === "block") {
    postsDiv.style.display = "none"; 
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:7777/api/threads/${threadId}/posts`
    );
    const posts = await response.json();
    displayPosts(posts, postsDiv, threadId);
    currentThreadId = threadId;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function displayPosts(posts, postsDiv, threadId) {
  postsDiv.innerHTML = "";
  for (var i=0; i<posts.length; i++) {
    const post = posts[i];
    const postDiv = document.createElement("div");
    postDiv.classList.add("thread-message");
    postDiv.innerHTML = `
                    ${post.text}
                    <span class="username">- ${post.name}</span>
                `;
    postsDiv.appendChild(postDiv);
  }

  const replyBox = document.createElement("div");
  replyBox.classList.add("reply-box");
  replyBox.innerHTML = `
                <input type="text" id="post-text-${threadId}" placeholder="My reply">
                <button type="button" onclick="newPost(${threadId})">Post</button>
            `;
  postsDiv.appendChild(replyBox);

  postsDiv.style.display = "block";
  postsDiv.scrollTop = postsDiv.scrollHeight;
}

async function newPost(threadId) {
  const inputId = `post-text-${threadId}`;
  const text = document.getElementById(inputId).value;
  if (!text) {
    return;
  }

  const response = await fetch(
    `http://localhost:7777/api/threads/${threadId}/posts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        user: username,
      }),
    }
  );

  if (response.ok) {
    loadPosts(threadId);
  }
}

document.getElementById("back-button").onclick = () => {
  history.back();
};

document.getElementById("forward-button").onclick = () => {
  history.forward();
};

window.onpopstate = (event) => {
  if (event.state && event.state.threadId) {
    loadPosts(event.state.threadId);
  }
};

window.onload = () => {
  username = localStorage.getItem("username");
  name = localStorage.getItem("name");

  if (!username || !name) {
    window.location.href = "./login.html";
    return;
  }

  document.querySelector(".header").textContent = `Logged in as ${name}`;
  fetchThreads();
};
