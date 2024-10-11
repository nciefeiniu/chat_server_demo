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
  // Show this thread
  thread.classList.add("fade-in");
  thread.style.display = "";
  getPosts(threadId); // Go get all the posts
  // Set a timed task to retrieve posts every 10 seconds
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
  // Hide all threads
  const threads = document.querySelectorAll(".thread-posts");
  threads.forEach((thread) => {
    thread.classList.remove("fade-in");
    thread.style.display = "none";
    const threadId = thread.getAttribute("ref");
    if (IntervalPosts[threadId]) {
      // If there is a scheduled task, it needs to be cleared
      clearInterval(IntervalPosts[threadId]);
      IntervalPosts[threadId] = null;
    }
  });
}

function renderThreads(data) {
  // Render all threads onto the page
  const threadsContainer = document.querySelector(".threads");
  threadsContainer.innerHTML = "";
  data.forEach((item) => {
    const divDom = document.createElement("div"); // Create a div tag
    divDom.setAttribute("class", "thread"); // Set class
    divDom.setAttribute("onclick", `showThread('${item.id}')`); // Click Event
    divDom.innerText = item.thread_title; // Set innerText

    const ulDom = document.createElement("ul"); // Create an ul tag
    ulDom.setAttribute("ref", item.id);
    ulDom.setAttribute("class", "thread-posts");
    ulDom.setAttribute("id", `thread${item.id}`); // Set ID
    ulDom.style.display = "none"; // hide

    if (item.user === username) {
      console.log("can del");
      // If the user of this thread matches the currently logged in user, a delete button will be displayed
      const delDom = document.createElement("button");
      delDom.innerText = "Del";
      delDom.setAttribute("class", "del-btn");
      delDom.onclick = () => {
        // Delete this thread
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
            // Delete successfully
            allThreads(renderThreads); // Retrieve all threads again
            if (IntervalPosts[item.id]) {
              // If there are scheduled tasks that need to be cleared
              clearInterval(IntervalPosts[item.id]);
            }
          }
        });
      };
      divDom.appendChild(delDom);
    }
    threadsContainer.appendChild(divDom); // Add to ThreadContainer
    threadsContainer.appendChild(ulDom); // Add to ThreadContainer
  });
}

const allThreads = (callback) => {
  // Get all threads
  fetch(`http://localhost:7777/api/threads`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      // Successfully obtained, handed over to callback for rendering on the page
      callback(data);
    });
};

function renderPosts(threadID, threadsData) {
  // Render all posts of a certain thread to the page for display
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
    // Click Event
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
  // Retrieve all posts of a certain thread
  fetch(`http://localhost:7777/api/threads/${threadID}/posts`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      renderPosts(threadID, data);
    });
}
var username = undefined;
var name = undefined;

window.onload = function () {
  console.log("load");
  // Check if you have logged in
  const urlParams = new URLSearchParams(window.location.search);
  var userInfo = urlParams.get("userinfo");
  if (!userInfo) {
    // Not logged in, redirected to login page
    window.location.href = "./login.html";
    return;
  }
  userInfo = JSON.parse(userInfo);
  username = userInfo.username;
  name = userInfo.name;
  document.querySelector(".logged-name").innerText = name;
  allThreads(renderThreads); // Render all threads
};
var modal = document.getElementById("myModal");
var form = document.getElementById("create-thread-form");
function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

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
        allThreads(renderThreads); // Retrieve all threads again
      } else {
        throw new Error("An error occurred, please try again!");
      }
    })
    .catch((error) => {
      console.error("Error occurred:", error.message);
      alert("An error occurred, please try again!");
    });
});

window.addEventListener("popstate", (event) => {
  console.log("event:", event);
  hiddenAllThreads();
  if (event.state) {
    showThread(event.state.id, true);
  }
});
