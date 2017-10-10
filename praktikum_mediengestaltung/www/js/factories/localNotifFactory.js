angular.module('water').factory('localNotif', function ($q, $cordovaLocalNotification, $ionicPlatform, $http) {

  var localNotif = {};

  localNotif.remoteFeedbackVersion = null;
  localNotif.remoteNotification = null;
  localNotif.feedbackSent = false;


  var notifShouldBeScheduled = function () {

    var defer = $q.defer();

    //compares local to remote feedback version
    var checkRemoteFeedbackVersion = function () {
      //check if local storage version is smaller than remote
      var currentVersion = window.localStorage.getItem('feedbackVersion');

      if (!currentVersion || currentVersion == '' || currentVersion < localNotif.remoteFeedbackVersion) {
        defer.resolve(true);
      } else {
        defer.resolve(false);
      }
    };


    if (localNotif.remoteFeedbackVersion == null) {
      //get current Feedback version
      $http.get('http://lakeside-design.de/museumMenschUndNatur/questions.json').success(function (response) {

        if (response.version == null || !response.pushNotification == null) {
          defer.reject("no feedback version or notification received")
        }
        localNotif.remoteFeedbackVersion = response.version;
        localNotif.remoteNotification = response.pushNotification;
        checkRemoteFeedbackVersion();
      });
    } else {
      checkRemoteFeedbackVersion()
    }

    return defer.promise;
  };


  localNotif.scheduleNotif = function () {
    $ionicPlatform.ready(function () {

        notifShouldBeScheduled().then(function (displayNotif) {

          if (displayNotif) {

            var now = new Date().getTime();
            //var _10SecondsFromNow = new Date(now + 10 * 1000);
            var tomorrow = new Date(now + 24 * 60 * 60 * 1000);


            if (ionic.Platform.device()) {
              $cordovaLocalNotification.schedule({
                id: localNotif.remoteFeedbackVersion,
                title: localNotif.remoteNotification.title,
                text: localNotif.remoteNotification.text,
                at: tomorrow,
                badge: 1
              }).then(function (result) {
                window.localStorage.setItem('feedbackVersion', localNotif.remoteFeedbackVersion);
              });
            } else {
              window.localStorage.setItem('feedbackVersion', localNotif.remoteFeedbackVersion);
            }

          }
        }).catch(function (error) {
        })

      }
    );

  };


//feedback was successfully given for current remote version
  localNotif.feedbackSuccessfullySent = function () {

    //set given feedback version to current remote
    console.log("asdfasdf" + localNotif.remoteFeedbackVersion);
    window.localStorage.setItem('givenFeedbackVersion', localNotif.remoteFeedbackVersion);
    localNotif.feedbackSent = true;

    //clear all badges and local notifications
    if (ionic.Platform.device()) {
      $cordovaLocalNotification.clearAll();
    }


  };


//init

  var init = function () {

    //reset remote to get current via http
    localNotif.remoteFeedbackVersion = null;

    //check if feedback was sent and set accordingly
    notifShouldBeScheduled().then(function (newVersionAvailable) {

      var givenFeedbackVersion = window.localStorage.getItem('givenFeedbackVersion');

      //check if feedback is given for current version
      localNotif.feedbackSent = !((givenFeedbackVersion == null || givenFeedbackVersion.length === 0) || givenFeedbackVersion < localNotif.remoteFeedbackVersion);

      //schedule
      localNotif.scheduleNotif();
    });


  };

  $ionicPlatform.ready(function () {
    init();
  });
  $ionicPlatform.on("resume", function (event) {
    init();
  });

  return localNotif;
})
;
