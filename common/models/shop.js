'use strict';
var app = require('../../server/server');
var loopback = require('../../node_modules/loopback/lib/loopback');

module.exports = function(Shop) {

	Shop.setDistance=function(point){
		var dist;
		var from = new loopback.GeoPoint([0,0]); //shop coordinates
		var to = new loopback.GeoPoint(point);	//given coordinates
		console.log("to  "+point);
		this.find({},function(error,list){
			if(error)
				throw error;
			else{
				list.forEach(function(elem){
					app.models.Shop.findById(elem.id,function(err,inst){
						if(err) throw err;
						else{
							from = new loopback.GeoPoint([inst.lat,inst.lng]);
							console.log("from  "+inst.lat+","+inst.lng);
							dist = from.distanceTo(to);
							console.log(dist);
							inst.updateAttribute("distance",dist,function(er,newElem){
								if(er){
									console.log("can not update attribute");
									throw er;
								}
							});
						}	
					});
				});
			}
		});
	}

};
