var svgg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/; // 正则表达式
const registerButton = document.getElementById('register-button');


function validateForm() { // 函数定义（表单验证用的函数）
    const name = document.getElementById('input-name').value; // DOM编程
    const password = document.getElementById('input-password').value; // DOM编程

    if (svgg.test(name) === false) { // 正则表达式的使用
        alert('用户名必须是邮箱');
        return false;
    }

    // 因为没后端，所以，没办法验证账号密码

    alert('登录成功.');
    return true;

}


function jump2index() {
    const name = document.getElementById('input-name').value; // DOM编程
    const password = document.getElementById('input-password').value; // DOM编程

    if (svgg.test(name) === false) { // 正则表达式的使用
        alert('用户名必须是邮箱');
        return false;
    }

    if (password === '' || password === undefined || password === null) {
        alert('请输入密码');

        return
    }

    // 因为没后端，所以，没办法验证账号密码

    alert('登录成功.');
    window.location.replace('./index.html?name=' + name);
}