const apiUrl = 'http://127.0.0.1:8000'

// ajax封装
function ajax(url, data, success, cache, alone, async, type, dataType, error, token) {
  var type = type || 'post'; //请求类型
  var dataType = dataType || 'json'; //接收数据类型
  var async = async ||true; //异步请求
  var alone = alone || false; //独立提交（一次有效的提交）
  var cache = cache || false; //浏览器历史缓存
  var token = token || '';
  var success = success || function (data) {
    /*console.log('请求成功');*/
    setTimeout(function () {
      layer.msg(data.msg); //通过layer插件来进行提示信息
    }, 500);
    if (data.status) { //服务器处理成功
      setTimeout(function () {
        if (data.url) {
          location.replace(data.url);
        } else {
          location.reload(true);
        }
      }, 1500);
    } else { //服务器处理失败
      if (alone) { //改变ajax提交状态
        ajaxStatus = true;
      }
    }
  };
  var error = error || function (data) {
    /*console.error('请求成功失败');*/
    /*data.status;//错误状态吗*/
    layer.closeAll('loading');
    setTimeout(function () {
      if (data.status == 404) {
        layer.msg('Request failed, request not found');
      } else if (data.status == 503) {
        layer.msg('Request failed, server internal error');
      } else if (data.status == 400) {
        layer.msg('Request error');
      } else {
        layer.msg('Request failed, network connection timed out');
      }
      ajaxStatus = true;
    }, 500);
  };

  /*正常情况下1秒后可以再次多个异步请求，为true时只可以有一次有效请求（例如添加数据）*/
  if (!alone) {
    setTimeout(function () {
      ajaxStatus = true;
    }, 1000);
  }
  $.ajax({
    'url': url,
    'data': data,
    'type': type,
    'dataType': dataType,
    'headers': {
      'Authorization': 'Bear ' + token,
    },
    'async': async,
    'success': success,
    'error': error,
    'jsonpCallback': 'jsonp' + (new Date()).valueOf().toString().substr(-4),
    'beforeSend': function () {
      // layer.msg('Loading', {
      //   icon: 16,
      //   shade: 0.01
      // });
    },
  });
}

// submitAjax(post方式提交)
function submitAjax(form, success, cache, alone, token) {
  cache = cache || true;
  var form = $(form);
  var url = form.attr('action');
  var data = form.serialize();
  const realUrl = apiUrl + url
  ajax(realUrl, data, success, cache, alone, false, 'post', 'json', null, token);
}
// ajax提交(post方式提交)
function post(url, data, success, cache, alone, token) {
  const realUrl = apiUrl + url
  ajax(realUrl, data, success, cache, alone, false, 'post', 'json', null, token);
}

// ajax提交(put方式提交)
function put(url, data, success, cache, alone, token) {
  const realUrl = apiUrl + url
  ajax(realUrl, data, success, cache, alone, false, 'put', 'json', null, token);
}

// ajax提交(get方式提交)
function get(url, success, cache, alone, token) {
  const realUrl = apiUrl + url
  ajax(realUrl, {}, success, cache, alone, false, 'get', 'json', null, token);
}

// jsonp跨域请求(get方式提交)
function jsonp(url, success, cache, alone, token) {
  const realUrl = apiUrl + url
  ajax(realUrl, {}, success, cache, alone, false, 'get', 'jsonp', null, token);
}