window.onload = function() {
    document.getElementsByClassName("good").innerText = 0;
    let name = getQueryString('name');
    if (name === '' || name === null || name === undefined) { // 判断如果没登录，跳转到登录页面
        window.location.replace('./login.html')
    }

    $('.carousel').carousel();
    initLunBoTu(); // 初始化轮播图
    setInterval(computeChinaAviationDevpTime, 1000); // 定时器，没1秒钟执行一次这个函数

}

function initLunBoTu() {
    const carouselBox = document.getElementById('carousel-button'); // 获取到轮播图按钮的dom
    for (let i = 0; i < 7; i++) {
        // 循环创建控制轮播图的按钮
        let liNode = document.createElement('li'); // DOM编程
        liNode.setAttribute('data-target', '#carousel-example-generic') // DOM编程
        liNode.setAttribute('data-slide-to', i) // DOM编程
        carouselBox.appendChild(liNode); // DOM编程
    }

    const images = ['arj.jpeg', 'c919-2.jpeg', 'c919.jpeg', 'jian-20.jpeg', 'jian8.jpeg', 'jian10.jpeg', 'jian11.jpeg', 'yun-20.jpeg'] // 数组

    const imageListBox = document.getElementById('carousel-inner-box'); // DOM编程

    let mark = 0
    images.forEach(element => { // 这里是向轮播图里面塞图片（数组遍历）
        let divNode = document.createElement('div'); // DOM编程
        let imgNode = document.createElement('img'); // DOM编程
        let divNode2 = document.createElement('div'); // DOM编程
        if (mark === 0) {
            divNode.setAttribute('class', 'item active') // DOM编程

        } else {
            divNode.setAttribute('class', 'item') // DOM编程

        }
        divNode2.setAttribute('class', 'carousel-caption'); // DOM编程
        imgNode.setAttribute('src', './images/' + element); // DOM编程
        imgNode.setAttribute('width', '1000px'); // DOM编程
        imgNode.setAttribute('height', '562px'); // DOM编程
        divNode.appendChild(imgNode); // DOM编程
        divNode.append(divNode2); // DOM编程
        imageListBox.appendChild(divNode); // DOM编程
        mark = mark + 1;
    });

}


var DateInitFromStr = function(inStr) { // 函数定义
    // 这个函数是支持你现在提供的2种数据格式的，包括了'2020-07-08 13:24:27'和'2020-07-01'
    // 对于'2020-07-01'，等效于'2020-07-01 00:00:00.000'
    return (new Date(inStr));
}

var MyGetTimeS = function(inDStr1, inDStr2) { // 函数定义
    // 计算两个时间相差秒数
    let D1 = DateInitFromStr(inDStr1);
    let D2 = DateInitFromStr(inDStr2);
    return ((D1.getTime() - D2.getTime()) / 1000);
}


const devpList = document.getElementById('devp-list');

function computeChinaAviationDevpTime() { // 函数定义
    let _start = DateInitFromStr('1954-07-03'); //调用函数
    let _now = new Date();
    let _tmp = Math.ceil((_now.getTime() - _start.getTime()) / 1000); // 秒
    let Devminte = Math.ceil(_tmp / 60) // 分
    let DevHour = Math.ceil(Devminte / 60) // 小时
    let devpDay = Math.ceil(DevHour / 24) // 天

    devpList.innerText = ''; // 清空这个dom
    for (let i = 0; i < 4; i++) { // 循环结构
        let node = document.createElement('li')
        node.setAttribute('class', 'list-group-item') // DOM编程
        node.setAttribute('targe', i) // DOM编程

        switch (i) { // 分支结构
            case 0:
                node.innerText = `已发展${_tmp}秒`
                break
            case 1:
                node.innerText = `已发展${Devminte}分`
                break
            case 2:
                node.innerText = `已发展${DevHour}小时`
                break
            case 3:
                node.innerText = `已发展${devpDay}天`
                break
        }

        devpList.appendChild(node)

    }
}



const goodList = [0, 0, 0, 0, 0, 0, 0, 0, 0]

/*点赞的数量：*/
function sendGood(index) {

    goodList[index] = goodList[index] + 1
    document.getElementsByClassName("good")[index].innerText = goodList[index]

    // document.getElementById("goodSpan").onclick = function(e) {
    //     e.preventDefault();
    //     e.stopImmediatePropagation();
    // }
}



function getQueryString(name) { // 获取url参数
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    };
    return null;
}