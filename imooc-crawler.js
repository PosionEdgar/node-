/**
 * Created by qiangxl on 2018/7/9.
 */
var http = require('http');


var url = 'http://www.imooc.com/learn/348';

http.get(url,function (res) {
  var html = '';
  res.on('data',function (data) {
    html+=data;
  })

  res.on('end',function () {
    console.log(html)
  })

}).on('error',function () {
  console.log('获取数据失败！')
})