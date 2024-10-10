function getAllThreads(callback) {
  fetch("http://127.0.0.1:7777/api/threads")
    .then((res) => res.json())
    .then((data) => {
      callback(data);
    });
}

function getPosts(thread, callback) {
  fetch(`http://127.0.0.1:7777/api/threads/${thread.id}/posts`)
    .then(res => res.json())
    .then(data => {
      console.log('data: ', data)
      thread.posts = data
      callback(thread);
    }).catch(err => console.log(err));
}


