const urlParams = decodeURIComponent(location.search.slice(1)).split("&");
const userInfo = {};
for (let i = 0; i < urlParams.length; i++) {
  const tmp = urlParams[i].split("=");
  userInfo[tmp[0]] = tmp[1];
}

console.log(userInfo)

function topicSumbit() {
  // 创建thread
  const thread_title = document.querySelector(".thread_title").value;
  const icon = document.querySelector(".icon").value;
  const text = document.querySelector(".text").value;
  if (thread_title === "" || icon === "" || text === "") {
    alert("No Content");
  } else {
    fetch("http://localhost:7777/api/threads/", {
      method: "post",
      body: JSON.stringify({
        user: userInfo.username,
        thread_title,
        icon: icon,
        text: text,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(function (data) {
        return data.text();
      })
      .then((res) => {
        history.back();
      });
  }
}
//返回
document.querySelector(".topics_forward").onclick = function () {
  history.back();
};
