const { createApp, ref } = Vue;

// 这里就是 Vue的写法，可见 https://cn.vuejs.org/guide/introduction#what-is-vue
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
    // Vue 生命周期函数，在页面加载后执行，也就是页面加载完成，我们去获取所有的links
    this.getAllLinks();
  },
  methods: {
    // 这里都是 methods，也就是 Vue 的方法，这里就是我们自己写的方法，比如登录，注册，获取所有的links，等等
    logout(){
      // 退出登录，刷新页面
      location.reload();
    },
    async showMyFavourites() {
      // 显示我的收藏，通过ApI 调用接口
      this.showPage = "Favourites";   // 设置显示的页面为我的收藏，然后获取所有的收藏
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
      // 显示所有链接
      this.showPage = "main";
      await this.getAllLinks();
    },
    async hiddenLink(linkID) {
      // 隐藏链接，通过API 调用接口
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
      // 评分
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
      // 点击链接，显示详情
      const linkItem = document.getElementById(`link-${linkInfo.id}`);
      linkItem.classList.toggle("active");
      console.log("linkItem.classList: ", linkItem.classList);
      if (linkItem.classList.contains("active") && this.logged) {
        // 需要去获取当前用户给这个的评分
        await this.personalLinkScore(linkInfo);
      }
    },
    async personalLinkScore(linkInfo) {
      // 获取个人评分
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
      // 提交新链接
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
      // 切换模态框
      const modal = document.getElementById("modal");
      const overlay = document.querySelector(".overlay");
      modal.style.display = modal.style.display === "block" ? "none" : "block";
      overlay.style.display =
        overlay.style.display === "block" ? "none" : "block";
    },
    async getAllLinks() {
      // 获取所有的链接
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
      // 登录 or 注册，这里根据 showPage 这个参数，判断是 登录还是注册
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
