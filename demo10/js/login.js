window.onload = function () { // 暂时没用
  // walkmydog();
}


function isPoneAvailable(pone) { // （函数定义）定义一个方法，判断手机号是否为真的手机号
  var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/; // 正则表达式
  if (!myreg.test(pone)) {
    return false;
  } else {
    return true;
  }
}

var loginHandle = function () { //（函数定义） 绑定点击事件
  const name = document.getElementById('usernameInput').value // DOM编程，获取输入的值
  const password = document.getElementById('passwordInput').value // DOM编程，获取输入的值

  if (name == "" || name == null || name == undefined) { // 判断，也就是分支结构
    alert("手机号不能为空")
    return
  }
  if (password == "" || password == null || password == undefined) { // 判断，也就是分支结构
    alert("密码不能为空")
    return
  }
  if (isPoneAvailable(name) === false) { // 判断，也就是分支结构
    alert("手机号不正确，登录失败。")
    return
  }
  if (password.length < 6) { // 判断，也就是分支结构
    alert("密码不正确，登录失败。")
    return
  }
  window.location.href = "./index.html?username=" + name;
}


var registerHandle = function () { // （函数定义）点击注册按钮的事件
  const name = document.getElementById('usernameInput').value // DOM编程，获取输入的值
  const password = document.getElementById('passwordInput').value // DOM编程，获取输入的值
  const password2 = document.getElementById('passwordInput2').value // DOM编程，获取输入的值

  if (name == "" || name == null || name == undefined) {
    alert("手机号不能为空")
    return
  }
  if (password == "" || password == null || password == undefined || password2 == "" || password2 == null || password2 == undefined) {
    alert("密码不能为空")
    return
  }
  if (isPoneAvailable(name) === false) {
    alert("手机号不正确，请重新输入。")
    return
  }
  if (password !== password2) {
    alert("两次输入的密码不一致，请重新输入。")
    return
  }
  if (password.length < 6) {
    alert("密码长度至少为6位，请重新输入。")
    return
  }
  window.location.replace('./login.html')

}