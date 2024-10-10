function login() {
  const username = document.getElementById("username").value;
  const message = document.getElementById("message");
  fetch(`http://localhost:7777/api/users/${username}`)
    .then((response) => {
      if (response.ok) {
        message.textContent =
          "Login successful! Jump to thread page in 2 seconds.";
        message.style.color = "green";
        return response.json();
      } else {
        throw new Error("User not found");
      }
    })
    .then((data) => {
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("name", data.name);
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 2000);
    })
    .catch((error) => {
      message.textContent = "Login failed: " + error.message;
      message.style.color = "red";
    });
}
