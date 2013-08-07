var fs = require('fs');
var path = require('path');

module.exports = {


	reload: function(req, res, next) {

		var router = sails.router;
		var routes = _.cloneDeep(req.body);
		console.log(req.body);
		_.each(routes, function(config, path) {
			console.log(path, config);
			if (config === "") {
				delete router.staticRoutes[path];
			} else {
				router.staticRoutes[path] = config;
			}
		});

		router.bind('reset',{'middleware':'reset'},'get');
		// Flush the routes
		router.flush();
		res.send(200);

		// Update the routes.js file
		var routesFile = fs.readFileSync(path.resolve(__dirname, "../../config/routes.js"), 'utf8');
		var newRoutesFile = routesFile.replace(/^([\s\S]*)\/\* START_BUILDER_ROUTES \*\/([\s\S]*)\/\* END_BUILDER_ROUTES \*\/([\s\S]*)$/,"$1/* START_BUILDER_ROUTES */\n_.extend(module.exports.routes, "+JSON.stringify(req.body)+");\n/* END_BUILDER_ROUTES */$3");
		fs.writeFileSync(path.resolve(__dirname, "../../config/routes.js"), newRoutesFile);

	}

};