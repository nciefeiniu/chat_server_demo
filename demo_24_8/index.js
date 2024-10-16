var urlParamsSearchHandle = new URLSearchParams(window.location.search);
      var name = urlParamsSearchHandle.get("name");
      var user = urlParamsSearchHandle.get("username");
      var intervalId = null;
      var isPopupOpen = false;
      var hasDeltedThreadIDS = [];

      const threadsList = document.getElementById("threadsList");

      if (!user) {
        window.location.href = "./login.html";
      } else {
        name = decodeURIComponent(name);
        user = decodeURIComponent(user);
        document.querySelector(
          ".thread-header"
        ).textContent = `Logged in as ${name}`;
      }

      function threadClickGetPostsHandle(thread, threadElement) {
        fetch(`http://127.0.0.1:7777/api/threads/${thread.id}/posts`)
          .then((response) => response.json())
          .then((posts) => {
            let postsContainer = document.querySelector(
              ".thread-posts-" + thread.id
            );
            if (postsContainer) {
              console.log("postsContainer exists, remove it.");
              document.querySelector(".thread-posts-" + thread.id).innerHTML =
                "";
            } else {
              postsContainer = document.createElement("div");
              postsContainer.className =
                "posts-container thread-posts-" + thread.id;
            }

            if (thread.user === user) {
              const delteThreadButton = document.createElement("button");
              delteThreadButton.className = "delete-thread-button";
              delteThreadButton.innerHTML = "Delete";
              postsContainer.appendChild(delteThreadButton);
            }

            posts.forEach((post) => {
              const postElement = document.createElement("div");
              postElement.className = "post-item";
              postElement.innerHTML = `
                      <strong>${post.name}</strong>: ${post.text}
                    `;
              postsContainer.appendChild(postElement);
            });
            postsContainer.innerHTML += `
                    <form class="post-form" id="${thread.id}">
                      <input id="newPost${thread.id}" type="text" placeholder="New post" onclick="event.preventDefault();" />
                      <button id="newPostSubmit" onclick="userSendOneNewPost(${thread.id})" type="submit">Post</button>
                    </form>
                  `;
            if (threadElement.contains(postsContainer)) return;
            threadElement.appendChild(postsContainer);
          });
      }

      function createThreadElement(thread) {
        const threadElement = document.createElement("div");
        threadElement.className = "thread-item can-click";
        threadElement.id = "thread-" + thread.id;
        threadElement.innerHTML = `
              <span class="thread-icon can-click">${thread.icon}</span>
              <span class="can-click">${thread.thread_title}</span>
            `;
        threadElement.addEventListener("click", (event) => {
          console.log(event.target.className);

          if (event.target.className === "delete-thread-button") {
            event.preventDefault();
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            console.log("click delete button");
            fetch("http://127.0.0.1:7777/api/threads/" + thread.id, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user: user,
              }),
            }).then((response) => {
              if (response.ok) {
                threadElement.remove();
                hasDeltedThreadIDS.push(thread.id);
              } else {
                alert("Failed to delete thread.");
              }
            });
          }

          if (event.target.className.indexOf("can-click") < 0) {
            return;
          }

          if (document.querySelector(".thread-posts-" + thread.id)) {
            return;
          }

          window.history.pushState(
            { showThread: thread },
            "",
            "thread_posts?id=" + thread.id
          );

          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          document
            .querySelectorAll(".posts-container")
            .forEach((postContainer) => {
              postContainer.remove();
            });

          threadClickGetPostsHandle(thread, threadElement);

          intervalId = setInterval(() => {
            threadClickGetPostsHandle(thread, threadElement);
          }, 10000);
        });
        threadsList.appendChild(threadElement);
      }

      fetch("http://127.0.0.1:7777/api/threads")
        .then((response) => response.json())
        .then((threads) => {
          threads.forEach((thread) => {
            createThreadElement(thread);
          });
        })
        .catch((error) => console.error("Error fetching threads:", error));

      function userSendOneNewPost(threadID) {
        event.preventDefault();

        console.log("threadID: ", threadID);
        console.log(event.target.parentNode.parentNode);

        const threadContainer = event.target.parentNode.parentNode;
        const newPostText = document.getElementById("newPost" + threadID).value;
        if (!newPostText) return;
        fetch("http://127.0.0.1:7777/api/threads/" + threadID + "/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newPostText,
            user: user,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("New post added:", data);
            threadClickGetPostsHandle({ id: threadID }, threadContainer);
          });
      }

      document
        .querySelector("#btn-back")
        .addEventListener("click", function () {
          window.history.back();
        });

      document.getElementById("btn-go").addEventListener("click", function () {
        window.history.forward();
      });

      window.onpopstate = function (event) {
        if (event.state && event.state.showThread) {
          if (hasDeltedThreadIDS.indexOf(event.state.showThread.id) >= 0) {
            return;
          }

          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          document
            .querySelectorAll(".posts-container")
            .forEach((postContainer) => {
              postContainer.remove();
            });
          const threadElement = document.getElementById(
            "thread-" + event.state.showThread.id
          );

          threadClickGetPostsHandle(event.state.showThread, threadElement);

          intervalId = setInterval(() => {
            threadClickGetPostsHandle(event.state.showThread, threadElement);
          }, 10000);
        } else {
          document
            .querySelectorAll(".posts-container")
            .forEach((postContainer) => {
              postContainer.remove();
            });
        }
      };

      function openPopup() {
        document.querySelector("#popup").style.display = "block";
        document.querySelector("#overlay").style.display = "block";
        isPopupOpen = true;
      }

      function closePopup() {
        document.querySelector("#popup").style.display = "none";
        document.querySelector("#overlay").style.display = "none";
        isPopupOpen = false;
      }

      document
        .querySelector("#openCreateNewThread")
        .addEventListener("click", openPopup);

      document
        .querySelector("#postForm")
        .addEventListener("submit", function (event) {
          event.preventDefault();
          const thread_title = document.querySelector("#threadTitle").value;
          const icon = document.querySelector("#icon").value;
          const text = document.querySelector("#text").value;

          if (!threadTitle || !icon || !text) return;

          const postData = JSON.stringify({
            thread_title,
            icon,
            text,
            user,
          });

          fetch(`http://127.0.0.1:7777/api/threads`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: postData,
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Success:", data);
              closePopup();
              createThreadElement(data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });
