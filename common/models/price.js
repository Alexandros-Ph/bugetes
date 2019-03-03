'use strict';

var app = require('../../server/server');
var loopback = require('../../node_modules/loopback/lib/loopback');
var g = require('../../node_modules/loopback/lib/globalize');

module.exports = function(Price) {

	function date_diff_indays(dt1, dt2) {
		console.log("calculating difference....");
		return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
	}

	function updateDist(elem,dist) {
		return new Promise(function(resolve,reject){
			elem.updateAttribute("distance",dist,function(err,price){
				if(err) reject(err);
				resolve(price);
			});
		});
	}

	function setDistance(geoLat,geoLng){
		var from = new loopback.GeoPoint([0,0]); //shop coordinates
		var to = new loopback.GeoPoint([geoLat,geoLng]);
		var dist=0;
		var temp;
		console.log("to  "+to);
		return new Promise(function(resolve,reject){
			app.models.Price.find({include:[{relation:'shop',scope:{fields:['lat','lng']}}]},function(error,list){
				if(error)
					reject(error);
				else{
					list.forEach(function(elem){
						temp=elem.toJSON();
						from = new loopback.GeoPoint([temp.shop.lat,temp.shop.lng]);
						console.log("from  "+temp.shop.lat+","+temp.shop.lng);
						dist = from.distanceTo(to);
						console.log("distance = "+dist);
						// var update=updateDist(elem,dist);
						// update.then(function(res){
						// 	console.log("updated");
						// },function(err){
						// 	reject(err);
						// });
					});
					console.log("promise 2");
					resolve(list);
				}
			});
		});
	}

	// function setDistance(geoLat,geoLng) {
	// 	var from = new loopback.GeoPoint([0,0]); //shop coordinates
	// 	var to = new loopback.GeoPoint([geoLat,geoLng]);
	// 	var dist=0;
	// 	return new Promise(function(resolve,reject){
	// 		console.log("to  "+geoLat+","+geoLng);
	// 		var promise=beforeUpdate(to);
	// 		promise.then(function(list){
	// 			list.forEach(function(elem){
	// 				from = new loopback.GeoPoint([elem.shop.lat,elem.shop.lng]);
	// 				console.log("from  "+elem.shop.lat+","+elem.shop.lng);
	// 				dist = from.distanceTo(to);
	// 				console.log("distance = "+dist);
	// 				var promise=updateDist(dist,elem.id);
	// 				promise.then(function(res){
	// 					console.log("next shop");
	// 				},function(err){
	// 					reject(err);
	// 				});
	// 			});
	// 			console.log("promise 1");
	// 			resolve();
	// 		},function(error){
	// 			reject(error);
	// 		});
	// 	});
	// }
	//function to get list of new pries to return them for POST
	function findCreatedPrices(dateFrom,dateTo,productId,shopId){
		return new Promise(function(resolve,reject){
				app.models.Price.find({where:{and:[{"productId":productId},{"shopId":shopId},{or:[{"date":dateFrom},{"date":dateTo},{"date":{between:[dateFrom,dateTo]}}]}]}},function(error,list){
							if(error) reject(error);
							console.log("found "+list.length+" prices");
							resolve(list);
						});
		});
	}
	//function to make prices from POST request
	function createPrices(count,from,data) {
		var temp=new Date();
		console.log("in promise");
		temp.setUTCDate(from.getUTCDate());
		temp.setUTCMonth(from.getUTCMonth());
		temp.setUTCFullYear(from.getUTCFullYear());
		return new Promise(function(resolve,reject){
			for(var i=0;i<count;i++){
				data.date=temp;
				console.log("i = "+i);
				app.models.Price.create(data,function(error,instance){
					if(error){
						reject(error);
					}
				});
				temp.setDate(temp.getDate()+1);
			}
			resolve();
		});
	}
	//function to find prices for GET request with given filters
	function findPrice(obj,start,count,sortBy,shopOrder) {
		console.log("in promise");
		console.log(sortBy);
		return new Promise(function(resolve,reject){
			app.models.Price.find({where:obj,include:[{relation:'shop',scope:{fields:['tags','address','name']}},{relation:'product',scope:{fields:['tags','name']}}],limit: count, skip: start, order: sortBy},function(err,inst){
				if (err) reject(err);
				else{ 
					inst.forEach(function(el){
					});
					console.log("found"+inst.length+" results");
					resolve(inst);
				}
			});
		});
	}

	Price.custom_find = function(start,count,geoDist,geoLat,geoLng,dateFrom,dateTo,shops,products,tags,sort,cb){
		var err;
		var here={};
		var to={};
		var sortBy="";
		var shopOrder="";
		var geo=false;
		var shop;
		var product;
		var temp = {};
		var shopIds = [];
		var productIds = [];
		var final = [];
		var tempObj = [];
		var date = [];
		var where_obj = {};

		where_obj.and=[];
		if(!start) start=0;
		if(!count) count=20;
		if(!sort) sortBy="price ASC";
		else{
			if(sort=="dist|DESC")
				sortBy="distance DESC";
			else if(sort=="dist|ASC")
				sortBy="distance ASC";
			else if(sort=="price|DESC")
				sortBy="price DESC";
			else if(sort=="price|ASC")
				sortBy="price ASC";
			else if(sort=="date|DESC")
				sortBy="date DESC";
			else if(sort=="date|ASC")
				sortBy="date ASC";
			else{
				err = new Error(g.f('wrong argument value'));
				err.statusCode = 400;
				err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
				cb(err);
			}
		}
		if(err) console.log("not good.....cant recognise sorting");
		if(geoDist && geoLat && geoLng){ //case geoDist given,find shops within reagion
			console.log("you gave distance");
			// app.models.Shop.setDistance([geoLat,geoLng]);	//set distances in shops
			// where_obj.and.push({"distance": {between: [0,geoDist]}});
			var promise=setDistance(geoLat,geoLng);
			promise.then(function(res){
				console.log("returned!!!!!!!");
				console.log("promise 0");
				where_obj.and.push({"distance": {between: [0,geoDist]}});
			},function(err){
				throw err;
			});
		}
		else
			if(geoDist!=null || geoLat!=null || geoLng!=null){ //case of wrong input
				err = new Error(g.f('wrong argument value'));
				err.statusCode = 400;
				err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
				cb(err);
			}
		
		if(shops){
			where_obj.and.push({"shopId": {inq: shops}});
		}

		if(products){
			where_obj.and.push({"productId": {inq: products}});
		}
		
		if(dateFrom && dateTo){
			var From=new Date(dateFrom);
			var To=new Date(dateTo);
			if(From.getYear()==To.getYear() && From.getMonth()==To.getMonth() && From.getDay()==To.getDay()){
				From.setHours(0);
				From.setMinutes(0);
				From.setSeconds(0);
				To.setHours(23);
				To.setMinutes(59);
				To.setSeconds(59);
				date.push(From);
				date.push(To);
				where_obj.and.push({"date":{between: date}});
			}
			else{
				dateFrom.setHours(0);
				dateFrom.setMinutes(0);
				dateFrom.setSeconds(0);
				dateTo.setHours(23);
				dateTo.setMinutes(59);
				dateTo.setSeconds(59);
				date.push(dateFrom);
				date.push(dateTo);
				where_obj.and.push({"date": {between: date}});
			}	
		}
		else if(!dateFrom && !dateTo){
			dateFrom = new Date();
			dateTo = new Date();
			dateFrom.setHours(0);
			dateFrom.setMinutes(0);
			dateFrom.setSeconds(0);
			dateTo.setHours(23);
			dateTo.setMinutes(59);
			dateTo.setSeconds(59);
			date.push(dateFrom);
			date.push(dateTo);
			where_obj.and.push({"date":{between: date}});
		}
		else{
			console.log("wrong dates");
			err = new Error(g.f('wrong argument value'));
			err.statusCode = 400;
			err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
			cb(err);
		}

		var promise=findPrice(where_obj,start,count,sortBy,shopOrder);
		if(!err){
			promise.then(function(inst){
				inst.forEach(function(priceElem){
					var p=priceElem.toJSON();
					shop=false;
					product=false;
					if(tags){
						console.log(tags);
						if(p.shop.tags){
							p.shop.tags.forEach(function(shop_tag){
								if(tags.includes(shop_tag)){
									shop=true;
									console.log("found shop tag");
								}
							});
						}
						if(p.product.tags){
							p.product.tags.forEach(function(prod_tag){
								if(tags.includes(prod_tag)){
									console.log("found prod tag");
									product=true;
								}
							});
						}
					}
					else tempObj.push(p);
					if(product || shop)
						tempObj.push(p);
				});

				tempObj.forEach(function(priceElem){
					var temp={};
					temp.date=new Date();
					temp.price=priceElem.price;
					console.log(priceElem.date);
					temp.date.setUTCDate(priceElem.date.getUTCDate());
					temp.date.setUTCMonth(priceElem.date.getUTCMonth());
					temp.date.setUTCFullYear(priceElem.date.getUTCFullYear());
					temp.date.setHours(priceElem.date.getHours());
					temp.date.setMinutes(priceElem.date.getMinutes());
					temp.date.setSeconds(priceElem.date.getSeconds());
					temp.priceId=priceElem.id;
					temp.productName=priceElem.product.name;
					temp.productId=priceElem.productId;
					temp.productTags=priceElem.product.tags;
					temp.shopId=priceElem.shopId;
					temp.shopName=priceElem.shop.name;
					temp.shopTags=priceElem.shop.tags;
					temp.shopAddress=priceElem.shop.address;
					temp.shopDist=priceElem.distance;
					final.push(temp);
				});
				var total=final.length;
				cb(null,start,count,total,final);
			},function(err){
				err = new Error(g.f('wrong argument value'));
				err.statusCode = 400;
				err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
				cb(err);
			});
		}
	}


	Price.custom_create=function(price,dateFrom,dateTo,productId,shopId,cb){
		var err;
		var data={};
		var temp = new Date();
		var list;
		var count;

		if(!price || !dateTo || !dateFrom || !productId || !shopId){
			err = new Error(g.f('wrong argument value'));
			err.statusCode = 400;
			err.code = 'POST_FAILED_WRONG_ARGUMENT_VALUE';
			cb(err);
		}
		if(!err){
			app.models.Product.findById(productId,function(error,prod){
				if(error || !prod){
					err = new Error(g.f('wrong argument value'));
					err.statusCode = 400;
					err.code = 'POST_FAILED_WRONG_ARGUMENT_VALUE';
					cb(err);
				}
				else{
					app.models.Shop.findById(shopId,function(error,shop){
						if(error || !shop){
							err = new Error(g.f('wrong argument value'));
							err.statusCode = 400;
							err.code = 'POST_FAILED_WRONG_ARGUMENT_VALUE';
							cb(err);
						}
						else{
							data.price=price;
							data.productId=productId;
							data.shopId=shopId;
							data.date=new Date();
							var from=new Date(dateFrom);
							var to=new Date(dateTo);
							if(from>to) {
								err = new Error(g.f('wrong argument value'));
								err.statusCode = 400;
								err.code = 'POST_FAILED_WRONG_ARGUMENT_VALUE';
								cb(err);
							}
							else{
								count=date_diff_indays(from,to)+1;
								var promise=createPrices(count,from,data)
								promise.then(function(res){
									to.setDate(to.getDate()+1);
									var findPromise=findCreatedPrices(from,to,productId.shopIds);
									findPromise.then(function(list){
										cb(null,list);
									},function(err){
										err = new Error(g.f('wrong argument value'));
										err.statusCode = 400;
										err.code = 'POST_FAILED_WRONG_ARGUMENT_VALUE';
										cb(err);
									});
								},function(err){
									// console.log("wrong dates");
									err = new Error(g.f('wrong argument value'));
									err.statusCode = 400;
									err.code = 'POST_FAILED_WRONG_ARGUMENT_VALUE';
									cb(err);
								});
						}
						}
					});
				}
			});
		}
	}

	Price.remoteMethod('custom_find',{
		accepts:[
			{arg: 'start', type: 'number', http: {source: 'query'}},
			{arg: 'count', type: 'number', http: {source: 'query'}},
			{arg: 'geoDist', type: 'number', http: {source: 'query'}},
			{arg: 'geoLat', type: 'number', http: {source: 'query'}},
			{arg: 'geoLng', type: 'number', http: {source: 'query'}},
			{arg: 'dateFrom', type: 'date', http: {source: 'query'}},
			{arg: 'dateTo', type: 'date', http: {source: 'query'}},
			{arg: 'shops', type: 'any', http: {source: 'query'}},
			{arg: 'products', type: 'any', http: {source: 'query'}},
			{arg: 'tags', type: 'any', http: {source: 'query'}},
			{arg: 'sort', type: 'string', http: {source: 'query'}}
		],
		returns: [
			{arg: 'start', type: 'number'},
			{arg: 'count', type: 'number'},
			{arg: 'total', type: 'number'},
			{arg: 'prices', type:'array'}
		],
		http: {path: '/', verb: 'get'}
	})

	Price.remoteMethod('custom_create',{
		accepts:[
			{arg: 'price', type: 'number',http: {source: 'query'}},
			{arg: 'dateFrom', type: 'date', http: {source: 'query'}},
			{arg: 'dateTo', type: 'date', http: {source: 'query'}},
			{arg: 'productId', type: 'number', http: {source: 'query'}},
			{arg: 'shopId', type: 'number', http: {source: 'query'}}
		],
		returns: [
			{root:true,arg: 'prices', type:'array'}
		],
		http: {path: '/', verb: 'post'}
	})
};
