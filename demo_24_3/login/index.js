async function submitUsername() {
  const username = document.getElementById("username").value;
  if (!username) {
    alert("Please enter your username");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:7777/api/users");
    if (!response.ok) {
      throw new Error("network error");
    }

    const users = await response.json();
    const userExists = users.find((user) => user.username === username);

    if (userExists) {
      alert(`Login successful, welcome ${username}！`);
      sessionStorage.setItem('username', userExists.username);
      sessionStorage.setItem('name', userExists.name);
      window.location.href = "../threads/index.html";
    } else {
      alert("There is no such user, please check the username");
    }
  } catch (error) {
    console.error("Error occurred:", error);
    alert("Unable to retrieve user data, please try again later");
  }
}
