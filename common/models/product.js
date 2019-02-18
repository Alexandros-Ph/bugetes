'use strict';

module.exports = function(Product) {
	// Operation hook to handle the date info
	// Update createdAt on model creation
	Product.observe('before save', function filterProperties(ctx, next) {
		if (ctx.isNewInstance) {
			ctx.instance.createdAt = new Date()
		}next()
	})

	Product.fetch = function(start, count, status, sort, cb){
		var self= this;
		if(start==null){
			start=0;
		}
		if(count==null){
			count=10;
		}
		if(status==null){
			status="ACTIVE";
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
				default://throw error
					break;
			}
		}
		self.find({limit: count, skip: start, order: sort
			//TODO: need to add status filter and error handling
		},function(err,productInstances){
			self.count(function(err,total){
				//TODO: need to add status filter and error handling
				cb(null, start, count, total, productInstances);
			});
		});
	}

	Product.remoteMethod('fetch',{
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
};
