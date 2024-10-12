var loginApiUri = "http://127.0.0.1:7777/api/users/";

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("usernameInput").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = "";

    fetch(loginApiUri + username)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error("User not found!!!");
      })
      .catch((error) => {
        errorMessage.textContent = error.message;
      })
      .then((data) => {
        errorMessage.textContent = "Login successful!";
        window.location.href =
          "./index.html?username=" +
          encodeURIComponent(data.username) +
          "&name=" +
          encodeURIComponent(data.name);
      });
  });
