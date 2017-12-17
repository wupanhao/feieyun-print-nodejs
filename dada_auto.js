var mysql  = require('mysql');

var config = require('./config');

var axios = require('axios');

var dw = mysql.createConnection(config.mysql);
dw.connect();

function use_dada(id){
	axios.post(config.api_base_url+'/courier/order/add',{order_id:id}).then((res) => {
		console.log(id,res.data)
	}).catch(console.log);
}

function check_and_use(id){

	// var id = 25983;
	var q = 'SELECT * from `order` WHERE id='+id;
	axios.post(config.api_base_url+'/courier/order/query',{order_id:id}).then((res) => {
		console.log(res.data)
		if(res.data && res.data.code == 2005){
			// 发达达
			console.log(id,'use dada')
			use_dada(id)
		}
		else if(res.data && res.data.code != 2005){
		q = 'update `order` set dada=1 where id='+id;
		dw.query(q, function (error, results){
	  	console.log(results);
	  	console.log('update ',id)
	  	if (error) 
	  		console.log(error);
	});
		}
	}).catch(console.log);

}

function query(){
	var q = 'SELECT * from `order` WHERE updated_at > CURDATE() and status > 10 and shop_id!=27 and dada=-1';
	// var q = 'SELECT * from `order` WHERE updated_at > CURDATE() and status > 10 and shop_id=27 and dada=-1 limit 1';
	  dw.query(q, function (error, results, fields){
	  	if(error)
	  		console.log(error)
	  	console.log(results);
	  	if(results && results.length > 0)
	  		results.forEach((item) => {
	  			check_and_use(item.id)
	  		})
	  })

}

// test(28622);

dw.query('select * from platform_profile',(error,results,fields)=>{
	if(results && results[0]){
//		console.log(results,results[0].dada_auto.toJSON().data[0])
		if( results[0].dada_auto.toJSON().data[0]==1){
		console.log('dada in use');
		query()
	}
		else
			console.log('dada not use');
	}
	
})


setTimeout(function(){
	dw.end();
},20000);

