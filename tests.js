var auth = FlowRouter.Auth;

Tinytest.addAsync('newController - global', function (test, next) {
	var route = '/' + Random.id(),
	passed = 0;

	auth.newController(function () {
		passed ++;
		return true;
	});

	FlowRouter.route(route, {
		action: function () {}
	});

	FlowRouter.go(route);

	setTimeout(function () {
		test.equal(passed, 1);
		next();
	}, 100);
});

Tinytest.addAsync('newController - in one route', function (test, next) {
	var route = '/' + Random.id(),
	passed = 0;

	auth.newController(function () {
		passed ++;
		return true;
	}, route);

	FlowRouter.route(route, {
		action: function () {}
	});

	FlowRouter.go(route);

	setTimeout(function () {
		test.equal(passed, 1);
		next();
	}, 100);
});

Tinytest.addAsync('newController - only', function (test, next) {
	var route = '/' + Random.id(),
	passed = 0;

	auth.newController(function () {
		passed ++;
		return true;
	}, {only: route});

	FlowRouter.route(route, {
		action: function () {}
	});

	FlowRouter.go(route);

	setTimeout(function () {
		test.equal(passed, 1);
		next();
	}, 100);
});

Tinytest.addAsync('newController - only - array', function (test, next) {
	var route1 = '/' + Random.id(),
	route2 = '/' + Random.id(),
	passed = 0;

	// the package does not stop the action of the routes
	// and the action goes before authentication
	auth.newController(function () {
		passed ++;
		return true;
	}, {only: [route1, route2]});

	FlowRouter.route(route1, {
		action: function () {
			FlowRouter.go(route2);
		},
		triggersExit: [function () {
			test.equal(passed, 0);
			passed ++;
		}]
	});
	
	FlowRouter.route(route2, {
		action: function () {},
		triggersEnter: [function () {
			test.equal(passed, 1);
			passed ++;
		}]
	});

	FlowRouter.go(route1);

	// 2 triggers + 1 controller, They are actually 2 controllers, but the second runs a little later
	setTimeout(function () {
		test.equal(passed, 3);
		next();
	}, 100);
});

Tinytest.addAsync('newController - except', function (test, next) {
	var route1 = '/' + Random.id(),
	route2 = '/' + Random.id(),
	passed = 0;

	auth.newController(function () {
		passed ++;
		return true;
	}, {except: route1});

	FlowRouter.route(route1, {
		action: function () {
			FlowRouter.go(route2);
		},
		triggersExit: [function () {
			// is 1 because the router doesn't start in route1
			test.equal(passed, 1);
			passed ++;
		}]
	});
	
	FlowRouter.route(route2, {
		action: function () {}
	});

	FlowRouter.go(route1);

	setTimeout(function () {
		test.equal(passed, 3);
		next();
	}, 100);
});

Tinytest.addAsync('newController - except - array', function (test, next) {
	var route1 = '/' + Random.id(),
	route2 = '/' + Random.id(),
	passed = 0;

	auth.newController(function () {
		passed ++;
		return true;
	}, {except: [route1, route2]});

	FlowRouter.route(route1, {
		action: function () {
			FlowRouter.go(route2);
		},
		triggersExit: [function () {
			// is 1 because the router doesn't start in route1
			test.equal(passed, 1);
			passed ++;
		}]
	});
	
	FlowRouter.route(route2, {
		action: function () {}
	});

	FlowRouter.go(route1);

	setTimeout(function () {
		test.equal(passed, 2);
		next();
	}, 100);
});

Tinytest.addAsync('newController - redirect', function (test, next) {
	var route1 = '/' + Random.id(),
	route2 = '/' + Random.id(),
	passed = 0;

	auth.newController(function () {
		passed ++;
		return false;
	}, {only: route1, redirect: route2});

	FlowRouter.route(route1, {
		action: function () {},
		triggersExit: [function () {
			test.equal(passed, 1);
			passed ++;
		}]
	});
	
	FlowRouter.route(route2, {
		action: function () {}
	});

	FlowRouter.go(route1);

	setTimeout(function () {
		test.equal(passed, 2);
		next();
	}, 100);
});

Tinytest.addAsync('newController - redirect to default', function (test, next) {
	var route1 = '/' + Random.id(),
	route2 = '/' + Random.id(),
	passed = 0;

	auth.redirect = route2;

	auth.newController(function () {
		passed ++;
		return false;
	}, {only: route1});

	FlowRouter.route(route1, {
		action: function () {},
		triggersExit: [function () {
			test.equal(passed, 1);
			passed ++;
		}]
	});
	
	FlowRouter.route(route2, {
		action: function () {}
	});

	FlowRouter.go(route1);

	setTimeout(function () {
		test.equal(passed, 2);
		next();
	}, 100);
});

Tinytest.addAsync('newControllers', function (test, next) {
	var route = '/' + Random.id(),
	passed = 0;

	auth.newControllers([
		{
			action: function () {
				passed ++;
				return true;
			},
			only: route
		},
		{
			action: function () {
				passed ++;
				return true;
			},
			only: [route]
		}
	])

	FlowRouter.route(route, {
		action: function () {}
	});

	FlowRouter.go(route);

	setTimeout(function () {
		test.equal(passed, 2);
		next();
	}, 100);
});

Tinytest.addAsync('callControllers', function (test, next) {
	var route = '/' + Random.id(),
	passed = 0;

	var controller = {
		action: function () {
			passed ++;
			return true;
		},
		only: route
	}

	auth.newControllers([controller, controller, controller, controller, controller]);

	auth.callControllers(route);

	setTimeout(function () {
		test.equal(passed, 5);
		next();
	}, 100);
});

function createControllers () {
	var route = '/' + Random.id(),
	controller = {
		action: function () {
			return true;
		},
		only: route
	};
	return {
		route: route,
		controllers: [controller, controller, controller, controller, controller]
	}
};

Tinytest.addAsync('permissionGranted', function (test, next) {
	var controllers = createControllers();

	auth.newControllers(controllers.controllers);
	auth.callControllers(controllers.route);

	setTimeout(function () {
		test.equal(auth.permissionGranted(), true);
		next();
	}, 100);
});

Tinytest.addAsync('permissionGranted - denied', function (test, next) {
	var controllers = createControllers(),
	notFound = '/' + Random.id(),
	passed = false;

	controllers.controllers[2].action = function () {
		return false;
	};
	controllers.controllers[2].redirect = notFound;

	FlowRouter.route(notFound, {
		triggersEnter: [function () {
			passed = !auth.permissionGranted();
		}]
	});

	auth.newControllers(controllers.controllers);
	auth.callControllers(controllers.route);

	setTimeout(function () {
		test.equal(passed, true);
		next();
	}, 100);
});