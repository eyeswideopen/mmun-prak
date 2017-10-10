angular.module('water', ['ionic', 'ngCordova', 'ionic-audio', 'ionic-zoom-view', 'ionic.rating'])

  .run(function($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }


      //STATE 1 -> HOTSPOT 04
      //STATE 2 -> HOTSPOT 03
      //STATE 3 -> HOTSPOT 10
      //STATE 4 -> HOTSPOT 13
      //STATE 5 -> HOTSPOT 16
      //STATE 6 -> HOTSPOT 17
      //STATE 7 -> HOTSPOT 11

      //list of all available hotspots
      $rootScope.hotspots = [];
      $rootScope.hotspots.push({
        name: "Roebuck Bay - Australien",
        state: "app.01",
        thumbnail: "img/high_res/Hotspot_04.jpg"
      });
      $rootScope.hotspots.push({
        name: "Thjorsá - Island",
        state: "app.02",
        thumbnail: "img/high_res/Hotspot_03.jpg"
      });
      $rootScope.hotspots.push({
        name: "Isluga - Chile",
        state: "app.03",
        thumbnail: "img/high_res/Hotspot_10.jpg"
      });
      $rootScope.hotspots.push({
        name: "Landeyjarsander - Island",
        state: "app.04",
        thumbnail: "img/high_res/Hotspot_13.jpg"
      });
      $rootScope.hotspots.push({
        name: "Lenadelta - Russland",
        state: "app.05",
        thumbnail: "img/high_res/Hotspot_16.jpg"
      });
      $rootScope.hotspots.push({
        name: "Diskobucht - Grönland",
        state: "app.06",
        thumbnail: "img/high_res/Hotspot_17.jpg"
      });
      $rootScope.hotspots.push({
        name: "Malaspinagletscher - USA",
        state: "app.07",
        thumbnail: "img/high_res/Hotspot_11.jpg"
      });




    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'menuController'
      })

      .state('app.gallery', {
        url: '/gallery',
        views: {
          'menuContent': {
            templateUrl: 'templates/gallery.html',
            controller: 'galleryController'
          }
        }
      })
      .state('app.impressum', {
        url: '/impressum',
        views: {
          'menuContent': {
            templateUrl: 'templates/impressum.html',
            controller: 'impressumController'
          }
        }
      })
      .state('app.feedback', {
        url: '/feedback',
        views: {
          'menuContent': {
            templateUrl: 'templates/feedback.html',
            controller: 'feedbackController'
          }
        }
      })
      .state('app.intro', {
        url: '/intro',
        views: {
          'menuContent': {
            templateUrl: 'templates/intro.html',
            controller: 'introController'
          }
        }
      })


      //APP STATES ARE ALTERED FOR THE TEST EXHIBITION "FARBEN DER ERDE"
      //STATE 1 -> HOTSPOT 04
      //STATE 2 -> HOTSPOT 03
      //STATE 3 -> HOTSPOT 10
      //STATE 4 -> HOTSPOT 13
      //STATE 5 -> HOTSPOT 16
      //STATE 6 -> HOTSPOT 17
      //STATE 7 -> HOTSPOT 11

      .state('app.01', {
        url: '/01',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/04_Hotspot.html',
            controller: '04_HotspotController'
          }
        }
      })

      //hotspots
      .state('app.02', {
        url: '/02',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/03_Hotspot.html',
            controller: '03_HotspotController'
          }
        }
      })
      .state('app.03', {
        url: '/03',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/10_Hotspot.html',
            controller: '10_HotspotController'
          }
        }
      })
      .state('app.04', {
        url: '/04',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/13_Hotspot.html',
            controller: '13_HotspotController'
          }
        }
      })
      .state('app.05', {
        url: '/05',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/16_Hotspot.html',
            controller: '16_HotspotController'
          }
        }
      })
      .state('app.06', {
        url: '/06',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/17_Hotspot.html',
            controller: '17_HotspotController'
          }
        }
      })
      .state('app.07', {
        url: '/07',
        views: {
          'menuContent': {
            templateUrl: 'templates/hotspots/11_Hotspot.html',
            controller: '11_HotspotController'
          }
        }
      });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/gallery');
  });
