angular.module('water').controller('menuController', function ($scope,
                                                               waterAudio,
                                                               $ionicPopup,
                                                               localNotif,
                                                               beaconManager,
                                                               $state
) {


  $scope.localNotif = localNotif;

  $scope.beaconManager = beaconManager;

  $scope.state = $state;


  $scope.closestBeaconIndex = function(){
    beaconManager.navigateToClosestState();
  }

  $scope.resetIntro = function(){

  }


  $scope.liveClicked = function(){
    $ionicPopup.alert(
      {
        title: 'Live Navigation aktiv',
        template: 'Während Sie sich in der Ausstellung befinden navigiert die App automatisch.<br><br>' +
        'Es werden Zusatzinhalte des nächstgelegenen Hotspots angezeigt' +
        '<br><br>Um auf die manuelle Navigation zurückzugreifen deaktivieren sie Bluetooth'
      }
    )

  }

});
