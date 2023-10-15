document.querySelector(".login-btn").onclick = function() {
    // 用户输入 username，点击登录按钮，就会执行这里
    const username = document.querySelector('.user-input').value
    if (!username) {
        // 如果每输入username。会给出提示
        window.alert("User name format error");
        return
    }

    fetch(`http://localhost:7777/api/users/${username}`)
            .then((data) => {
                // text()方法属于fetchAPI的一部分，它返回一个Promise实例对象，用于获取和后台返回的数据
                var status = data.status;
                if (status === 404) {
                    console.log('404')
                    alert('User name error')
                    return {}
                } else {
                    return data.json()
                }
            }).then((data) => {
                if (!data) {
                    // 登录失败
                } else {
                    // 登录成功，就跳转到thread页面
                    console.log(data)
                    location.href = `./threads.html?${encodeURIComponent(new URLSearchParams(data).toString())}`;

                }
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
              })
};
