'use strict';
var g = require('../../node_modules/loopback/lib/globalize');

module.exports = function(Product) {
	// Operation hook to handle the date info
	// Update createdAt on model creation
	Product.observe('before save', function filterProperties(ctx, next) {
		if (ctx.isNewInstance) {
			ctx.instance.createdAt = new Date()
		}next()
	})

	Product.custom_find = function(start, count, status, sort, cb){
		var self= this;
		var query_withdrawn;
		var err;
		if(start==null){
			start=0;
		}
		if(count==null){
			count=10;
		}
		if(status==null||status=="ACTIVE"){
			query_withdrawn=false;
		}
		else if(status=="WITHDRAWN"){
			query_withdrawn=true;
		}
		else if(status!="ALL"){
			err = new Error(g.f('wrong argument value'));
			err.statusCode = 400;
			err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
			cb(err);
		}

		if(sort == "id|DESC" || sort == null) sort="id DESC";
		else{
			switch (sort) {
				case "name|DESC":
					sort="title DESC";
					break;
				case "name|ASC":
					sort="title ASC";
					break;
				case "id|ASC":
					sort="id ASC";
					break;
				default:
					err = new Error(g.f('wrong argument value'));
					err.statusCode = 400;
					err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
					cb(err);
					break;
			}
		}
		if(status!="ALL"){
			self.find({where:{withdrawn:query_withdrawn},limit: count, skip: start, order: sort
			},function(err,productInstances){
				self.count(function(err,total){
					cb(null, start, count, total, productInstances);
				});
			});
		}
		else{
			self.find({limit: count, skip: start, order: sort
			},function(err,productInstances){
				self.count(function(err,total){
					productInstances.forEach(function(element){
						element.tags=element.tags.split(",");
					});
					cb(null, start, count, total, productInstances);
				});
			});
		}
	}

	Product.custom_create=function(data,cb){
		var self=this;
		data.tags=data.tags.join(",");
		self.create(data,function(err,inst){
			if(err){
				err = new Error(g.f('wrong argument value'));
				err.statusCode = 400;
				err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
				cb(err);
			}
			else{
				cb(null,inst);
			}
		});
	}

	Product.remoteMethod('custom_find',{
		accepts: [
			{arg: 'start', type: 'number', http: {source: 'query'}},
			{arg: 'count', type: 'number', http: {source: 'query'}},
			{arg: 'status', type: 'string', http: {source: 'query'}},
			{arg: 'sort', type: 'string', http: {source: 'query'}}
		],
		returns: [
			{arg: 'start', type: 'number'},
			{arg: 'count', type: 'number'},
			{arg: 'total', type: 'number'},
			{arg: 'products', type:'array'}
		],
		http: {path: '/', verb: 'get'}
	});

	Product.remoteMethod('custom_create',{
		accepts: [
			{arg: 'start', type: 'number', http: {source: 'query'}},
			{arg: 'count', type: 'number', http: {source: 'query'}},
			{arg: 'status', type: 'string', http: {source: 'query'}},
			{arg: 'sort', type: 'string', http: {source: 'query'}}
		],
		returns:{arg: 'product'}
	});
};
