var logged = false;

const myModal = new bootstrap.Modal(document.getElementById('exampleModal'))


function links() {
  fetch("http://127.0.0.1:8000/api/links", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((respJson) => {
      const data = respJson.data;
      const cardContainer = document.querySelector(".row");
      cardContainer.innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        const link = data[i];
        const card = `
            <div class="col">
                <div class="card h-100">
                    <div class="card-header">
                        <h3>Share link</h3>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${link.title} ${
          link.total_score < 10
            ? `<span class="badge rounded-pill text-bg-danger">${link.total_score}</span>`
            : `<span class="badge rounded-pill text-bg-success">${link.total_score}</span>`
        }</h5>
                        <p style="display:${
                          logged ? "block" : "none"
                        }"><button type="button" class="btn btn-outline-warning btn-sm" onclick="hiddenLink(${
          link.id
        })">Hidden</button></p>
                        <p class="card-text"><strong>Description:</strong> ${
                          link.describe
                        }</p>
                        <p class="card-text"><strong>Link:</strong> <a href="${
                          link.link
                        }" target="_blank">${link.link}</a></p>
                        <p class="card-text"><strong>Published Time:</strong> ${
                          link.pub_time
                        }</p>
                        <p class="card-text"><strong>Published By:</strong> ${
                          link.user_fullname
                        }</p>
                        <div class="rating" style="display: ${
                          logged ? "block" : "none"
                        }">
                            <label for="rating-${link.id}">Rating:</label>
                            <select id="rating-${
                              link.id
                            }" class="form-select" data-link-id="${
          link.id
        }" onchange="ratingChange(this)">
                                <option value="0" ${
                                  link.score === 0 ? "selected" : ""
                                }>Not rated</option>
                                <option value="1" ${
                                  link.score === 1 ? "selected" : ""
                                }>1 Star</option>
                                <option value="2" ${
                                  link.score === 2 ? "selected" : ""
                                }>2 Star</option>
                                <option value="3" ${
                                  link.score === 3 ? "selected" : ""
                                }>3 Star</option>
                                <option value="4" ${
                                  link.score === 4 ? "selected" : ""
                                }>4 Star</option>
                                <option value="5" ${
                                  link.score === 5 ? "selected" : ""
                                }>5 Star</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="${
                          link.link
                        }" class="link-button" target="_blank">Access Links</a>
                    </div>
                </div>
            </div>
        `;
        cardContainer.insertAdjacentHTML("beforeend", card);
      }
    });
}

function ratingChange(event) {
  // 用户评分
  console.log(event.dataset);
  const linkId = event.dataset.linkId;
  const selectedValue = parseInt(event.value);
  console.log(`linkID: ${linkId}, selectedValue: ${selectedValue}`);
  fetch(`http://127.0.0.1:8000/api/links/${linkId}/score`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      score: selectedValue,
    }),
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else if (res.status === 403) {
        alert("You have already rated it, you cannot rate it again!");
      }
      throw new Error("Rating failed");
    })
    .then((respJson) => {
      console.log(respJson);
      alert("Rating success!");
      links();
    })
    .catch((err) => {
      console.log(err);
    });
}

function hiddenLink(linkID) {
  fetch(`http://127.0.0.1:8000/api/links/hidden/${linkID}`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error("Hidden failed");
    })
    .then((respJson) => {
      console.log(respJson);
      alert("Hidden success!");
      links();
    })
    .catch((err) => {});
}

function shareLink() {
  const title = document.querySelector("#formTitle").value;
  const description = document.querySelector("#formDescription").value;
  const link = document.querySelector("#formLink").value;
  if (!title || !description || !link) {
    alert("Please fill in all the fields");
    return
  }
  fetch("http://127.0.0.1:8000/api/links/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      link,
      describe: description
    }),
    }).then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error("Share failed");
      }
  ).then(data => {
    alert("Share success!")
    links()
    myModal.hide();
  }).catch(err => console.log(err))
}

function name(params) {
  // TODO 这需要写获取我的喜好的接
}

logged = sessionStorage.getItem("logged"); // 是否登录了的标志

links();

if (logged) {
  document.querySelector(".login-btn").style.display = "none";
} else {
  document.querySelector(".favourites-btn").style.display = "none";
}
