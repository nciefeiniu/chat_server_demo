let currentUser = null;
      let needAutoGetPostsContainer = {};

      function setHistory(params, pageName, uri) {
        window.history.pushState(params, pageName, uri);
      }

      window.onpopstate = (event) => {
        if (!event.state) {
          // show login
          for (const key in needAutoGetPostsContainer) {
            // remove all interval
            if (needAutoGetPostsContainer.hasOwnProperty(key)) {
              clearInterval(needAutoGetPostsContainer[key]);
              delete needAutoGetPostsContainer[key];
            }
          }
          console.log("show Login Page");
          displayLoginPageHandle();
          return;
        }
        console.log(event.state);
        const page = event.state.PAGE;
        switch (page) {
          case "THREADS":
            try {
              displayThreadsPageHandle();
            } catch (error) {
              console.log(error);
            }
            break;
          case "POSTS":
            try {
              const needShowThreadPosts = event.state.SHOW_THREAD_POST;
              console.log("needShowThreadPosts: ", needShowThreadPosts);
              Object.keys(needAutoGetPostsContainer).forEach((threadId) => {
                clearInterval(needAutoGetPostsContainer[threadId]);
                delete needAutoGetPostsContainer[threadId];
                document.querySelector(".thread-" + threadId).remove();
                const inputEle = document.querySelector(
                  "#user-input-" + threadId
                );
                console.log(inputEle);
                inputEle.parentNode.querySelector(".post-new-submit").remove();
                inputEle.remove();
              });

              needShowThreadPosts.forEach((threadId) => {
                const btn = document.querySelector("#btn-" + threadId);
                LoadAllPostsOfThread(threadId, btn, false);
              });
            } catch (error) {
              console.log("some error");
            }
            break;
          case "CREATE_THREAD":
            displayCreateThreadFormPageHandle();
            break;
          default:
            break;
        }
      };

      function displayLoginPageHandle() {
        document
          .querySelectorAll(".container")
          .forEach((page) => page.classList.add("hidden"));
        document.getElementById("loginPage").classList.remove("hidden");
      }

      function userSubmitUsernameInputHandle() {
        const username = document.getElementById("usernameInput").value;
        fetch("http://localhost:7777/api/users")
          .then((response) => response.json())
          .then((users) => {
            const user = users.find((user) => user.username === username);
            if (user) {
              currentUser = user;
              setHistory({ PAGE: "THREADS" }, "Thread list", "");
              displayThreadsPageHandle();
            } else {
              alert("Username not found");
            }
          });
      }

      function displayThreadsPageHandle() {
        document
          .querySelectorAll(".container")
          .forEach((page) => page.classList.add("hidden"));
        document.getElementById("threadsPage").classList.remove("hidden");

        document.querySelector(
          ".logged-who"
        ).innerText = `Logged in as ${currentUser.name}`;
        loadThreadsHandle();
      }

      function deleteThreadHandle(threadId) {
        fetch(`http://localhost:7777/api/threads/${threadId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: currentUser.username }),
        })
          .then((response) => {
            if (response.ok) {
              if (needAutoGetPostsContainer[threadId]) {
                clearInterval(needAutoGetPostsContainer[threadId]);
                delete needAutoGetPostsContainer[threadId];
                document
                  .querySelector(".thread-container-" + threadId)
                  .remove();
              } else {
                alert("Thread deleted failed!");
              }
            }
          })

          .catch((error) => {
            console.error("Error deleting thread:", error);
          });
      }

      function loadThreadsHandle() {
        fetch("http://localhost:7777/api/threads")
          .then((response) => response.json())
          .then((threads) => {
            const threadsList = document.getElementById("threadsList");
            threadsList.innerHTML = "";
            threads.forEach((thread) => {
              const listItem = document.createElement("li");
              listItem.setAttribute("class", "thread-container-" + thread.id);
              if (thread.user === currentUser.username) {
                listItem.innerHTML = `<i>${thread.thread_title}</i> <button id="btn-${thread.id}" onclick="LoadAllPostsOfThread(${thread.id}, this)">Exp</button><button onclick="deleteThreadHandle(${thread.id})">Del</button>`;
              } else {
                listItem.innerHTML = `<i>${thread.thread_title}</i> <button id="btn-${thread.id}" onclick="LoadAllPostsOfThread(${thread.id}, this)">Exp</button>`;
              }

              threadsList.appendChild(listItem);
            });
          });
      }

      function LoadAllPostsOfThread(threadId, button, addHistory = true) {
        console.log(button);
        const threadPostsContainerEle =
          button.parentNode.querySelector(".posts");
        if (threadPostsContainerEle) {
          // remove posts
          threadPostsContainerEle.remove();
          button.innerText = "Exp";
          button.parentNode.querySelector(".post-new-submit").remove();
          button.parentNode.querySelector(".post-input").remove();
          if (needAutoGetPostsContainer[threadId]) {
            clearInterval(needAutoGetPostsContainer[threadId]);
            delete needAutoGetPostsContainer[threadId];
          }
        } else {
          // get all posts
          needAutoGetPostsContainer[threadId] = setInterval(
            () => refreshPostsOfThread(threadId),
            10000
          );
          if (addHistory) {
            setHistory(
              {
                PAGE: "POSTS",
                SHOW_THREAD_POST: Object.keys(needAutoGetPostsContainer),
              },
              "Posts Page",
              ""
            );
          }

          fetch(`http://localhost:7777/api/threads/${threadId}/posts`)
            .then((response) => response.json())
            .then((postsData) => {
              const threadPostListEle = document.createElement("ul");
              threadPostListEle.className = "posts " + "thread-" + threadId;
              for (let i = 0; i < postsData.length; i++) {
                threadPostListEle.innerHTML += `
                  <li class="post">${postsData[i].text} - <span class="post-owner">${postsData[i].name}</span></li>
                `;
              }
              button.parentNode.appendChild(threadPostListEle);
              button.parentNode.innerHTML += `<input id="user-input-${threadId}" class="post-input"/><button class="post-new-submit" onclick="userSendNewPost2ThreadHandle(${threadId})">🚀</button>`;
              button.innerText = "Col";
            });
        }
      }

      function refreshPostsOfThread(threadId) {
        fetch(`http://localhost:7777/api/threads/${threadId}/posts`)
          .then((response) => response.json())
          .then((postsData) => {
            const threadPostListEle = document.querySelector(
              `.thread-${threadId}`
            );
            threadPostListEle.innerHTML = "";
            for (let i = 0; i < postsData.length; i++) {
              threadPostListEle.innerHTML += `
                  <li class="post">${postsData[i].text} - <span class="post-owner">${postsData[i].name}</span></li>
                `;
            }
          });
      }

      function userSendNewPost2ThreadHandle(threadId) {
        const newPostText = document.getElementById(
          `user-input-${threadId}`
        ).value;
        if (!newPostText) {
          return alert("Please enter a post text");
        }
        fetch(`http://localhost:7777/api/threads/${threadId}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newPostText,
            user: currentUser.username,
          }),
        }).then((response) => {
          if (response.ok) {
            document.getElementById(`user-input-${threadId}`).value = "";
            document.querySelector(".thread-" + threadId).innerHTML += `
              <li class="post">${newPostText} - <span class="post-owner">${currentUser.name}</span></li>
            `;
          } else {
            alert("Failed to send post");
          }
        });
      }

      function displayCreateThreadFormPageHandle() {
       
        document
          .querySelectorAll(".container")
          .forEach((page) => page.classList.add("hidden"));
        document.getElementById("createThreadPage").classList.remove("hidden");
        
      }

      function submitCreateNewThreadHandle() {
        const title = document.getElementById("threadTitleInput").value;
        const icon = document.getElementById("threadIconInput").value;
        const text = document.getElementById("threadTextInput").value;

        if (title && icon && text) {
          const newThread = {
            thread_title: title,
            icon: icon,
            user: currentUser.username,
            text: text,
          };

          fetch("http://localhost:7777/api/threads", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newThread),
          }).then((response) => {
            if (response.ok) {
              displayThreadsPageHandle();
            } else {
              alert("Error creating thread");
            }
          });
        } else {
          alert("Please fill in all fields");
        }
      }
