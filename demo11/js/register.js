var svgg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/; // 正则
const registerButton = document.getElementById('register-button');

function validateForm() { // 函数定义（表单验证用的函数）
    const name = document.getElementById('input-name').value; // DOM编程
    const password = document.getElementById('input-password').value; // DOM编程
    const password_again = document.getElementById('input-password-again').value; // DOM编程


    if (svgg.test(name) === false) {
        alert('用户名必须是邮箱');
        return false;
    }

    if (password !== password_again) {
        document.getElementById('input-password').setAttribute('border-color', 'red'); // DOM编程
        document.getElementById('input-password-again').setAttribute('border-color', 'red'); // DOM编程
        return false;
    }

    alert('注册成功.');

    return true;
}