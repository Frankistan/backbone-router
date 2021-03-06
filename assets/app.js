(function() {
	"use strict";

	var App = window.App = new Backbone.Marionette.Application();

	App.Router = Backbone.Router;

	App.Router.map(function() {
		// Catching client-side 404s (optional)
		this.route("404", {
			"action": function(path) {
				console.log("Controller action: 404");
				$(".content").html("<h1>404 ! =(</h1>");
			}
		});

		// Catching client-side 403s (optional)
		this.route("403", {
			"action": function(path) {
				console.log("Controller action: 403");
				$(".content").html("<h1>403 ! =(</h1>");
			}
		});
		
		// Declaring a home route
		this.route("home", {
			"path": "/",
			"before": [
				{ "name": "core", "cache": true },
				{ "name": "module", "cache": true }
			],
			"action": function() {
				console.log("Controller action: home");
				$(".content").html("Current page: Home");
			},
			"close": function() {
				if (App.user) {
					return confirm("Do you really want to quit the page?");
				}

				return true;
			}
		});

		// Declaring a users list route
		this.route("users_list", {
			"path": "/users",
			"before": [
				"home",	// Executing the home route as a trigger
				"other_module"
			],
			"action": function() {
				console.log("Controller action: users_list");
				$(".content").html("Current page: Users");
			}
		});

		// Multiple controller for a same route
		this.route("users_list_extension", {
			"path": "/users",
			"action": function() {
				console.log("Controller action: users_list_extension");
			}
		});

		// Declaring an alias to the users list route
		this.route("users_alias", {
			"path": "/some-alias",
			"action": "users_list"
		});

		// Declaring a secured route with a parameter
		this.route("user_show", {
			"path": "/users/:id",
			"authed": true,
			"action": function(userId) {
				console.log("Controller action: user_show");
				$(".content").html("Current page: User #" + userId);
			}
		});

		// Declaring a login route
		this.route("login", {
			"path": "/login",
			"authed": false,
			"action": function() {
				console.log("Controller action: login");

				App.user = prompt("Enter your name :", "JS Ninja");

				if (App.user !== null) {
					window.location.href = "/?user=" + App.user;
				}
			}
		});

		// Declaring a logout route
		this.route("logout", {
			"path": "/logout",
			"authed": true,
			"action": function() {
				console.log("Controller action: logout");

				window.location.href = "/?logout=true";
			}
		});

	});


	App.MenuView = Backbone.Marionette.ItemView.extend({
		"events": {
			"click a": "navigate"
		},

		"initialize": function() {
			console.log("[App.MenuView.initialize] init the menu view");
		},

		"navigate": function(e) {
			e.preventDefault();
			
			var $el = $(e.target);

			var route = $el.attr("data-route"),
				id = $el.attr("data-id");

			if (id !== undefined) {
				App.Router.go(route, [id]);
			} else {
				App.Router.go(route);
			}
		},

		"render": function() {}
	});


	/**
	 * Register to some app events that will be triggered by the router
	 * Typically where you would orchestrate the render of the application
	 */
	var registerEvents = function() {
		App.vent.on("core", function() {
			console.log("Got trigger: core");
		});

		App.vent.on("module", function() {
			console.log("Got trigger: module");
		});

		App.vent.on("other_module", function() {
			console.log("Got trigger: other module");
		});
	};


	$(function() {
		registerEvents();

		if (window.user) {
			App.user = window.user;
		}

		App.start();

		App.Router.start(App, {
			"debug": true,
			"authed": window.logged_in,
			"redirectToLogin": true,
			"silent": true,
			// "root": "/admin",
			// "pushState": false
		});

		var menu = new App.MenuView({
			"el": $("header nav")
		});


		App.Router.route("test_route", {
			"path": "/test",
			"action": function() {
				console.log("meh \\o/");
			}
		});
	});
})();