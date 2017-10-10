angular.module('water').controller('introController', function ($scope, $state, $ionicViewService) {

  $scope.finishIntro = function(){
    $state.go('app.gallery');
    $ionicViewService.clearHistory()
  }


});
