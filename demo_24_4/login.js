document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const messageElement = document.getElementById("message");

    if (!username) {
      messageElement.textContent = "Please enter a username.";
      messageElement.style.color = "red";
      return;
    }

    fetch("http://localhost:7777/api/users")
      .then((response) => response.json())
      .then((data) => {
        const userExists = data.find((user) => user.username === username);
        if (userExists) {
          messageElement.textContent =
            "Login successful! Will automatically redirect to the homepage soon...";
          messageElement.style.color = "green";
          setTimeout(() => {
            window.location.href = `/threads.html?username=${encodeURIComponent(userExists.username)}&name=${encodeURIComponent(userExists.name)}`;
          }, 2000);
        } else {
          messageElement.textContent =
            "The username does not exist, please try again.";
          messageElement.style.color = "red";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        messageElement.textContent =
          "Request failed, please check network connection.";
        messageElement.style.color = "red";
      });
  });
