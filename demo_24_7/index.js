const apiUrl = 'http://localhost:7777'
var loggedUserInfo = undefined


function loginHandleApi(username) {
  fetch(apiUrl + '/api/users/' + username).then(response => {
    if (response.status === 200) {
      return response.json()
    }
    return Promise.reject(new Error('User not found'))
  }).then(successData => {
    // Login success
    window.history.pushState({currentPage: 'thread'}, 'Threads', '/threads')
    showThreadPage()
  }).catch(error => {
    // Login failed
    alert(error)
  })
}


function threadsHandleApi() {
  // Get all threads
  fetch(apiUrl + '/api/threads').then(response => response.json()).then(successData => {
    // Successfully obtained data, needs to be rendered onto the page
    const loginBox = document.querySelector('#loginBox')
    loginBox.innerHTML = '';
    let threadsPageContent = `<h1>Logged in as ${loggedUserInfo.name}</h1>`
    // render threads
    for (let i=0; i<successData.length; i++) {
      threadsPageContent += `<div class="threadBox" onclick="togglePosts('thread-${successData[i].id}')">
        <div class="threadTitle">${successData[i].thread_title}</div>
        <div class="postsBox" id="thread-${successData[i].id}">
        </div>
    </div>`
    }

    loginBox.innerHTML = threadsPageContent
  })
}


function threadPostsHandleApi(threadId) {
  // Get all posts in a thread
  fetch(apiUrl + '/api/threads/' + threadId + '/posts').then(response => response.json()).then(successData => {
    // Successfully obtained data, needs to be rendered onto the page
  })
}

function threadNewPostHandleApi(threadId, content) {
  // Create a new post in a thread
  fetch(apiUrl + '/api/threads/' + threadId + '/posts', {
    method: 'POST',
    body: JSON.stringify({
      content: content
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json()).then(successData => {})
}


function newThreadHandleApi(title, content, username, icon) {
  // Create a new thread
  fetch(apiUrl + '/api/threads', {
    method: 'POST',
    body: JSON.stringify({
      thread_title: title,
      text: content,
      user: username,
      icon: icon
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json()).then(successData => {})
}


function deleteThreadHandleApi(threadId, username) {
  // Delete a thread
  fetch(apiUrl + '/api/threads/' + threadId, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({user: username})
  }).then(response => response.json()).then(successData => {})
}


function loginHandle() {
  const username = document.querySelector('#usernameInput').value
  if (username === undefined || username === '' || username === null) {
    return
  }
  loginHandleApi(username)
}


function showThreadPage() {
  threadsHandleApi()
}
