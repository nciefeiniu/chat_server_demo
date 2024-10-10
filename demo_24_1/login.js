var allUsers = []; // 所有用户

    function GetAllUsers() {
      // 获取所有用户
      fetch(`http://127.0.0.1:7777/api/users`)
        .then((response) => response.json())
        .then((res) => {
          allUsers = res;
        })
        .catch((error) => {
          console.error("请求错误:", error);
          document.getElementById("message").innerText =
            "An error occurred, please try again later.";
        });
    }

    window.onload = () => {
      // 页面加载完毕，执行这个函数，也就是第一执行的！！！
      GetAllUsers();
    };

    const userNameDom = document.getElementById("username");
    const messageDom = document.getElementById("message");

    document.getElementById("login-button").addEventListener("click", () => {
      // 点击登录按钮的处理

      const username = userNameDom.value;
      if (!username) {
        // 没输入用户名，不让登录
        alert("Please Enter Username!");
        return;
      }
      let LoginStatus = false;
      let currentUser = {};
      allUsers.forEach((item) => {
        // 遍历所有的用户，查看是否有这个用户
        if (item.username === username) {
          // 登录成功
          LoginStatus = true;
          currentUser = item;
        }
      });

      if (LoginStatus === true) {
        messageDom.style.color = "green";
        messageDom.innerText =
          "Login successful! Will automatically redirect to the homepage soon...";
        window.location.href = `index.html?username=${encodeURIComponent(
          currentUser.username
        )}&name=${encodeURIComponent(currentUser.name)}`;
      } else {
        messageDom.innerText = "Username error, please modify and try again";
      }
    });
