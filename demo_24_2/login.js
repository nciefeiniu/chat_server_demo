const usernameEle = document.getElementById("username");

const goToLogin = () => {
  // Click the login button to log in
  const username = usernameEle.value;
  if (!username) {
    alert("Please input username");
    return;
  }

  fetch(`http://localhost:7777/api/users/${username}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      const userInfo = encodeURIComponent(JSON.stringify(data));
      window.location.href = `./index.html?userinfo=${userInfo}`;
    })
    .catch((error) => {
      alert("user does not exist");
    });
};
