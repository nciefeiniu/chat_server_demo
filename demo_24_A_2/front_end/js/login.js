const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
      loginHandle(username, password);
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const fullname = document.getElementById("fullname").value;

    if (username && password && fullname) {
      registerHandle(username, password, fullname);
    }
  });
}

function loginHandle(username, password) {
  fetch("http://127.0.0.1:8000/api/login/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      alert("Login failed");
      throw new Error("Login failed");
    })
    .then((data) => {
      console.log(data);
      // Login success
      alert("Login Success!");
    }).catch(err => {
      console.log(err)
    });
}

function registerHandle(username, password, fullname) {
  fetch("http://127.0.0.1:8000/api/users/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
      fullname: fullname,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      alert("Register Failed");
      throw new Error("Registration failed");
    })
    .then((data) => {
      // Handle successful registration
      console.log(data);
      alert("Register Success! Go To Login");
      window.location.href = "./login.html";
    }).catch(err => {
      console.log(err)
    });
}
