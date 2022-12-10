function update() {
    const element = document.getElementById("myprogressBar");

    let width = 1;

    const identity = setInterval(scene, 10);

    function scene() {
        if (width >= 100) {
            clearInterval(identity);
        } else {
            width++;

            element.style.width = `${width}%`;
            element.innerHTML = `${Number(width)}%`;
        }
    }
}

function CreateDom() {
    this.div = document.createElement("div");
    this.div.id = "myprogressBar";
    document.querySelector("#Progress_Status").appendChild(this.div);
}
var username = '';

document.querySelector(".user input").onchange = function(e) {
    username = e.target.value;
};

document.querySelector(".login_btn").onclick = function() {
    if (username !== "") {
        var status = "";

        window
            .fetch(`http://localhost:7777/api/users/${username}`)
            .then((data) => {
                // text()方法属于fetchAPI的一部分，它返回一个Promise实例对象，用于获取和后台返回的数据
                status = data.status;
                return data.text();
            })
            .then((ret) => {
                // 注意这里得到的才是最终的数据
                if (status === 200) {
                    let arr = [];

                    let obj = JSON.parse(ret);
                    for (var key in obj) {
                        arr.push(`${key}=${obj[key]}`);
                        arr.join("&");
                    }
                    let str = arr.join("&");
                    new CreateDom();

                    update();


                    setTimeout(() => {
                        document.querySelector('.user input').value = '';
                        location.href = `../threads/threads.html?${encodeURIComponent(str)}`;
                    }, 3000);
                } else if (status === 404) {
                    window.alert(ret);
                }
            });
    } else {
        window.alert("Not found");
    }
};