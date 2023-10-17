const baseUrl = "http://127.0.0.1:7777";

function allUsers(callback) {
  // 获取所有User
  fetch(baseUrl + "/api/users")
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      callback(data);
    });
}

function allThreads(callback) {
  // 获取所有Thread
  fetch(baseUrl + "/api/threads")
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      callback(data);
    });
}

function allPosts(id, callback) {
  // 获取指定Thread的所有Post，id为Thread的ID
  fetch(baseUrl + `/api/threads/${id}/posts`)
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      callback(data);
    });
}

function createThread(data, callback, callbackArgs) {
  // 创建Thread
  fetch(baseUrl + "/api/threads/", {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((resp) => {
    if (callback) {
      callback(callbackArgs);
    }
  });
}

function delThread(id, username, callback, callbackArg) {
  // 删除Thread，需要传递Thread的ID和用户的username
  fetch(baseUrl + `/api/threads/${id}`, {
    method: "delete",
    body: JSON.stringify({
      user: username,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (callback) {
      callback(callbackArg);
    }
  });
}

function sendPost(id, username, text, callback, callbackArgs) {
  // 想Thread中发送Post
  fetch(baseUrl + `/api/threads/${id}/posts`, {
    method: "post",
    body: JSON.stringify({
      user: username,
      text: text,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(resp => {
    if (callback) {
      callback(...callbackArgs)
    }
  })
}
