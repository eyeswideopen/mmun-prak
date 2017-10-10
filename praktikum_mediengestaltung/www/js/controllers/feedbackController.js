angular.module('water').controller('feedbackController', function ($scope, $http, localNotif, $sce, $ionicScrollDelegate) {


  $scope.loading = true;
  $scope.error = false;
  $scope.errorMessage = '';
  $scope.localNotif = localNotif;
  $scope.introMessage = '';
  $scope.rewardMessage = '';
  $scope.showGeneralOpinion = false;

  //$scope.sent = false;

  $scope.questions = [];

  $scope.generalOpinion = "";

  $scope.contact = {};
  $scope.contact.firstname = "";
  $scope.contact.lastname = "";
  $scope.contact.email = "";


  $scope.sendFeedback = function () {

    var data = {
      firstname: $scope.contact.firstname,
      lastname: $scope.contact.lastname,
      email: $scope.contact.email,
      questions: $scope.questions,
      general_opinion: $scope.generalOpinion
    };

    console.log(JSON.stringify(data))

    $http({
      method: 'POST',
      url: 'http://lakeside-design.de/museumMenschUndNatur/feedback.php',
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
      data: data
    }).then(function (response) {
        localNotif.feedbackSuccessfullySent();
        $ionicScrollDelegate.scrollTop();
      },
      function (error) {
        $scope.error = true;
        showError("Es ist ein Fehler beim Übertragen des Feedbacks aufgetreten!\n Bitte stellen Sie sicher, dass Sie mit dem Internet verbunden sind.");
      });

  }

  $scope.reload = function(){
    init()
  };

  //
  //load questions from server
  //

  var showError = function (errorMessage) {
    $scope.error = true;
    $scope.errorMessage = errorMessage;
    $scope.loading = false;
  };

  var addQuestion = function (question) {
    var newquestion = {};
    newquestion.showRating = question.showRating;
    newquestion.showComment = question.showComment;
    newquestion.text = question.text;

    if (question.showRating) {
      newquestion.rate = 0;
      newquestion.max = 5;
    }
    if (question.showComment) {
      newquestion.explanation = "";
    }

    $scope.questions.push(newquestion);
  };


  var init = function(){

    $scope.error = false;
    $scope.errorMessage = '';
    $scope.loading = true;

    //load questions from server
    $http.get('http://lakeside-design.de/museumMenschUndNatur/questions.json').success(function (response) {
      if (!response.questions) {
        showError("Feedback ist im Moment nicht Verfügbar, " +
          "bitte versuchen Sie es später noch einmal oder kontaktieren Sie " +
          "uns unter: <a href='mailto:maximilian.koerner@campus.lmu.de'>maximilian.koerner@campus.lmu.de</a>");
        return;
      }
      response.questions.forEach(function (question) {
        addQuestion(question);
      });
      $scope.rewardMessage = $sce.trustAsHtml(response.rewardMessageHTML);
      $scope.introMessage = $sce.trustAsHtml(response.introMessageHTML);
      $scope.showGeneralOpinion = response.showGeneralOpinion;
      $scope.loading = false;

    })
  };

  $scope.$on('$ionicView.loaded', function (event) {
    init();
  });


});
