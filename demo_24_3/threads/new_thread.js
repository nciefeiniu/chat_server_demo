document
  .getElementById("createThreadForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // 阻止表单默认提交

    const threadTitle = document.getElementById("thread_title").value;
    const icon = document.getElementById("icon").value;
    const text = document.getElementById("text").value;

    // 创建要发送的数据对象
    const data = {
      thread_title: threadTitle,
      icon: icon,
      text: text,
      user: sessionStorage.getItem("username"),
    };

    // 发送 POST 请求
    fetch("http://127.0.0.1:7777/api/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Abnormal network response");
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("message").innerText = "线程创建成功！";
        // 清空表单
        document.getElementById("createThreadForm").reset();
      })
      .catch((error) => {
        document.getElementById("message").innerText =
          "创建线程失败: " + error.message;
      });
  });


  document.querySelector('.go-back').addEventListener('click', () => {
    window.history.back();
  })
