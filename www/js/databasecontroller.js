angular.module('starter.getdatacontroller', ['ionic'])
    .controller('viewdata', function($scope, getData, $ionicPopup, $interval, $ionicLoading,$ionicModal) {
        $scope.item = {};
        $scope.data = {};
        $scope.persons = [];

        ionic.Platform.ready(function(device) {
            getData.getAllData().then(function() {
                $interval(getdatatoview(), 3000);
            });
        });

		
		/*modal to view serviceItem list*/
	$ionicModal.fromTemplateUrl('templates/addmodal.html',{
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.addmodal = modal;
            }); 
			
		/*modal to view serviceItem list*/
	$ionicModal.fromTemplateUrl('templates/editmodal.html',{
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.editmodal = modal;
            }); 	
        /*method to insert data in table*/
        function insertdata() {
            getData.getAllData().then(function() {});
        }

        /*method to view data from table*/
        function getdatatoview() {
            getData.getViewData().then(function(response) {
                console.log(response);
                $scope.persons = response;
                $ionicLoading.hide();
            });
        }

        /*method to search data*/
        $scope.search = function() {
            getData.getselectedData($scope.item.search).then(function(response) {
                $scope.persons = response;
            })
        }

        /*method to add data*/
        $scope.add = function() {
			alert(JSON.stringify($scope.data));
			 getData.addDataService($scope.data).then(function(response) {                            
                            getData.getAllData().then(function() {
                                $interval(getdatatoview(), 3000);
								$scope.addmodal.hide();
								alert(response.data[0].message);
                            });

                        });		
        }

        /*method to delete data*/
        $scope.delete = function(person) {
            getData.deleteDataService(person.Id).then(function(response) {
                $interval(getdatatoview(), 3000);
				alert(response.data[0].message);
            })
        }

		/*update edited data*/
		
		$scope.update= function(){
			getData.editService($scope.data).then(function(response) {
                            $interval(getdatatoview(), 3000);
							$scope.editmodal.hide();
							alert(response.data[0].message);
							$scope.data = {};
                        })
		}
		
        /*method to edit data*/
        $scope.edit = function(person) {
            $scope.data = {
                Id: person.Id,
                name: person.name,
                email: person.email,
                mbnum: person.mbnum,
                dob: person.dob
            };
			$scope.editmodal.show();
        }

        /*method to show loader*/
        function loderFunction() {
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles" class="spinner-balanced"></ion-spinner>'
            });
        }
    })