describe('logger.service', function () {
	var logs = {"logs": [
		{
		  "message": "There was an error.  (400-BadRequest)",
		  "timestamp": "2016-10-09T04:18:55.680Z",
		  "id": 1
		}
	]};

	var logger = {};	
	var $http;
	var $httpBackend;
	
	beforeEach(angular.mock.module('serviceTracker'));
	beforeEach(angular.mock.inject(function (_logger_, _$http_, _$httpBackend_) {
		logger = _logger_;
		$http = _$http_;
		$httpBackend = _$httpBackend_;
	}));
	
	it('should return logs', function () {
		var data;
		
		$httpBackend.whenGET('logs')
			.respond(200, logs);
			
		logger.getLogs()
			.then(function(response) {
				data = response;
			});
			
		$httpBackend.flush();
			
		expect(data).toEqual(logs);
	});
	
	it('should delete logs by id', function () {

		spyOn($http, 'delete');
		
		var id = 1;
		logger.deleteLog(id);
		
		expect($http.delete).toHaveBeenCalledWith('logs/' + id);
	});
});