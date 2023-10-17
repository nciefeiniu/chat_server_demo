const urlParams = decodeURIComponent(location.search.slice(1)).split("&");
const userInfo = {};
for (let i = 0; i < urlParams.length; i++) {
  const tmp = urlParams[i].split("=");
  userInfo[tmp[0]] = decodeURIComponent(tmp[1]);
}

window.onload = () => {
  // 页面加载完成自动执行
  document.querySelector(".sp").innerHTML = `Logged in as ${userInfo.name}`;
  getThreads();
};

document.querySelector(".newbtn").onclick = () => {
  // 用户点击新建Thread会运行这里
  location.href = `./topics.html?name=${userInfo.name}&username=${userInfo.username}`;
};

function getThreads() {
  // 获取所有的Thread
  fetch(`http://localhost:7777/api/threads`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      renderLi(data); // 通过这个方法，渲染到HTML页面上
    });
}

var allPosts = (e, id) => {
  // 获取所有posts的方法
  fetch(`http://localhost:7777/api/threads/${id}/posts`)
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      renderTextArr(e, data, id); // 通过这个方法，把获取到的数据渲染到HTML页面上
    });
};

document.querySelector(".topics_forward").onclick = () => {
  history.back(); // 当用户点击回退按钮的时候，这里使用history的api进行回退
};

var renderLi = (data) => {
  // 这里是把获取到的数据，渲染到页面上。通过document的各种方法，用js添加上去
  let liListNode = "";
  data.forEach((item) => {
    liListNode += `<li><a data-id=${item.id} class='list_a'>${item.thread_title}<span class="delete" data-user=${item.id}></span></a> <ul class='render'  data-id=${item.id}></ul><li>`;
  });

  document.querySelector(".threads_list").innerHTML = liListNode;

  //点击li，就是打开这个posts界面

  document.querySelector(".threads_list").addEventListener(
    "click",
    (e) => {
      const id = e.target.getAttribute("data-id");

      if (id) {
        if (e.target.nextElementSibling.id === "open") {
          e.target.nextElementSibling.id = "del";
          e.target.children[0].innerHTML = "";
        } else {
          e.target.nextElementSibling.id = "open";
          e.target.children[0].innerHTML = " (delete) ";
        }
        allPosts(e, id);
      }
    },
    false
  );

  const delBtns = document.querySelectorAll(".delete");
  for (let i = 0; i < delBtns.length; i++) {
    delBtns[i].onclick = (e) => {
      e.stopPropagation();
      const id = e.target.getAttribute("data-user");
      fetch(`http://localhost:7777/api/threads/${id}/posts/${1}`)
        .then((data) => {
          return data.json();
        })
        .then((data) => {
          if (userInfo.username != data.user) {
            alert("Unable to delete");
          } else {
            const submitDel = window.confirm(
              "Are you sure to delete this Thread?"
            );
            if (submitDel) {
              fetch(`http://localhost:7777/api/threads/${id}`, {
                method: "delete",
                body: JSON.stringify({
                  user: userInfo.username,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }).then((response) => {
                getThreads(); // 执行完成，重新获取threads
              });
            }
          }
        });
    };
  }
};

var renderTextArr = (e, res, id) => {
  const ulNode = document.querySelectorAll(".render");

  for (let i = 0; i < ulNode.length; i++) {
    for (let j = 0; j < ulNode.length; j++) {
      ulNode[j].classList.remove("open");
    }
    ulNode[i].classList.add("open");
    if (ulNode[i].getAttribute("data-id") == id) {
      let str = res
        .map((item, index) => {
          return `<li>
      <div>${item.text}</div>
      <div>-${item.name}</div>
      </li>`;
        })
        .join("");
      ulNode[i].innerHTML = ` <div class='parentNode'>
                          ${str}
                      <div class="threads_btn">
                        <input
                          type="text"
                        />
                        <button
                          class="threads_post"
                          
                        >
                          Post
                        </button>
                      </div>

                  </div>`;
    }
  }

  let newPost = "";

  var h = document.querySelectorAll(".threads_btn input");

  for (let i = 0; i < h.length; i++) {
    h[i].onchange = function (e) {
      newPost = e.target.value;
    };
  }
  const btn = document.querySelectorAll(".threads_post");
  for (let i = 0; i < btn.length; i++) {
    btn[i].onclick = function (e) {
      if (newPost != "") {
        const id =
          e.target.parentNode.parentNode.parentNode.parentNode.children[0].getAttribute(
            "data-id"
          );

        fetch(`http://localhost:7777/api/threads/${id}/posts`, {
          method: "post",
          body: JSON.stringify({
            user: userInfo.username,
            text: newPost,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(function (data) {
            return data.json();
          })
          .then((data) => {
            allPosts(e, id);
            setInterval(() => {allPosts(e, id)}, 1000 * 10)
          });
      } else {
        alert("NO Content");
      }
    };
  }
};
