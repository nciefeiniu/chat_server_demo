// 获取URL参数
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// 根据URL参数显示表单
window.onload = function () {
  const type = getParameterByName("type");
  if (type === "login" || !type) {
    document.getElementById("form-login").style.display = "block";
  } else if (type === "register") {
    document.getElementById("form-register").style.display = "block";
  }
};

document
  .getElementById("form-register")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const jsonData = {
      fullname: document.getElementById("fullname").value,
      username: document.getElementById("reg_username").value,
      password: document.getElementById("reg_password").value,
    };
    // 使用fetch API发送POST请求
    fetch("http://127.0.0.1:8050/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not ok.");
      }) // 处理服务器返回的数据
      .then((data) => {
        console.log("Success:", data);
        alert("Register Success");
      })
      .catch((error) => {
        console.error("Error:", error);
        // 处理请求错误
      });
  });

document
  .getElementById("form-login")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    const jsonData = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
    };

    // 使用fetch API发送POST请求
    fetch("http://127.0.0.1:8050/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not ok.");
      }) // 处理服务器返回的数据
      .then((data) => {
        console.log("Success:", data);
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("token", data.jwt);
        sessionStorage.setItem("fullname", data.fullname);
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Error:", error);
        // 处理请求错误
      });
  });
