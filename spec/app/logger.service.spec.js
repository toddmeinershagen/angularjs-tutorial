describe('logger.service', function () {
	
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
		var logs = {"logs": [
			{
			  "message": "There was an error.  (400-BadRequest)",
			  "timestamp": "2016-10-09T04:18:55.680Z",
			  "id": 1
			}
		]};
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
	
	it('should add logs when logging error', function () {
		spyOn($http, 'post');
		
		var currentDate = new Date(2013, 1, 1);
		jasmine.clock().mockDate(currentDate);
		
		var message = 'This is a test message.';
		logger.logError(message);
		
		var log = { message: message, timestamp: currentDate};
		expect($http.post).toHaveBeenCalledWith('logs', log);
	});
});