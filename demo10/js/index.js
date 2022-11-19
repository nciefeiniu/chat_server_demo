var aud = document.getElementById("header-video");
aud.onended = function () { // 视频播放完成后执行的函数
  console.log('播放完毕')
  document.querySelector('#start-marl').scrollIntoView(true) // DOM 编程，播放完毕后，跳转到指定位置
};

window.onload = function () { // 页面加载完成执行的方式
  const loginName = getQueryString('username') // 如果URL没传递此参数，那就是没登录（调用定义的函数）
  if (loginName === '' || loginName === undefined || loginName === null) {
    alert('请登录')
    window.location.replace('./login.html') // 跳转
  }

  showLeaders() // 调用函数

  computeToday(); // 页面加载好了先调用一次
  setInterval(computeToday, 1000 * 5) // 定时函数
}


function getQueryString(key) { // （函数定义）获取URL中的参数
  var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)"); // 这是通过正则
  var result = window.location.search.substr(1).match(reg); // 正则匹配这个URL中参数
  return result ? decodeURIComponent(result[2]) : null; // 获取匹配到的值
}


const leadersInfo = [{ // 数组
    name: '陈独秀',
    'text': '（1921年7月，中共一大选举产生）',
    's': '中央局书记'
  },
  {
    name: '陈独秀',
    'text': '（1922年7月，中共二大选举产生）',
    's': '中央执行委员会委员长'
  },
  {
    name: '陈独秀',
    'text': '（1923年6月，中共三大选举产生）',
    's': '中央执行委员会委员长'
  },
  {
    name: '陈独秀',
    'text': '（1925年1月，中共四大推选）',
    's': '中共中央总书记'
  },
  {
    name: '陈独秀',
    'text': '（1927年4月至5月，中共五大推选）',
    's': '中共中央总书记'
  },
  {
    name: '向忠发',
    'text': '（1928年6月至7月，中共六大选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '博古（秦邦宪）',
    'text': '（1934年1月，中共六届五中全会产生）',
    's': '中共中央总书记'
  },
  {
    name: '张闻天（洛甫）',
    'text': '（1935年1月，遵义会议选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '毛泽东',
    'text': '（1945年6月，中共七届一中全会产生）',
    's': '中共中央主席'
  },
  {
    name: '毛泽东',
    'text': '（1956年9月，中共八届一中全会选举产生）',
    's': '中共中央主席'
  },
  {
    name: '毛泽东',
    'text': '（1969年4月，中共九届一中全会选举产生）',
    's': '中共中央主席'
  },
  {
    name: '毛泽东',
    'text': '（1973年8月，中共十届一中全会选举产生）',
    's': '中共中央主席'
  },
  {
    name: '华国锋',
    'text': '（1976年10月中央政治局会议通过，1977年7月十届三中全会追认）',
    's': '中共中央主席'
  },
  {
    name: '华国锋',
    'text': '（1977年8月，中共十一届一中全会选举产生）',
    's': '中共中央主席'
  },
  {
    name: '胡耀邦',
    'text': '（1980年2月，中共十一届五中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '胡耀邦',
    'text': '（1981年6月，中共十一届六中全会选举产生）',
    's': '中共中央主席'
  },
  {
    name: '胡耀邦',
    'text': '（1982年9月，中共十二届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '赵紫阳',
    'text': '（1987年11月，中共十三届一中全会产生）',
    's': '中共中央总书记'
  },
  {
    name: '江泽民',
    'text': '（1989年6月，中共十三届四中全会产生）',
    's': '中共中央总书记'
  },
  {
    name: '江泽民',
    'text': '（1992年10月19日，中共十四届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '江泽民',
    'text': '（1997年9月，中共十五届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '胡锦涛',
    'text': '（2002年11月，中共十六届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '胡锦涛',
    'text': '（2007年10月，中共十七届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '习近平',
    'text': '（2012年11月，中共十八届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '习近平',
    'text': '（2017年10月，中共十九届一中全会选举产生）',
    's': '中共中央总书记'
  },
  {
    name: '习近平',
    'text': '（2022年10月，中共二十届一中全会选举产生）',
    's': '中共中央总书记'
  },
]

function showLeaders() { // 展示各位领导人
  let olNode = document.getElementById('leaders')
  leadersInfo.forEach(element => { // 数组循环
    // 下面全是DOM编程
    let liNode = document.createElement('li')
    liNode.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start')
    let divNode1 = document.createElement('div')
    divNode1.setAttribute('class', 'ms-2 me-auto')
    divNode1.innerHTML = `<div class="fw-bold">${element.name}</div>${element.text}`
    let spanNode = document.createElement('span')
    spanNode.setAttribute('class', 'badge bg-primary rounded-pill')
    spanNode.innerText = element.s
    liNode.appendChild(divNode1)
    liNode.appendChild(spanNode)
    olNode.appendChild(liNode)
  });

}


function computeToday() { // 函数定义
  // bottom-progress
  let bp = document.getElementById('bottom-progress') // dom编程
  bp.innerHTML = "";
  let nowTime = new Date() // 时间
  let startTime = new Date() // 时间
  startTime.setHours(0, 0, 0, 0) // 修改时间

  let aa = (nowTime.getTime() - startTime.getTime()) / 1000 // 计算两个时间差
  let reuslt = (aa / (60 * 60 * 24)).toFixed(4)
  let node = document.createElement('div') // DOM编程
  node.setAttribute('class', 'progress-bar')
  node.setAttribute('role', 'progressbar')
  node.setAttribute('aria-valuemin', '0')
  node.setAttribute('aria-valuemax', '100')
  node.setAttribute('aria-valuenow', reuslt * 100)
  node.setAttribute('style', `width: ${reuslt * 100}%;`)
  node.innerText = `今天已度过${reuslt * 100}%`
  bp.appendChild(node);
}