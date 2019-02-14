// needs front end files:
// provider_home with
// 	link to product_create where new product can be created
// 	view of all active products and
// 		links to product_edit for each one of them


module.exports = function(app) {

	var Token = app.models.AccessToken;
	var Provider = app.models.User;
	var Product = app.models.Product;
	const moment = require('moment');
	const date = moment();
	var url = require('url');

	// app.get('/add_product', function(req, res) {
	//     res.render('product_create' ,{
	//        accessToken: req.accessToken
	//      });
	// });

	// create a product
	app.post('/add_prod', function(req, res){
		Token.find({where :{ id: req.accessToken}
		}, function(token_err, tokenInstance){
			if(token_err){
				res.render('response', { //render view named 'response.ejs'
					title: 'Product creation failed',
					content: token_err.message,
					redirectTo: '/add_prod',
					redirectToLinkText: 'Try again'
				});
				return;
			}
			Provider.find({where :{ userId: tokenInstance.userId}
			}, function(find_err,providerInstance){
				if (find_err) {
					res.render('response', { //render view named 'response.ejs'
						title: 'Product creation failed',
						content: find_err.message,
						redirectTo: '/add_product',
						redirectToLinkText: 'Try again'
					});
					return;
				}
				Product.create({
					title: req.body.title,
					description: req.body.description,
					amount: req.body.amount,
					expiredAfter: req.body.expiredAfter,
					userId: providerInstance.userId
				}, function(err, productInstance) {
					if (err) {
						res.render('response', { //render view named 'response.ejs'
							title: 'Product creation failed',
							content: err.message,
							redirectTo: '/add_product',
							redirectToLinkText: 'Try again'
						});
						return;
					}
					console.log(productInstance);
					res.render('prov_home',{accessToken: req.accessToken});
				});
			});
		});
	});

	app.get('/product_edit', function(req, res) {
		res.render('product_edit' ,{
			productId: req.id
		});
	});

	app.post('/product_edit', function(req, res){
		Product.findById(req.productId, function(find_err, productInstance){
			if (find_err) {
				res.render('response', { //render view named 'response.ejs'
					title: 'Product edit failed',
					content: find_err.message,
					redirectTo: '/product_edit',
					redirectToLinkText: 'Try again'
				});
				return;
			}
			productInstance.updateAttribute("amount", req.body.amount,
			function(update_err,updated){
				if (update_err) {
					res.render('response', { //render view named 'response.ejs'
						title: 'Product edit failed',
						content: update_err.message,
						redirectTo: '/product_edit',
						redirectToLinkText: 'Try again'
					});
					return;
				}
			});
			console.log(productInstance);
			res.render('provider_home');
		});
	});
}
