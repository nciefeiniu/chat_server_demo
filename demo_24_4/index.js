window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");
  const username = urlParams.get("username");

  if (username && name) {
    window.location.href = `./threads.html?username=${username}&name=${name}`;
  } else {
    window.location.href = "./login.html";
  }
};
