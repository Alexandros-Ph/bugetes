module.exports = function(app) {

	var Token = app.models.MyToken;
	var Provider = app.models.MyUser;
	var Product = app.models.Product;
	var Price = app.models.Price;

	app.get('/add', function(req, res) {
    if (!req.accessToken) return res.sendStatus(401); //return 401:unauthorized if accessToken is not present
    res.render('add_product', {
      accessToken: req.accessToken.id
    });
   });

	// create a product
	app.post('/add', function(req, res){
		Token.findById(req.body.token, function(token_err, tokenInstance){
			if(token_err){
				res.render('response', { 								//render view named 'response.ejs'
					title: 'Token error on product creation',
					content: token_err.message,
					redirectTo: '/add',
					redirectToLinkText: 'Try again'
				});
				return;
			}
			Provider.findById(tokenInstance.userId, function(find_err, providerInstance){			// find provider through token
				if (find_err) {
					res.render('response', { 							//render view named 'response.ejs'
						title: 'Product creation failed',
						content: find_err.message,
						redirectTo: '/add',
						redirectToLinkText: 'Try again'
					});
					return;
				}
				Product.findOrCreate({									// check if product exists and if it doesn't, create it
					where: {name: req.body.title}
				}, {
					name: req.body.title,
					description: req.body.description,
					category: req.body.category,
					tags: (req.body.tags+'').split(','),
					//userId: providerInstance.id
				}, function(err, productInstance) {
					if (err) {
						res.render('response', { 						//render view named 'response.ejs'
							title: 'Product creation failed',
							content: err.message,
							redirectTo: '/add',
							redirectToLinkText: 'Try again'
						});
						return;
					}
					console.log(productInstance);
					Price.create({										    // create price instance
						price: req.body.price,
						amount: req.body.amount,
						productId: productInstance.id,
						userId: providerInstance.id
					}, function(pr_error, priceInstance) {
						if (pr_error) {
							res.render('response', { 				  //render view named 'response.ejs'
								title: 'Price creation failed',
								content: err.message,
								redirectTo: '/add',
								redirectToLinkText: 'Try again'
							});
							return;
						}
					console.log(priceInstance);
					res.render('response', { 							//render view named 'response.ejs'
						title: 'Product created!',
						content: "Your new product should appear in your active list",
						redirectTo: '/prov_home?access_token='+req.body.token,					// redirect to provider home page
						redirectToLinkText: 'Done'
					});

				});
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
