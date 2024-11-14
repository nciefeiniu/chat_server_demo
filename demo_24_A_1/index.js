const { createApp, ref } = Vue;

createApp({
  data() {
    return {
      logged: false,
      showPage: "main",
      username: "",
      password: "",
      links: [],
    };
  },
  mounted() {
    this.getAllLinks();
  },
  methods: {
    logout(){
      location.reload();
    },
    async showMyFavourites() {
      this.showPage = "Favourites";
      const response = await fetch(`http://127.0.0.1:8080/link/favourites`, {
        mode: "cors",
        credentials: "include",
        method: "GET",
      });
      if (response.status > 210) {
        alert("Get favourites failed");
        return;
      }
      const respJson = await response.json();
      this.links = respJson.data;
    },
    async showMain() {
      this.showPage = "main";
      await this.getAllLinks();
    },
    async hiddenLink(linkID) {
      console.log("hidden link: ", linkID);
      const response = await fetch(
        `http://127.0.0.1:8080/link/hidden/${linkID}`,
        {
          mode: "cors",
          credentials: "include",
          method: "GET",
        }
      );
      if (response.status > 210) {
        alert("Hidden failed");
        return;
      }
      const data = await response.json();
      await this.getAllLinks();
    },
    async handleChange(event, linkID) {
      event.stopPropagation();
      const value = event.target.value;
      console.log("选择的分数：", value);
      if (!value) {
        return;
      }
      const response = await fetch(
        `http://127.0.0.1:8080/link/score/${linkID}`,
        {
          mode: "cors",
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: value,
          }),
        }
      );
      if (response.status > 210) {
        alert("Score failed");
        return;
      }
      const data = await response.json();
      console.log(data);
      this.getAllLinks();
    },
    async linkItemClick(linkInfo) {
      const linkItem = document.getElementById(`link-${linkInfo.id}`);
      linkItem.classList.toggle("active");
      console.log("linkItem.classList: ", linkItem.classList);
      if (linkItem.classList.contains("active") && this.logged) {
        // 需要去获取当前用户给这个的评分
        await this.personalLinkScore(linkInfo);
      }
    },
    async personalLinkScore(linkInfo) {
      const response = await fetch(
        `http://127.0.0.1:8080/link/score/${linkInfo.id}`,
        {
          mode: "cors",
          credentials: "include",
          method: "GET",
        }
      );
      if (response.status > 210) {
        alert("get link Score failed");
        return;
      }
      const respJson = await response.json();
      linkInfo.personalScore = respJson.data ? respJson.data.score : null;
    },
    async submitNewLink() {
      const title = document.getElementById("title").value;
      const desc = document.getElementById("desc").value;
      const link = document.getElementById("link").value;

      if (!title || !desc || !link) {
        alert("Please fill in all fields");
        return;
      }

      const response = await fetch("http://127.0.0.1:8080/links", {
        mode: "cors",
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          desc,
          link,
        }),
      });
      if (response.status > 210) {
        alert("Publish failed");
        return;
      }
      const respJson = await response.json();
      alert("Publish successfully");
      await this.getAllLinks();
      this.toggleModal();
    },
    toggleModal() {
      const modal = document.getElementById("modal");
      const overlay = document.querySelector(".overlay");
      modal.style.display = modal.style.display === "block" ? "none" : "block";
      overlay.style.display =
        overlay.style.display === "block" ? "none" : "block";
    },
    async getAllLinks() {
      const response = await fetch("http://127.0.0.1:8080/links", {
        mode: "cors",
        credentials: "include",
      });
      const respJson = await response.json();
      console.log("links: ", respJson);
      this.links = respJson.data;

      const linkContainers = document.querySelectorAll(".accordion");
      for (let i = 0; i < linkContainers.length; i++) {
        const linkItem = linkContainers[i];
        linkItem.classList.remove("active");
      }
    },
    async clickHandle() {
      const fetchUri =
        this.showPage === "login"
          ? "http://127.0.0.1:8080/login"
          : "http://127.0.0.1:8080/register";
      const response = await fetch(fetchUri, {
        mode: "cors",
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });
      const respJson = await response.json();
      if (response.status === 200) {
        // 计算明天的日期
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.cookie = `sessionID=${
          respJson.data.token
        }; expires=${tomorrow.toUTCString()}; path=/; domain=localhost;`;
        document.cookie = `sessionID=${
          respJson.data.token
        }; expires=${tomorrow.toUTCString()}; path=/; domain=127.0.0.1;`;
        alert("Login Success");
        this.logged = true;
        await this.getAllLinks();
        this.showPage = "main";
      } else if (response.status === 404) {
        alert("user name does not exist");
      } else if (response.status === 401) {
        alert("Password error");
      } else if (response.status === 201) {
        alert("Register Success");
      } else if (response.status === 403) {
        alert("user name already exists");
      } else {
        alert("unknown error");
      }
    },
  },
}).mount("#app");
