let userStr = decodeURIComponent(location.search.slice(1));

let arr = userStr.split("&");
let newBrr = {};
for (var i = 0; i < arr.length; i++) {
    let brr = arr[i].split("=");
    for (var j = 0; j < brr.length; j++) {
        newBrr[brr[0]] = brr[1];
    }
}

document.querySelector(".sp").innerHTML = `Logged in as ${newBrr.name}`;
var status = "";
window
    .fetch(`http://localhost:7777/api/threads`)
    .then((data) => {
        // text()方法属于fetchAPI的一部分，它返回一个Promise实例对象，用于获取和后台返回的数据
        status = data.status;
        return data.text();
    })
    .then((ret) => {
        let newArr = JSON.parse(ret);
        createLi(newArr);
    });

document.querySelector(".newbtn").onclick = function() {
    console.log('click new thread button')
    location.href = `../topics/topics.html?${encodeURIComponent(userStr)}`;
};

document.querySelector(".topics_forward").onclick = function() {
    location.replace("../login/login.html");
};
//渲染li
function createLi(newArr) {
    let LiStr = newArr
        .map((item, index) => {
            return `<li><a data-id=${item.id} class='list_a'>${item.thread_title}<span class="delete" data-user=${item.id}></span></a> <ul class='render'  data-id=${item.id}></ul>

        <li>`;
        })
        .join("");

    document.querySelector(".threads_list").innerHTML = LiStr;

    //点击li

    document.querySelector(".threads_list").addEventListener(
        "click",
        (e) => {
            let id = e.target.getAttribute("data-id");

            if (id) {
                if (e.target.nextElementSibling.id === "open") {
                    e.target.nextElementSibling.id = "del";
                    e.target.children[0].innerHTML = "";
                } else {
                    e.target.nextElementSibling.id = "open";
                    e.target.children[0].innerHTML = " (delete) ";
                }
                let status = "";
                fetch(`http://localhost:7777/api/threads/${id}/posts`)
                    .then((data) => {
                        status = data.status;

                        return data.text();
                        // setStr("(delete)");
                    })
                    .then((res) => {
                        if (status === 200) {
                            renderTextArr(e, JSON.parse(res), id);
                        }
                    });
            }
            // console.log(id)
        },
        false
    );

    var spans = document.querySelectorAll(".delete");
    for (var i = 0; i < spans.length; i++) {
        spans[i].onclick = function(e) {
            e.stopPropagation();
            var id = e.target.getAttribute("data-user");
            console.log(e.target.getAttribute("data-user"));
            fetch(`http://localhost:7777/api/threads/${id}/posts/${1}`)
                .then((data) => {
                    status = data.status;

                    return data.text();
                    // setStr("(delete)");
                })
                .then((res) => {
                    // console.log(res);
                    // console.log(newBrr);
                    if (newBrr.username != JSON.parse(res).user) {
                        window.alert("Unable to delete");
                    } else {
                        let y = window.confirm("agree or not");
                        if (y) {
                            fetch(`http://localhost:7777/api/threads/${id}`, {
                                    method: "delete",
                                    body: JSON.stringify({
                                        user: newBrr.username,
                                    }),
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                })
                                .then(function(data) {
                                    return data.text();
                                })
                                .then(function(data) {
                                    location.reload();
                                });
                        }
                    }
                });
        };
    }
}

function renderTextArr(e, res, id) {
    var ul = document.querySelectorAll(".render");

    for (var i = 0; i < ul.length; i++) {
        for (var j = 0; j < ul.length; j++) {
            ul[j].classList.remove("open");
        }
        ul[i].classList.add("open");
        // console.log(ul[i].getAttribute("data-id"));
        if (ul[i].getAttribute("data-id") == id) {
            let str = res
                .map((item, index) => {
                    return `<li>
      <div>${item.text}</div>
      <div>-${item.name}</div>
      </li>`;
                })
                .join("");
            ul[i].innerHTML = ` <div class='parentNode'>
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

    var newStr = "";

    var h = document.querySelectorAll(".threads_btn input");

    for (var i = 0; i < h.length; i++) {
        h[i].onchange = function(e) {
            newStr = e.target.value;
        };
    }
    var btn = document.querySelectorAll(".threads_post");
    for (var i = 0; i < btn.length; i++) {
        btn[i].onclick = function(e) {
            if (newStr != "") {
                let id =
                    e.target.parentNode.parentNode.parentNode.parentNode.children[0].getAttribute(
                        "data-id"
                    );

                fetch(`http://localhost:7777/api/threads/${id}/posts`, {
                        method: "post",
                        body: JSON.stringify({
                            user: newBrr.username,
                            text: newStr,
                        }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then(function(data) {
                        return data.text();
                    })
                    .then((res) => {
                        fetch(`http://localhost:7777/api/threads/${id}/posts`)
                            .then((data) => {
                                return data.text();
                                // setStr("(delete)");
                            })
                            .then((res) => {
                                renderTextArr(e, JSON.parse(res), id);
                            });
                    });
            } else {
                window.alert("NO Content");
            }
        };
    }
}