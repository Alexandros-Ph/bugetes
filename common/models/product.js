'use strict';

module.exports = function(Product) {
	// Operation hook to handle the date info
	// Update createdAt on model creation
	Product.observe('before save', function filterProperties(ctx, next) {
		if (ctx.isNewInstance) {
			ctx.instance.createdAt = new Date()
		}next()
	})
};
