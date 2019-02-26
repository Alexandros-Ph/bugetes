'use strict';

module.exports = function(Price) {
	// Operation hook to handle the date info
	// Update createdAt on model creation
/*	Price.observe('before save', function filterProperties(ctx, next) {
		if (ctx.isNewInstance) {
			ctx.instance.createdAt = new Date()
		}next()
	})

	Price.fetch = function(start, count, status, sort, cb){
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
		},function(err,priceInstances){
			self.count(function(err,total){
				//TODO: need to add status filter and error handling
				cb(null, start, count, total, priceInstances);
			});
		});
	}

	Price.remoteMethod('fetch',{
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
			{arg: 'prices', type:'array'}
		],
		http: {path: '/', verb: 'get'}
	}); */
};
