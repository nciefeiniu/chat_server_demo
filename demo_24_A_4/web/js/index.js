const USERNAME = sessionStorage.getItem("username");
    const TOKEN = sessionStorage.getItem("token");
    const FULLNAME = sessionStorage.getItem("fullname");

    var SHOWTYPE = 'index';

    if (FULLNAME) {
      document.querySelector('.welcome').innerHTML = `Welcome ${FULLNAME}`;
      document.querySelector('.btn-logout').style.display = 'block';
      document.querySelector('.add-share-link').style.display = 'block';
    } else {
      document.querySelector('.btn-login').style.display = 'block';
    }

    getAllShareLinks();

    function logoutHandle() {
      // 退出登录
      sessionStorage.clear();
      window.location.reload();
    }

    function showMyFavorites() {
      SHOWTYPE = 'favorites';
      getAllShareLinks();
      document.getElementById('show-my-favorites').classList.add('hidden-link-score')
      document.getElementById('show-all-links').classList.remove('hidden-link-score')
    }

    function showAllShareLinks() {
      SHOWTYPE = 'index';
      getAllShareLinks();
      document.getElementById('show-all-links').classList.add('hidden-link-score')
      document.getElementById('show-my-favorites').classList.remove('hidden-link-score')
    }

    function getAllShareLinks() {
      // 获取所有的分享链接
      let apiUrl = 'http://127.0.0.1:8050/share_links'
      if (SHOWTYPE === 'favorites') {
        apiUrl = 'http://127.0.0.1:8050/share_links/positive'
      }
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': TOKEN ? `Bearer ${TOKEN}` : ''
        }
      }).then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw 'Error'
        }
      }).then(data => {
        console.log(data);
        renderShareLinks(data)
      }).catch(error => {
        console.error(error);
      });
    }

    function scoreShareLink(id, score) {
      fetch(`http://127.0.0.1:8050/share_links/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': TOKEN ? `Bearer ${TOKEN}` : ''
        },
        body: JSON.stringify({
          id: id,
          score: score
        })
      }).then(response => {
        if (response.ok) {
          return response.json()
        } else if (response.status === 401) {
          window.location.href = './login_or_register.html';
        } else if (response.status === 409) {
          alert('You have already scored this link.');
          throw 'Error'
        } else {
          throw 'Error'
        }
      }).then(data => {
        console.log(data);
        getAllShareLinks();
      }).catch(error => {
        console.error(error);
      });
    }

    function renderShareLinks(data){
      // 渲染分享链接
      const shareLinksContainer = document.getElementById('share-links-container');
      shareLinksContainer.innerHTML = '';
      for (let i=0; i< data.length;i++) {
        const shareLink = data[i];
        shareLinksContainer.innerHTML += `
          <div class="list-group-item list-item">
            <h5 class="list-title">${shareLink.title} <span class="link-item">${shareLink.link}</span></h5>
            <p class="list-score">Total Score: ${shareLink.total_score}</p>
            <p class="list-description">${shareLink.description}</p>
            <div class="row">
              <div class="col-md-8">
                <div class="${USERNAME ? 'show-link-score': 'hidden-link-score'}">
                  <button class="btn btn-link" onclick="scoreShareLink(${shareLink.id}, 1)">👍</button>
                  <button class="btn btn-link" onclick="scoreShareLink(${shareLink.id}, -1)">👎</button>  
                </div>
              </div>
              <div class="col-md-4 text-end">
                <button class="btn btn-danger btn-sm ${USERNAME ? 'show-link-score': 'hidden-link-score'}" onclick="hiddenShareLink(${shareLink.id})">Hidden</button>
              </div>
            </div>
          </div>
        `
      }

    }

    function hiddenShareLink(id) {
      fetch(`http://127.0.0.1:8050/share_links/hidden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': TOKEN ? `Bearer ${TOKEN}` : ''
        },
        body: JSON.stringify({
          id: id
        })
      }).then(response => {
        if (response.ok) {
          return response.json()
        }
        throw 'Error'
      }).then(data => {
        alert('Share Link Hidden Successfully');
        getAllShareLinks();
      }).catch(error => {
        console.error(error);
      });
    }

    document.getElementById('new-share-form').addEventListener('submit', function (e) {
      // 提交新的分享链接
      e.preventDefault();
      const jsonData = {
        title: document.getElementById('title').value,
        link: document.getElementById('link').value,
        description: document.getElementById('description').value
      }
      fetch('http://127.0.0.1:8050/share_links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': TOKEN ? `Bearer ${TOKEN}` : ''
        },
        body: JSON.stringify(jsonData)
      }).then(response => response.json()).then(data => {
        console.log(data);
        alert('Share Link Added Successfully');
        getAllShareLinks()
      })
      
    })
