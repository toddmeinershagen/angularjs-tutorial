(function () {
	"use strict";

		angular.module('serviceTracker').controller('cars', ['$scope','data','logger', cars]);

		function cars($scope, data, logger){
			$scope.cars = data.cars;
			$scope.logs = logger.logs;
			$scope.isInEditMode = false;
			
			$scope.prepareModalForEdit = function(car) {
				$scope.id = car.id;
				$scope.year = car.year;
				$scope.model = car.model;
				$scope.make = car.make;
				$scope.isInEditMode = true;
			}
			
			$scope.prepareModalForAdd = function prepareModalForAdd(){
				$scope.id = '';
				$scope.year = '';
				$scope.model = '';
				$scope.make = '';
				$scope.isInEditMode = false;
			}
			
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
				
				prepareModalForAdd();
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
				
				prepareModalForAdd();
			}
			
			$scope.deleteCar = function(car) {
				data.deleteCar(car);
			}
			
			$scope.deleteLog = function(log) {
				logger.deleteLog(log);
			}
		}
})();