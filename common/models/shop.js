'use strict';
var app = require('../../server/server');

module.exports = function(Shop) {


	Shop.custom_delete=function(id, options, cb){
		var self=this;
		var User = app.models.User;
		var Role = app.models.Role;
		var RoleMapping = app.models.RoleMapping;
		var Token = app.models.AccessToken;


		var err = new Error('not found');
		err.statusCode = 404;
		err.code = 'MODEL_NOT_FOUND';
		err.status = 404;

		const token_inst = options && options.accessToken;

		if(token_inst){
			RoleMapping.findOne({where:{"principalId":token_inst.userId}
			},function(find_err,map_inst){
				if(find_err)
					throw find_err;
				if(map_inst){
					Role.findById(map_inst.roleId
					,function(find_err,role_inst){
						if(find_err)
							throw find_err;
						if(role_inst){
							var role_name=role_inst.name;
							if(role_name=="admin"||role_name=="dev"){
								self.findById(id,function(find_err,inst){
									if(find_err)
										throw find_err;
									if(inst){
										self.deleteById(id
										,function(del_err){
											if(del_err) throw del_err;
											else{
												return cb(null
												,{"message":"OK"});
											}
										});
									}
									else{
										return cb(err);
									}
								});
							}
							else{
								self.findById(id,function(find_err,inst){
									if(find_err)
										throw find_err;
									if(inst){
										inst.updateAttribute("withdrawn",true,function(up_err){
											if(up_err)
												throw up_err;
											else
												return cb(null,{"message":"OK"});
										});
									}
									else{
										return cb(err);
									}
								});
							}
						}
						else{
							return cb(err);
						}
					});
				}
				else{
					return cb(err);
				}
			});
		}
		else{
			return cb(err);
		}
	}

	Shop.custom_patch=function(id, name, address, lng,lat, tags, withdrawn, cb){
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
		if(address!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="address";
				attr=address;
			}
		}
		if(lng!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="lng";
				attr=lng;
			}
		}
		if(lat!=null){
			if(flag!=null){
				return cb(err);
			}
			else{
				flag="lat";
				attr=lat;
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
			self.findById(id,function(find_err,inst){
				if(inst){
					inst.updateAttribute(flag, attr, function(up_err,up_inst){
						if(up_err){
							cb(up_err);
						}
						else{
							cb(null,up_inst);
						}
					});
				}
				else{
					var err = new Error('too many arguments');
					err.statusCode = 404;
					err.code = 'MODEL_NOT_FOUND';
					return cb(err);
				}
			});
		}
		else{
			var err = new Error('no valid argument present');
			err.statusCode = 400;
			err.code = 'NO_VALID_ARG';
			cb(err);
		}
	}

	Shop.custom_find = function(start, count, status, sort, cb){
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
			err = new Error('wrong argument value');
			err.statusCode = 400;
			return cb(err);
			//console.log("callback does not return");
		}

		if(sort == "id|DESC" || sort == null) sort="id DESC";
		else{
			switch (sort) {
				case "name|DESC":
					sort="name DESC";
					break;
				case "name|ASC":
					sort="name ASC";
					break;
				case "id|ASC":
					sort="id ASC";
					break;
				default:
					err = new Error('wrong argument value');
					err.statusCode = 400;
					err.code = 'GET_FAILED_WRONG_ARGUMENT_VALUE';
					return cb(err);
					break;
			}
		}
		if(status!="ALL"){
			self.find({where:{withdrawn:query_withdrawn},limit: count, skip: start, order: sort
			},function(err,shopInstances){
				console.log(start,count,shopInstances);
				self.count({withdrawn:query_withdrawn},function(err,total){
					cb(null, start, count, total, shopInstances);
				});
			});
		}
		else{
			self.find({limit: count, skip: start, order: sort
			},function(err,shopInstances){
				console.log(start,count,shopInstances);
				self.count(function(err,total){
					cb(null, start, count, total, shopInstances);
				});
			});
		}
	}

	Shop.remoteMethod('custom_delete',{
		accepts:[
			{arg: 'id', type: 'number', http: {source: 'path'}},
			// {arg: 'req', type: 'object', http: {source: 'req'}}
			{"arg": "options", "type": "object", "http": "optionsFromRequest"}

		],
		returns:{root:true},
		http: [{path: '/:id', verb: 'delete'}]
	});
	Shop.remoteMethod('custom_patch',{
		accepts: [
			{arg: 'id', type: 'number', http: {source: 'path'}},
			{arg: 'name', type: 'string'},
			{arg: 'address', type: 'string'},
			{arg: 'lng', type: 'number'},
			{arg: 'lat', type: 'number'},
			{arg: 'tags', type: 'array'},
			{arg: 'withdrawn', type: 'boolean'}
		],
		returns: {root:true, type:'object'},
		http: [{path: '/:id', verb: 'patch'}]
	});

	Shop.remoteMethod('custom_find',{
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
			{arg: 'shops', type:'array'}
		],
		http: {path: '/', verb: 'get'}
	});
};
