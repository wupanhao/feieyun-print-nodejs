var mysql  = require('mysql');

var config = require('./config');

var printer = require('./feieyun-api');
		//"<BR>"为换行,"<CUT>"为切刀指令(主动切纸,仅限切刀打印机使用才有效果)
		//"<LOGO>"为打印LOGO指令(前提是预先在机器内置LOGO图片),"<PLUGIN>"为钱箱或者外置音响指令
		//成对标签：
		//"<CB></CB>"为居中放大一倍,"<B></B>"为放大一倍,"<C></C>"为居中,<L></L>字体变高一倍
		//<W></W>字体变宽一倍,"<QR></QR>"为二维码,"<BOLD></BOLD>"为字体加粗,"<RIGHT></RIGHT>"为右对齐
	    //拼凑订单内容时可参考如下格式

dw = mysql.createConnection(config.mysql);
dw.connect();
// console.log(config);

function orderFormat(order,order_items){
	var order_details  ="<L>" + printer.fill_with("名称",16)+printer.fill_with("数量",5)+printer.fill_with("单价",5)  +"</L><BR>";

	var contact = {
		name:order.name,
		mobile:order.mobile,
		address:order.address
	}

	  for(var i = 0;i < order_items.length ; i++){
	  	var product = order_items[i];
	  	console.log(i);
	  	console.log(product);
	  	order_details +="<L>" +  printer.fill_with("+"+product.name,16)+printer.fill_with(order_items[i].amount,5)+printer.fill_with(order_items[i].unitPrice,5)+"</L><BR>"
	  }
	  // console.log(error);
	  // console.log(results);
	  var updated_at = order.updatedAt
	  var date = updated_at.getFullYear()+"-"+(updated_at.getMonth()+1)+"-"+updated_at.getDate();
	  var time = updated_at.getHours()+":"+updated_at.getMinutes()+":"+updated_at.getSeconds();
	  // var merged_order_ids = JSON.parse(order.merged_order_ids);
	  // var price_detail = JSON.parse(order.price_detail);
	  // var contact = JSON.parse(order.contact);
	  // var method = "[直接配送]";
	  // if(merged_order_ids)
	  	// method = "[合单1/"+merged_order_ids.length+"]";
	  var printData = "<BR><BR><BR><C><L>" + date + ' ' + time + "</L><C><BR>" ;
	  printData += "<CB>食秘江湖</CB>";
	  printData += "<C><L>订单:["+order.orderId+"]  " + "</L></C><BR>";
	  if(order.comment)
	  	printData += "<L>备注："+ order.comment  +"</L><BR>";
	  printData += "--------------------------------<BR><BR>";
	  printData += order_details;//       
	  // printData += "<L>"+"配送费:"+price_detail.delivery_price+"</L>"+"<BR>";
	  printData += "<L>"+"总  计:"+order.totalPrice+"</L>"+"<BR>";
	  // printData += "<L>"+"优  惠:"+ (order.actual_price - order.total_price)+"</L>"+"<BR>";
	  // printData += "<L>"+"实  付:"+order.total_price+"</L>"+"<BR>";
	  printData += "<BR><BR><L>"+"配送详情"+"</L>"+"<BR>";
	  printData += "<L>"+"姓名:"+contact.name+"</L>"+"<BR>";
	  printData += "<L>"+"电话:"+contact.mobile+"</L>"+"<BR>";
	  printData += "<L>"+"地址:"+contact.address+"</L>"+"<BR><BR><BR><CUT>";
	  // console.log(printData);
	  // printData = "test<BR>"
	  return printData;
}

function check(response,id){
	console.log(response);
	if(response.ret == 0){
  	var q = 'UPDATE  `orders` SET printed=1,status=25 WHERE id='+id;
	console.log(q);
  	dw.query(q,function(error,results,fields){
  		console.log(results);
  		if(error)
  			console.log(error);
  	});
  }
}


function yunPrint(printer_id,id,amount){
	if(!id){
		console.log('id incorrect!!');
		return ;
	}
	var q = 'SELECT * from `orders` INNER JOIN `order_contact` on orders.id=order_contact.orderId WHERE orders.id = ' + id;

	  dw.query(q, function (error, results, fields) {
	  if (error) 
	  	console.log(error);

	  console.log(results[0]);
	  var order = results[0];

	  var q = 'SELECT * from `order_item` WHERE orderId='+id;
	  // console.log(q);
	  dw.query(q, function (error, results, fields){

		  var order_items = results;
		  var printData = orderFormat(order,order_items);
		  console.log(printData);
		  printer.print(printer_id,printData,amount,check,order.orderId);

			});
	})
	// dw.end();

}
// printer.print(,'<QR>http://www.easyfind.com</QR>');
// yunPrint('916506380',77);

function print_by_shop(shop){
	// console.log(shop);
	var q = 'SELECT * from `orders` WHERE updatedAt > CURDATE() and shopId='+shop.shop_id +' and status = 20 and printed=0 ';
	// console.log(q);
	// console.log('print_by_shop amount'+shop.amount)
	// var amount = shop.amount;
	dw.query(q,function(error,response,fields,id=shop.shop_id,amount=shop.amount){
		console.log(response);

		response.length >0 && response.forEach(function(order){
		// console.log('print_by_shop '+ id + ' amount'+amount);
		yunPrint(shop.printer_sn,order.id,shop.amount);
	})
})
}

// setInterval(function(){
	var q = 'SELECT * from `yun_print` WHERE amount>0';
	dw.query(q,function(error,response,fields){
		error && console.log(error)
		console.log(response);
		response && response.length && response.forEach(print_by_shop)
	})
// },5000);

// yunPrint('916506380',24910);

setTimeout(function(){
 dw.end();
},15000);
