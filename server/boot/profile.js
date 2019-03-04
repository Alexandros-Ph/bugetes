module.exports = function(app)
{
app.get('/profile',function(req, res) {
   res.render('profile');
 });
}
