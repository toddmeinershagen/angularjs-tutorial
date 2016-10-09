(function () {
	"use strict";
	
	angular.module('serviceTracker').factory('data', ['$http', '$interpolate', 'logger', data]);
	
	function data ($http, $interpolate, logger){
		var resourceUrl = "cars";
				
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
			return $http.get(resourceUrl, config)
				.then(function(response) {
					angular.copy(response.data, service.cars);
				}, error);
		};
		
		service.addCar = function(car) {
			return $http.post(resourceUrl, car)
				.then(function(response) {
					service.cars.push(response.data);
				}, error);
		};
		
		service.updateCar = function(car) {
			return $http.put(resourceUrl + '/' + car.id, car)
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
			return $http.delete(resourceUrl + '/' + car.id)
				.then(function(response) {
					var index = service.cars.indexOf(car);
					if (index > -1) {
						service.cars.splice(index, 1);
					}
				}, error);
		}
  
		service.getCars();
		return service;
	}
})();