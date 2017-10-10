/**
 * Created by maximiliankorner on 04/09/16.
 */
angular.module('water').controller('10_HotspotController', function ($scope) {
//
  //AUDIO ELEMENT
  //

  // stop any track before leaving current view
  $scope.$on('$ionicView.beforeLeave', function () {
    MediaManager.stop();
  });

  //AUDIO PLAYER CONFIG
  $scope.myTrack = {
    url: ionic.Platform.isIOS()?'audio/Hotspot_10_Audio_Sauerstoff_edit.mp3':'/android_asset/www/audio/Hotspot_10_Audio_Sauerstoff_edit.mp3',
    artist: 'Dr. Angelika Jung-Hüttl',
    title: 'Nicht ohne Sauerstoff',
    art: 'img/speaker.png'
  }

});
