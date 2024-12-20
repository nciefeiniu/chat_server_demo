function checkUser() {
  const username = document.getElementById("usernameInput").value;
  fetch(`http://localhost:7777/api/users/${username}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("User not found");
      }
    })
    .then((data) => {
      document.getElementById("message").innerHTML = `
              <p>User found:</p>
              <p>Username: ${data.username}</p>
              <p>Name: ${data.name}</p>
              <p class="jump-tips">Automatically jump to the homepage after 2 seconds</p>
          `;
      localStorage.setItem("username", data.username);
      localStorage.setItem("name", data.name);
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 2000);
    })
    .catch((error) => {
      document.getElementById("message").innerHTML =
        '<p class="user-not-found">User not found</p>';
    });
}
