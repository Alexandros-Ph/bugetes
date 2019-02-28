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

	Product.custom_delete=function(id,cb){
		var err = new Error('not found');
		err.statusCode = 404;
		err.code = 'MODEL_NOT_FOUND';
		err.status = 404;
		this.findById(id,function(find_err,inst){
			if(inst){
				inst.deleteById(id,function(del_err){
					if(err){return cb(err);}
					else{cb(null,{"message":"OK"});}
				});
			}
			else{
				return cb(err);
			}
		});
	}

	Product.custom_patch=function(id,name, description,category,tags,withdrawn,cb){
		var self= this;
		var err = new Error('too many arguments');
		err.statusCode = 400;
		err.code = 'TOO_MANY_ARGS';
		var flag=null;
		var attr=null;
		if(name!=null){
			flag="name";
			attr=name;
		}
		if(description!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="description";
				attr=description;
			}
		}
		if(category!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="category";
				attr=category;
			}
		}
		if(tags!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="tags";
				attr=tags;
			}
		}
		if(withdrawn!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="withdrawn";
				attr=withdrawn;
			}
		}
		if(flag!=null){
			//var where_obj={};
			//where_obj.id=id;
			//self.find({where:where_obj},function(find_err,inst_list){
			self.find({where:{"id":id}},function(find_err,inst_list){
				inst_list[0].updateAttribute(flag, attr, function(up_err,up_inst){
					if(up_err){
						cb(up_err);
					}
					else{
						cb(null,up_inst);
					}
				});
			});
		}
		else{
			var err = new Error(g.f('no valid argument present'));
			err.statusCode = 400;
			err.code = 'NO_VALID_ARG';
			cb(err);
		}
	}

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
			cb(err);
			//console.log("callback does not return");
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
					cb(null, start, count, total, productInstances);
				});
			});
		}
	}

	Product.remoteMethod('custom_delete',{
		accepts:{arg: 'id', type: 'number', http: {source: 'path'}},
		returns:{root:true},
		http: [{path: '/:id', verb: 'delete'}]
	});
	Product.remoteMethod('custom_patch',{
		accepts: [
			{arg: 'id', type: 'number', http: {source: 'path'}},
			{arg: 'name', type: 'string'},
			{arg: 'description', type: 'string'},
			{arg: 'category', type: 'string'},
			{arg: 'tags', type: 'array'},
			{arg: 'withdrawn', type: 'boolean'}
		],
		returns: {root:true, type:'object'},
		http: [{path: '/:id', verb: 'patch'}]
	});

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
};
