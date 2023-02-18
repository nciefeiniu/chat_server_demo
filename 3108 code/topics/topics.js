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

let userStr = decodeURIComponent(location.search.slice(1));
let arr = userStr.split("&");
let newBrr = {};
for (var i = 0; i < arr.length; i++) {
    let brr = arr[i].split("=");
    for (var j = 0; j < brr.length; j++) {
        newBrr[brr[0]] = brr[1];
    }
}

function CreateDom() {
    this.div = document.createElement("div");
    this.div.id = "myprogressBar";
    document.querySelector("#Progress_Status").appendChild(this.div);
}
var thread_title = "";
var icon = "";
var text = "";

document.querySelector(".thread_title").onchange = function(e) {
    thread_title = e.target.value;
};
document.querySelector(".icon").onchange = function(e) {
    icon = e.target.value;
};
document.querySelector(".text").onchange = function(e) {
    text = e.target.value;
};

 function topicSumbit() {
    if (thread_title === "" || icon === "" || text === "") {
        window.alert("No Content");
    } else {
        var status = "";
        fetch("http://localhost:7777/api/threads/", {
                method: "post",
                body: JSON.stringify({
                    user: newBrr.username,
                    thread_title,
                    icon,
                    text,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(function(data) {
                return data.text();
            })
            .then((res) => {
                new CreateDom();
                update();

                setTimeout(() => {
                    location.href = `../threads/threads.html?${encodeURIComponent(
          userStr
        )}`;
                }, 3000);
            });
    }
};
//返回
document.querySelector(".topics_forward").onclick = function() {
    location.href = `../threads/threads.html?${encodeURIComponent(
  userStr
)}`;
};