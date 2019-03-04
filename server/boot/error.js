/*module.exports = function(app) {

	var remotes = app.remotes();

	remotes.options.rest = remotes.options.rest || {};
	remotes.options.rest.handleErrors = false;
	app.middleware('final', FinalErrorHandler);

	function FinalErrorHandler(err, req, res, next) {
		if (err) {
			if (err.statusCode == 422) {
				res.status(400).send({
					statusCode: 400,
					data: {},
					error: {
						statusCode: 400,
						name: 'Bad Request',
						message: err.message,
					},
				}).end();
			}
			else{
				res.status(err.statusCode).send(err).end();
			}
		}
		next();
	}
};*/
