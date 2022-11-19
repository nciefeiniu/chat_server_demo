let userName = '';

function loginSuccess(data) {
  if (data.msg === 'Login seccess') {
    const token = data.data.token
    const id = data.data.member_id
    if (token && id >= 0) {
      console.log('jump')
      window.location.replace('./index.html?token=' + encodeURIComponent(token) + '&user_id=' + encodeURIComponent(id) + '&username=' + encodeURIComponent(userName))
    } else {
      console.log(token)
      console.log(id)
    }
  } else {
    console.log(data)
  }
}

function registerSuccess(data) {
  if (data.meg === 'Login seccess') {
    const token = data.data.token
    const id = data.data.member_id
    if (token && id >= 0) {
      window.location.replace('./index.html?token=' + encodeURIComponent(token) + '&user_id=' + encodeURIComponent(id) + '&username=' + encodeURIComponent(userName))
    }
  }
}


var loginHandle = function () { //（函数定义） 绑定点击事件
  const username = document.getElementById('usernameInput').value // DOM编程，获取输入的值
  const password = document.getElementById('passwordInput').value // DOM编程，获取输入的值

  if (username == "" || username == null || username == undefined) { // 判断，也就是分支结构
    alert("username can not be empty")
    return
  }
  if (password == "" || password == null || password == undefined) { // 判断，也就是分支结构
    alert("password can not be empty")
    return
  }
  userName = username
  post('/api/member', JSON.stringify({
    'username': username,
    'password': password
  }), loginSuccess, false)
}



var registerHandle = function () { // （函数定义）点击注册按钮的事件
  const username = document.getElementById('usernameInput').value // DOM编程，获取输入的值
  const password = document.getElementById('passwordInput').value // DOM编程，获取输入的值
  const password2 = document.getElementById('passwordInput2').value // DOM编程，获取输入的值

  if (username == "" || username == null || username == undefined) {
    alert("username can not be empty")
    return
  }
  if (password == "" || password == null || password == undefined || password2 == "" || password2 == null || password2 == undefined) {
    alert("Password cannot be empty")
    return
  }
  if (password !== password2) {
    alert("The two passwords are inconsistent, please re-enter.")
    return
  }
  userName = username

  post('/api/member', JSON.stringify({
    'username': username,
    'password': password
  }), registerSuccess, false)

}