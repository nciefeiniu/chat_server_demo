var login = () => {
  const username = document.getElementById("username").value;
  if (!username) {
    alert("username can not be empty");
  }
  fetch("http://localhost:7777/api/users")
    .then((response) => response.json())
    .then((data) => {
      data.forEach(element => {
        if (element.username === username) {
          // 如果username匹配，就跳转到index页面
          window.location.href = './index.html?username=' + element.username + '&name=' + element.name
          return
        }
      });
    });
};
