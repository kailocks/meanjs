'use strict';

// Statuses controller
angular.module('statuses').controller('StatusesController', ['$scope', '$stateParams', '$location', 'Socket', 'Authentication', 'Statuses',
	function($scope, $stateParams, $location, Socket, Authentication, Statuses) {
		$scope.authentication = Authentication;

		var sta;
		Socket.on('status.created', function(status){
				sta = status;
				console.log(sta);
				$scope.statuses.push(status);
			});

		Socket.on('status.update', function(status){
			console.log(status);
			// $scope.status = status;
		});

		Socket.on('status.delete', function(status){
			console.log(status);

		});

		Socket.on('status.list', function(statuses){
			console.log(statuses);
			$scope.statuses = statuses;
		})

		Socket.on('status.read', function(status){
			console.log(statuses);
			$scope.status = status;
		})
		// Create new Status
		$scope.create = function() {
			// Create new Status object
			var status = new Statuses ({
				name: this.name,
				email: this.email
			});

			// Redirect after save
			status.$save(function(response) {
				$location.path('statuses/' + status._id);

				// Clear form fields
				$scope.name = '';
				$scope.email = '';
				//$scope.statuses.push(status);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Status
		$scope.remove = function(status) {
			if ( status ) { 
				status.$remove();

				for (var i in $scope.statuses) {
					if ($scope.statuses [i] === status) {
						$scope.statuses.splice(i, 1);
					}
				}
			} else {
				$scope.status.$remove(function() {
					$location.path('statuses');
				});
			}
		};

		// Update existing Status
		$scope.update = function() {
			var status = $scope.status;

			status.$update(function() {
				// $location.path('statuses/' + status._id);
				$location.path('statuses');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Statuses
		$scope.find = function() {
			$scope.statuses = Statuses.query();
		};

		$scope.deselect = function() {
  			$scope.name= "";
  			$scope.email = "";
		};
		// Find existing Status
		$scope.findOne = function(id) {
			
			$scope.status = Statuses.get({ 
				statusId: $stateParams.statusId
			});
			console.log($stateParams.statusId);
		};


	}
]);