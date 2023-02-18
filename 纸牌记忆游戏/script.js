// 设置游戏最长时间，单位是秒
let maxGameTime = 60 * 3; // 这里我设置的3分钟

// 设置默认卡片数量
let defaultCardNumber = 12;

// 卡片数组包含所有卡片
let card = document.getElementsByClassName("card");
let cards = [...card];

// 游戏中所有卡片
const deck = document.getElementById("card-deck");

// 声明 moves 变量
let moves = 0;

// 声明得分
let score = 0;
let counter = document.querySelector(".moves");


// 声明 matchedCard 的变量
let matchedCard = document.getElementsByClassName("match");


// 模板中的关闭图标
let closeicon = document.querySelector(".close");

// 声明 modal
let modal = document.getElementById("popup1")

// 打开卡片的数组
var openedCards = [];

//
let cardInputDom = document.getElementById('card-number-input');


function setCardNumbers() {
    const cardN = cardInputDom.value;
    if (cardN < 3 || cardN % 3 !== 0) {
        // 这是不对的
        alert("输入的牌数量不正确，请重新输入！")
    } else {
        defaultCardNumber = cardN;
        playAgain();
    }

}


// 游戏初始化
function gameInit(cardNumber) {
    console.log('init games')

    document.getElementById('maxTimer').innerText = `最长游戏时间：${maxGameTime}秒`

    cardInputDom.setAttribute('value', defaultCardNumber)

    // 这里就是初始化生成多少张牌（注意是3的倍数）
    if (cardNumber < 3 || cardNumber % 3 !== 0) {
        // 这是不对的
        alert("输入的牌数量不正确，请重新输入！")
    } else {
        let cardContainer = document.getElementById('card-deck');
        cardContainer.innerText = ""; // 清空所有牌

        let startNumber = 1;
        for (let i = 0; i < cardNumber; i++) {
            if (i !== 0 && i % 3 == 0) {
                startNumber += 1;
            }
            let card = document.createElement('li');
            card.className = 'card';
            card.setAttribute('type', startNumber);
            card.innerHTML = `<i class="fa">${startNumber}</i>`;
            cardContainer.appendChild(card);

        }
    }
    cards = [...document.getElementsByClassName("card")]
}


// 洗牌功能
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};


// 页面刷新/加载时洗牌
document.body.onload = startGame();

// 开始新游戏的功能
function startGame() {

    // 清空 openCards 数组
    openedCards = [];

    // 初始化游戏面板
    gameInit(defaultCardNumber);

    // 洗牌
    cards = shuffle(cards);
    // 从每张卡片中删除所有现有的类
    for (var i = 0; i < cards.length; i++) {
        deck.innerHTML = "";
        [].forEach.call(cards, function(item) {
            deck.appendChild(item);
        });
        cards[i].classList.remove("show", "open", "match", "disabled");
    }
    // 重置 moves
    moves = 0;
    score = 0;
    counter.innerHTML = `得分：${score}`;
    // 重置 timer
    second = 0;
    minute = 0;
    hour = 0;
    var timer = document.querySelector(".timer");
    timer.innerHTML = "已用时: 0 秒";
    clearInterval(interval);
}


// 显示卡片的功能
var displayCard = function() {
    this.classList.toggle("open");
    this.classList.toggle("show");
    this.classList.toggle("disabled");
};


// 将打开的卡片添加到 OpenedCards 列表并检查卡片是否匹配
function cardOpen() {
    openedCards.push(this);
    var len = openedCards.length;
    if (len === 3) {
        let thisStepScore = 1; // 当前步骤得分
        if (openedCards[0].type === openedCards[1].type && openedCards[1].type === openedCards[2].type) {
            matched();
        } else {
            unmatched();
            thisStepScore = -1;
        }
        moveCounter(thisStepScore);
    }
};


// 当卡片匹配时的功能
function matched() {
    openedCards[0].classList.add("match", "disabled");
    openedCards[1].classList.add("match", "disabled");
    openedCards[2].classList.add("match", "disabled");

    openedCards[0].classList.remove("show", "open", "no-event");
    openedCards[1].classList.remove("show", "open", "no-event");
    openedCards[2].classList.remove("show", "open", "no-event");

    openedCards = [];
}


// 当卡片不匹配时的功能
function unmatched() {
    openedCards[0].classList.add("unmatched");
    openedCards[1].classList.add("unmatched");
    openedCards[2].classList.add("unmatched");
    disable();
    setTimeout(function() {
        openedCards[0].classList.remove("show", "open", "no-event", "unmatched");
        openedCards[1].classList.remove("show", "open", "no-event", "unmatched");
        openedCards[2].classList.remove("show", "open", "no-event", "unmatched");
        enable();
        openedCards = [];
    }, 1000);
}


// 暂时禁用卡片的功能
function disable() {
    console.log(cards)
    Array.prototype.filter.call(cards, function(card) {
        card.classList.add('disabled');
    });
}


// 启用卡片并禁用匹配的卡片的功能
function enable() {
    Array.prototype.filter.call(cards, function(card) {
        card.classList.remove('disabled');
        for (var i = 0; i < matchedCard.length; i++) {
            matchedCard[i].classList.add("disabled");
        }
    });
}


// 计算玩家的动作的功能
function moveCounter(stepScore) {
    moves += 1;
    score += stepScore;
    counter.innerHTML = `得分：${score}`;
    // 第一次点击时启动计时器
    if (moves == 1) {
        second = 0;
        startTimer();
    }
}


// 显示游戏的时间
var second = 0;
var timer = document.querySelector(".timer");
var interval;

function startTimer() {
    interval = setInterval(function() {
        timer.innerHTML = "已用时: " + second + " 秒";
        second++;

        if (second >= maxGameTime) {
            // 时间到，游戏结束了
            console.log('游戏结束了')
            congratulations(false);
        }

    }, 1000);
}


// 所有卡片匹配匹配时展示恭喜界面，显示移动次数时间和等级
function congratulations(result) {

    if (result === false) {
        // 这是时间到了的操作
        clearInterval(interval);
        document.getElementById('pop-title').innerText = '抱歉';
        document.getElementById('result-text').innerText = '时间到了，下次继续努力'
            // 显示祝贺模板
        modal.classList.add("show");
        // 显示移动、评级、时间
        document.getElementById("finalMove").innerHTML = score;

        //模板上的关闭图标
        closeModal();
    } else if (matchedCard.length == document.getElementsByClassName("card").length) {
        clearInterval(interval);
        // 显示祝贺模板
        modal.classList.add("show");

        // 显示移动、评级、时间
        document.getElementById("finalMove").innerHTML = score;

        //模板上的关闭图标
        closeModal();
    };
}


// 界面上的关闭图标
function closeModal() {
    closeicon.addEventListener("click", function(e) {
        modal.classList.remove("show");
        startGame();
        addListener();
    });
}


// 再次游戏功能
function playAgain() {
    // location.replace(document.referrer);
    modal.classList.remove("show");
    clearInterval(interval);

    startGame();
    addListener();
}


function addListener() {
    // 循环以将事件侦听器添加到每张卡片
    for (var i = 0; i < cards.length; i++) {
        card = cards[i];
        card.addEventListener("click", displayCard);
        card.addEventListener("click", cardOpen);
        card.addEventListener("click", congratulations);
    };
}


addListener();