// needs front end files:
// provider_home with
// 	link to product_create where new product can be created
// 	view of all active products and
// 		links to product_edit for each one of them


module.exports = function(app) {

  var Provider = app.models.User;
  var Product = app.models.Product;
  const moment = require('moment');
  const date = moment();
  var url = require('url');

   app.get('/product_create', function(req, res) {
       res.render('product_create' ,{
          accessToken: req.accessToken
        });
   });

   // create a product
   app.post('/product_create', function(req, res){
     Provider.find({where :{ userId: req.accessToken.userId}} , function(err,providerInstance){
       Product.create({
         createdAt: moment.utc(date).format('YYYY-MM-DD HH:MM:SS'),
         description: req.body.description,
         amount: req.body.amount,
         expiredAfter: req.body.expiredAfter,
         userId: providerInstance.userId
       }, function(err, productInstance) {
         if (err) {
           res.render('response', { //render view named 'response.ejs'
             title: 'Product creation failed',
             content: err.message,
             redirectTo: '/product_create',
             redirectToLinkText: 'Try again'
           });
           return;
         }
         console.log(productInstance);
         res.render('provider_home');
       });
    });
   });

   app.get('/product_edit', function(req, res) {
       res.render('product_edit' ,{
          productId: req.id
        });
   });

   app.post('/product_edit', function(req, res){
     Product.find({where :{ productId: req.productId}
       }, function(err, productInstance) {
         productInstance.amount: req.body.amount
         if (err) {
           res.render('response', { //render view named 'response.ejs'
             title: 'Product edit failed',
             content: err.message,
             redirectTo: '/product_edit',
             redirectToLinkText: 'Try again'
           });
           return;
         }
         console.log(productInstance);
         res.render('provider_home');
       });
   });
