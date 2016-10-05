(function() {
'use strict';

	angular
		.module('serviceTracker', [])
		.provider('ConfirmClick', function () {
			var ask = window.confirm.bind(window);
			return {
			  ask: function (fn) {
				ask = fn || ask;
				if (typeof ask !== 'function') {
				  throw new Error('Expected confirm function, got ' + JSON.stringify(fn));
				}
			  },
			  $get: function () {
				return ask;
			  }
			};
		  })
		.directive('confirmClick', ['$window', '$q', '$parse', '$interpolate', 'ConfirmClick', function ($window, $q, $parse, $interpolate, ask) {
			var counter = 1;
			return {
			  restrict: 'A',
			  priority: 1001,

			  compile: function (elem, attributes) {
				if (attributes.ngClick) {
				  attributes.prevClick = $parse(attributes.ngClick, /* interceptorFn */ null, /* expensiveChecks */ true);
				  attributes.ngClick = '__confirmClick' + counter++ + '()';
				} else if (attributes.href) {
				  attributes.prevClick = function () {
					$window.location.href = attributes.href;
				  };
				  attributes.ngClick = '__confirmClick' + counter++ + '()';
				} else if (attributes.ngHref) {
				  attributes.prevClick = function (scope) {
					var url;
					try {
					  url = $parse(attributes.ngHref)(scope);
					} catch (err) {
					  url = attributes.ngHref;
					}
					$window.location.href = url;
				  };
				  attributes.ngClick = '__confirmClick' + counter++ + '()';
				}

				return {
				  pre: function (scope, element, attr) {

					var expression = $interpolate(attr.confirmClick, false, null, true);
					var question = expression(scope) || 'Are you sure?';

					if (attr.ngClick && attr.prevClick) {

					  var methodName = attr.ngClick.substr(0, attr.ngClick.length - 2);
					  scope[methodName] = function (event) {
						$q.when(ask(question)).then(function (result) {
						  if (result) {
							attr.prevClick(scope, { $event: event });
						  }
						});
					  };
					}

					if (attr.href || attr.ngHref) {
					  element.on('click', function (event) {
						event.preventDefault();
						if (attr.ngClick) {
						  scope.$apply(attr.ngClick);
						}
					  });
					}
				  }
				};
			  }
			};
		  }])
		.factory('logger', [
			'$http', '$interpolate',
			function ($http, $interpolate) {
				
				var logger = {
					logs: []
				};
				
				var error = function(response) {
					var expression = $interpolate('There was an error.  ({{status}}-{{statusText}})');
					var log = expression(response);
					console.log(log);
				};
				
				logger.log = function(message) {
					var log = { message, timestamp: new Date()};
					console.log(message);
					
					return $http.post('/logs', log)
						.then(function(response) {
							logger.logs.push(response.data);
						}, error);
				};
				
				logger.getLogs = function() {
					return $http.get('/logs')
						.then(function(response) {
							angular.copy(response.data, logger.logs);
						}, error);
				};
				
				logger.deleteLog = function(log) {
					return $http.delete('/logs/' + log.id)
						.then(function(response) {
							var index = logger.logs.indexOf(log);
							if (index > -1) {
								logger.logs.splice(index, 1);
							}
						}, error);
				}
				
				logger.getLogs();
				return logger;
			}
		])
		.factory('data', [
			'$http', '$interpolate', 'logger',
			function($http, $interpolate, logger){
			
				var service = { 
					cars: []
				};
				
				var error = function(response) {
					var expression = $interpolate('There was an error.  ({{status}}-{{statusText}})');
					var message = expression(response);
					logger.log(message);
				};
				
				service.getCars = function() {
					var config = { cache: false };
					return $http.get('/cars', config)
						.then(function(response) {
							angular.copy(response.data, service.cars);
						}, error);
				};
				
				service.addCar = function(car) {
					return $http.post('/cars', car)
						.then(function(response) {
							service.cars.push(response.data);
						}, error);
				};
				
				service.updateCar = function(car) {
					return $http.put('/cars/' + car.id, car)
						.then(function(response) {
							var index = findIndex(service.cars, function(item) {
								return item.id === response.data.id;
							});
							service.cars[index] = response.data;
						}, error);
				};
				
				function findIndex(array, predicate) {
					for (var index = 0; index < array.length; index ++) {
						if (predicate(array[index])) return index;
					}
					return -1;
				}
				
				service.deleteCar = function(car) {
					return $http.delete('/cars/' + car.id)
						.then(function(response) {
							var index = service.cars.indexOf(car);
							if (index > -1) {
								service.cars.splice(index, 1);
							}
						}, error);
				}
		  
				service.getCars();
				return service;
			}])
		.controller('MainCtrl', [
			'$scope',
			'data',
			'logger',
			function($scope, data, logger){
				$scope.cars = data.cars;
				$scope.logs = logger.logs;
				$scope.isInEditMode = false;
				
				$scope.upsertCar = function() {					
					if ($scope.isInEditMode) {
						updateCar();
					}
					else {
						addCar();
					}
				}
				
				function addCar() {
					if (!$scope.year || $scope.year === '') { return; }
					if (!$scope.make || $scope.make === '') { return; }
					if (!$scope.model || $scope.model === '') { return; }
					
					data.addCar({
						year: $scope.year,
						make: $scope.make,
						model: $scope.model
					});
					
					clearAnyCarFromScope();
				}
				
				function updateCar() {
					if (!$scope.year || $scope.year === '') { return; }
					if (!$scope.make || $scope.make === '') { return; }
					if (!$scope.model || $scope.model === '') { return; }
					
					data.updateCar({ 
						id: $scope.id, 
						year: $scope.year, 
						make: $scope.make, 
						model: $scope.model 
					});
					
					clearAnyCarFromScope();
				}
				
				$scope.editCar = function(car) {
					
					if ($scope.isInEditMode) {
						clearAnyCarFromScope();
					}
					else {
						$scope.id = car.id;
						$scope.year = car.year;
						$scope.model = car.model;
						$scope.make = car.make;
					}
					
					$scope.isInEditMode = !$scope.isInEditMode;
				}
				
				function clearAnyCarFromScope(){
					$scope.id = '';
					$scope.year = '';
					$scope.model = '';
					$scope.make = '';
				}
				
				$scope.deleteCar = function(car) {
					data.deleteCar(car);
				}
				
				$scope.deleteLog = function(log) {
					logger.deleteLog(log);
				}
				
				$scope.cancelEdit = function() {
					$scope.editCar();
				}
			}
		]);
	})();