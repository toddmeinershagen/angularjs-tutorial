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
	.factory('data', [
		'$http', 
		function($http){
		
			var service = { 
				cars: []
			};
			
			var error = function(response) {
				alert('There was an error.  (' + response.status + '-' + response.statusText + ')');
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
		function($scope, data){
			$scope.cars = data.cars;
			
			$scope.addCar = function() {
				if (!$scope.year || $scope.year === '') { return; }
				if (!$scope.make || $scope.make === '') { return; }
				if (!$scope.model || $scope.model === '') { return; }
				
				data.addCar({
					year: $scope.year,
					make: $scope.make,
					model: $scope.model
				});
				
				$scope.year = '';
				$scope.make = '';
				$scope.model = '';
			}
			
			$scope.deleteCar = function(car) {
				data.deleteCar(car);
			}
		}
	]);