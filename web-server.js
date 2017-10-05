var mysql  = require('mysql');
var express = require('express');

var config = require('./config');

db = mysql.createConnection(config.mysql);
db.connect();

var app = express();
app.get('/', function (req, res) {
   // res.send('Hello World');
	var q = "select `order`.id,`order`.contact,shop.`name`,`order`.updated_at from `order` INNER JOIN shop on shop.id = shop_id where `order`.updated_at > CURDATE()  and printed=0 and shop_id in (select shop_id from yun_print) and round((UNIX_TIMESTAMP(NOW())+8*3600-UNIX_TIMESTAMP(`order`.updated_at))/60) > 3 order by `order`.updated_at ";

	db.query(q,function(error,results,fields){
	var html = "<table><tr><td>店铺名</td><td>订单id</td><td>配送信息</td><td>更新时间</td></tr>";
	for(var i=0;i<results.length;i++){
	  var order = results[i];
	  var date = order.updated_at.getFullYear()+"-"+(order.updated_at.getMonth()+1)+"-"+order.updated_at.getDate();
	  var time = order.updated_at.getHours()+":"+order.updated_at.getMinutes()+":"+order.updated_at.getSeconds();

	  html+="<tr><td>"+results[i].name +"</td><td>"+results[i].id +"</td><td>"+results[i].contact +"</td><td>"+ date+' '+time +"</td></tr>";
	}
	html+="</table>";
	console.log(html);
	res.send(html);
	// db.end();

} )
})



var server = app.listen(8899, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})

