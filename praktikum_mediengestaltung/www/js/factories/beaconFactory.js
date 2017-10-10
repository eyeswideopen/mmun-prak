/**
 * Created by maximiliankorner on 11/08/16.
 */
angular.module('water').factory('beaconManager', function ($cordovaBeacon,
                                                           $ionicPlatform,
                                                           $q,
                                                           $rootScope,
                                                           $ionicPopup,
                                                           $ionicHistory,
                                                           $state,
                                                           $ionicNavBarDelegate) {

  var beaconManager = {};


  beaconManager.region = {};
  beaconManager.hotspotsInRange = [];
  $rootScope.isInExibition = false;


  beaconManager.authDialogShown = false;
  beaconManager.bluetoothDialogShown = false;
  beaconManager.locationGuideShown = false;
  beaconManager.notSupportedDialogShown = false;

  beaconManager.btRequestDialog = null;

  var bluetoothActivityTimeout = null;


  //returns bool if app has any beacons in range and thus is in the exibition
  beaconManager.isInExibition = function () {
    return $rootScope.isInExibition;
  };

  //variables for BT status update via ranging callback
  var btAvailableDefer = null;
  var waitForBTDefer = null;

  //state switch counter
  var stateSwitchThreshold = ionic.Platform.isIOS() ? 2 : 3; //android has significantly worse performance and is dropping beacons all the time.
  var stateSwitchCounter = stateSwitchThreshold;       //counts up to stateSwitchThreshold until a state switch is initiated to prevent state flickering
  var newState = undefined;
  var currentStateMinor = undefined;
  var androidStateSkipThreshold = 2;//android drops beacons even if they are in range. this threshold represents the times needed
  //for a new state to be valid even if the current one is not present in the beacons (and is dropped).
  var androidStateSkipCounter = 0;





  beaconManager.navigateToClosestState = function () {
    console.log($state.current.name);

    if ($rootScope.isInExibition && $rootScope.closestBeaconIndex.minor) {
      $ionicHistory.nextViewOptions({disableBack: true});
      $state.go("app." + ("00" + ($rootScope.closestBeaconIndex.minor)).slice(-2), {}, {location: 'replace'})
    }
  };

  beaconManager.shouldDisplayClosestState = function () {
    if ($state.current.name == "app.gallery" || $state.current.name == "app.impressum" || $state.current.name == "app.feedback")return false;
    return ($rootScope.closestBeaconIndex && $state.current.name != $rootScope.hotspots[$rootScope.closestBeaconIndex].state)
  };


  if (!ionic.Platform.isWebView()) {
    return beaconManager;
  }




  //
  //HELPER
  //

  //returns closest beacon of current beaconarray
  var getClosestBeacon = function () {
    //return the first beacon with rssi < 1 (is undefined range in ios)
    if (beaconManager.hotspotsInRange.length == 0) return undefined;
    for (var i = 0; i < beaconManager.hotspotsInRange.length; i++) {
      if (beaconManager.hotspotsInRange[i].rssi < 0) {
        return beaconManager.hotspotsInRange[i];
      }
    }
    return undefined;
  };

  //used to sort the beacon array by rssi (android doesn't do that by itself -_-)
  var compareBeacons = function (a, b) {
    if (a.rssi < b.rssi)
      return -1;
    if (a.rssi > b.rssi)
      return 1;
    return 0;
  };

  //this checks if the state should actually change
  //a little more difficult, as on android the nearest beacons drop all the time for 1-2 cycles...
  var checkStateChange = function () {

    var closestBeacon = getClosestBeacon();
    var newStateName = "app." + ("00" + (closestBeacon.minor)).slice(-2);

    if ($state.current.name != newStateName) {


      //android has to check if current state is only dropped for 1 or 2 cycles or if it really went out of range
      if (ionic.Platform.isAndroid() && currentStateMinor) {
        var currentStateContained = !!beaconManager.hotspotsInRange.filter(function (element) {
          return element.minor == currentStateMinor
        });

        console.log("CONTAINED: " + currentStateContained);
        if (!currentStateContained && androidStateSkipCounter < androidStateSkipThreshold) {
          if (androidStateSkipCounter < androidStateSkipThreshold) {
            androidStateSkipCounter++;
            console.log("incremented");
            return;
          } else {
            androidStateSkipCounter = 0;
            console.log("reset 1");

            //CONTINUES REGULAR HANDLING FROM HERE
          }

        } else {
          //contained: reset counter
          androidStateSkipCounter = 0;
          console.log("reset 2");

          //CONTINUES REGULAR HANDLING FROM HERE
        }
      }


      if (stateSwitchCounter == 0) {
        stateSwitchCounter++;
        newState = newStateName;
      } else if (newState != newStateName) {
        stateSwitchCounter = 1;
        newState = newStateName;
      } else {
        stateSwitchCounter++;
      }

      if (stateSwitchCounter >= stateSwitchThreshold) {
        console.log("SWITCHING STATE with counter: " + stateSwitchCounter);
        stateSwitchCounter = 0;
        newState = undefined;
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        //save current state minor for later android comparison and got to new state!
        currentStateMinor = closestBeacon.minor;
        $state.go(newStateName, {}, {location: 'replace'})
      }
    } else {
      //resetting counter beacause current state showed up again as nearest
      stateSwitchCounter = 0;
    }
  };


  var triggerBluetoothActivityTimeout = function () {
    console.log("bt deactivated while in exibition");

    if ($rootScope.isInExibition) {

      $rootScope.$apply(function () {
        $rootScope.isInExibition = false;
        $ionicNavBarDelegate.showBackButton(true);
      });
    }
  };

  //INIT
  $ionicPlatform.ready(function () {

    //create beacon region
    beaconManager.region = $cordovaBeacon.createBeaconRegion(
      'Hotspots', '00000000-0000-0000-0000-000000000000', 1, null, true
    );

    $rootScope.$on("$cordovaBeacon:didRangeBeaconsInRegion", function (event, pluginResult) {


      //check if bt available call was made
      if (btAvailableDefer) {
        console.log("BT available triggered");

        btAvailableDefer.resolve(true);
        stopRangingBeacons();
        btAvailableDefer = null;
        return;
      }


      //waiting for BT block: is called once after BT is activated
      if (waitForBTDefer) {
        waitForBTDefer.resolve(true);
        stopRangingBeacons();
        waitForBTDefer = null;
        return;
      }

      //reset bt activity tracking timer
      if (bluetoothActivityTimeout) {
        clearTimeout(bluetoothActivityTimeout);
      }
      bluetoothActivityTimeout = setTimeout(triggerBluetoothActivityTimeout, 4000);


      //actual ranging block
      if (pluginResult.beacons.length > 0) {

        //set exibition state
        if (!$rootScope.isInExibition) {

          //switch to in exibition mode
          $rootScope.isInExibition = true;
          $ionicNavBarDelegate.showBackButton(false);


        }

        beaconManager.hotspotsInRange = pluginResult.beacons;
        beaconManager.hotspotsInRange.sort(compareBeacons);
        beaconManager.hotspotsInRange.reverse();

        // console.log(JSON.stringify(beaconManager.hotspotsInRange));


        //check if state should be changed
        checkStateChange();

      } else {
        //set exibition state
        if ($rootScope.isInExibition) {
          $rootScope.isInExibition = false;
          $ionicNavBarDelegate.showBackButton(true);
          currentStateMinor = undefined;
        }
      }

      console.log("-----------");
      console.log("Beacons in Range: " + beaconManager.hotspotsInRange.length);

    });

    //start it up
    beaconManager.setup();


  });

  //disable back button if in exibition
  $ionicPlatform.registerBackButtonAction(function (event) {
    if ($rootScope.isInExibition)
      event.preventDefault();
  }, 100);

  $ionicPlatform.on("resume", function (event) {
    beaconManager.setup();
  });


  //after the request was shown we have to wait for user input to get the updated auth status
  beaconManager.waitForUpdatedAuthorizationStatus = function () {
    var defer = $q.defer();

    var checkAndWait = function () {
      console.log("check and wait called");

      $cordovaBeacon.getAuthorizationStatus().then(function (result) {
        console.log(result);
        switch (result.authorizationStatus) {
          //wait for user input and check again
          case "AuthorizationStatusNotDetermined":
            console.log("new timeout set");

            setTimeout(checkAndWait, 1000);
            break;


          case "AuthorizationStatusAuthorizedWhenInUse":
            //auth granted!
            defer.resolve({authorizationStatus: "AuthorizationStatusAuthorizedWhenInUse"});
            console.log("check resolved!");
            break;

          case "AuthorizationStatusDenied":
            //auth denied! display how to enable it ui element
            defer.resolve({authorizationStatus: "AuthorizationStatusDenied"});

            break;
        }
      });

    };

    setTimeout(checkAndWait, 1000);

    return defer.promise;
  };

  beaconManager.requestAuthorization = function () {
    beaconManager.authDialogShown = true;
    return $cordovaBeacon.requestWhenInUseAuthorization();
  };

  beaconManager.bluetoothEnabled = function () {
    btAvailableDefer = $q.defer();

    console.log("starting from bluetoothEnabled");
    startRangingBeacons();

    setTimeout(function () {
      if (btAvailableDefer) {
        console.log("stopping from bluetoothEnabled timeout");
        stopRangingBeacons();
        btAvailableDefer.resolve(false);
        btAvailableDefer = null;
      }
    }, 1000);
    return btAvailableDefer.promise;
  };

  beaconManager.waitForBT = function () {
    waitForBTDefer = $q.defer();
    console.log("starting from waitForBT");
    startRangingBeacons();
    return waitForBTDefer.promise;
  };

  beaconManager.stopWaitingForBT = function () {
    if (waitForBTDefer) {
      waitForBTDefer.resolve(false);
      waitForBTDefer = null;
      console.log("stopping from stopWaitingForBT");
      stopRangingBeacons()
    }
  };


  //setup for in exibition mode
  beaconManager.setup = function () {

    console.log("setup called");


    $ionicPlatform.ready(function () {

      //check if ranging is supported by the native layer
      $cordovaBeacon.isRangingAvailable().then(function (result) {
        console.log("RANGING AVAILABLE!: " + JSON.stringify(result));

        //check authorisation status
        $cordovaBeacon.getAuthorizationStatus().then(function (result) {

          console.log("auth status: " + JSON.stringify(result));
          switch (result.authorizationStatus) {

            //AUTH NOT YET DETERMINED -> ASK FOR IT
            case "AuthorizationStatusNotDetermined":

              if (!beaconManager.authDialogShown) {
                console.log("auth status not determined -  ask for it!");
                showAuthRequest();
              }

              break;

            //AUTH DENIED -> NO EXIBITION MODE
            case "AuthorizationStatusDenied":
              //auth denied! display how to enable it ui element
              if (!beaconManager.locationGuideShown) {
                showLocationGuide();
              }
              break;


            //AUTH GRANTED -> CONTINUE
            case "AuthorizationStatusAuthorized":
            case "AuthorizationStatusAuthorizedWhenInUse":
              //CHECK BT
              beaconManager.bluetoothEnabled().then(function (response) {

                console.log("bt enabled response: " + response);

                //BT NOT ENABLED -> SHOW DIALOG
                if (!response) {

                  showBluetoothRequest();


                  beaconManager.waitForBT().then(function (response) {
                    console.log("wait for bt response: " + response);
                    if (response) {

                      //bt available! hide bt dialog if visible
                      if (beaconManager.btRequestDialog) {
                        beaconManager.btRequestDialog.close();
                        beaconManager.btRequestDialog = null;
                      }

                      //start actually ranging beacons
                      startRangingBeacons();
                    }
                    else
                    //waiting for bt canceled
                      showLocationGuide();
                  });


                }

                //start actually ranging beacons
                startRangingBeacons();

              });
              break;
          }

        })

          .catch(function (err) {
            console.log("aut status catch: " + err);
          })


        // }
      })

      //RANGING NOT SUPPORTED
        .catch(function (err) {
          console.log("NOT SUPPORTED WITH ERR: " + err);
          showNotSupportedAlert();
        });
      ;


    });

  };


  var startRangingBeacons = function () {

    $ionicPlatform.ready(function () {
      $cordovaBeacon.startRangingBeaconsInRegion(beaconManager.region);
      console.log("ranging started");
    });

  };
  var stopRangingBeacons = function () {
    $ionicPlatform.ready(function () {
      $cordovaBeacon.stopRangingBeaconsInRegion(beaconManager.region);
      console.log("ranging stopped");
    });

  };

  //
  //UI DIALOGS
  //
  var showNotSupportedAlert = function () {
    if (!beaconManager.notSupportedDialogShown) {
      beaconManager.notSupportedDialogShown = true;
      $ionicPopup.alert({
        title: 'Automatische Navigation nicht unterstützt',
        template: 'Ihr Smartphone unterstützt die automatische Navigation leider nicht. <br><br>' +
        'Über die manuelle Navigation stehen Ihnen jedoch alle Funktionen zur Verfügung'
      });

    }
  };

  var showAuthRequest = function () {

    // A confirm dialog
    var alert = $ionicPopup.alert({
      title: 'Zugriff auf den Standort',
      template: 'Um die automatische Navigation innerhalb der Ausstellung zu nutzen wird Bluetooth verwendet.\n\nBitte bestätigen Sie hierfür den Zugriff auf Ihren Standort.'
    });

    alert.then(function (res) {
      //ON BUTTON PRESS:
      beaconManager.requestAuthorization().then(function () {
        //response always empty
        beaconManager.waitForUpdatedAuthorizationStatus().then(function (response) {
          console.log("response of wait: " + JSON.stringify(response));
          //trigger new check of all parameters
          beaconManager.setup();
        })

      })
    });

  };

  var showBluetoothRequest = function () {

    if (!beaconManager.bluetoothDialogShown) {
      beaconManager.bluetoothDialogShown = true;

      beaconManager.btRequestDialog = $ionicPopup.alert({
        title: 'Bluetooth Aktivierung',
        template: 'Bitte aktivieren Sie Bluetooth um die automatische Navigation zu verwenden.',
        //TODO: inlcude spinner for activity indication
        okText: 'Abbrechen'
      });


      beaconManager.btRequestDialog.then(function (res) {
        //cancel pressed
        if (waitForBTDefer) waitForBTDefer.resolve(false);
        beaconManager.btRequestDialog = null;
      });

    }

  };

  var showLocationGuide = function () {
    console.log("LOACTION DIALOG SHOWN");

    if (!beaconManager.locationGuideShown) {

      beaconManager.locationGuideShown = true;
      var alertPopup = $ionicPopup.alert({
        title: 'Standortdaten nicht verfügbar',
        template: 'Sie verwenden die App ohne automatischer Navigation, bis Standortdaten und Bluetooth verfügbar sind.'
      });

      alertPopup.then(function (res) {
        // console.log('Thank you for not eating my delicious ice cream cone');
      });
    }
    ;

  };


  return beaconManager;

});
