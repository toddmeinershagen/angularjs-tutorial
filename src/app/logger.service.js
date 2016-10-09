(function () {
	"use strict";
	
	angular.module('serviceTracker')
		.factory('logger', logger);/*['$http', '$q', '$interpolate', '$log', logger]);*/
	
	function logger ($http, $q) {//, $interpolate, $log) {		
		var resourceUrl = "logs";
		var logger = {};
		
		logger.logError = function (message) {
			var log = { message: message, timestamp: new Date()};
			$http.post(resourceUrl, log);
		}
		
		logger.getLogs = function () {
			//using $q to reshape the response.
			var deferred = $q.defer();
			$http.get(resourceUrl)
				.then(function(response) {
					deferred.resolve(response.data);
				});
			return deferred.promise;
			//return $http.get(resourceUrl);
		}
		
		logger.deleteLog = function (id) {
			$http.delete(resourceUrl + '/' + id);
		}
		
		return logger;
		
		/*
		var logger = {
			logs: []
		};
		

		var error = function(response) {
			var expression = $interpolate('There was an error.  ({{status}}-{{statusText}})');
			var log = expression(response);
			$log.debug(log);
		};
		
		logger.log = function(message) {
			var log = { message: message, timestamp: new Date()};
			$log.debug(message);
			
			return $http.post(resourceUrl, log)
				.then(function(response) {
					logger.logs.push(response.data);
				}, error);
		};
		
		logger.getLogs = function() {
			return $http.get(resourceUrl)
				.then(function(response) {
					angular.copy(response.data, logger.logs);
				}, error);
		};
		
		logger.deleteLog = function(log) {
			return $http.delete(resourceUrl + '/' + log.id)
				.then(function(response) {
					var index = logger.logs.indexOf(log);
					if (index > -1) {
						logger.logs.splice(index, 1);
					}
				}, error);
		}
		
		logger.getLogs();
		return logger;
		*/
	}
})();