//DISCLAIMER: THIS ABOMINATION OF NON REUSABILITY AND UGLINESS IS NOT MINE!!
//I JUST WRAPPED IT IN A COMPONENT,FIXED IT AS BEST AS I CAN AND USED IT FOR FAST SHIPPING.
// ONLY WORKS WITH ONE INSTANCE PER PAGE

//example usage:     <image-puzzle image="img/high_res/Hotspot_13.jpg"></image-puzzle>



angular.module('water').component('imagePuzzle', {
  // isolated scope binding
  bindings: {
    image: '@'
  },

  template: '<section id="board"></section>',

  controller: function ($ionicPopup,$scope, $window, $element) {


    function shuffle(array) {
      var m = array.length,
        t, i;
      // While there remain elements to shuffle…
      while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
    };

    function setBoard(num, size) {
      var totalTiles = num * num; //rows x columns of tiles.
      tileList[totalTiles - 1] = totalTiles - 1;
      for (var i = 0; i < tileList.length; i++) {
        tileList[i] = i;
      }
      shuffle(tileList);
    };

// Make a board and fill with array elements
    var tileList = [];
    var tile = 0;
    setBoard(3, 100);
    makeTiles(tileList);

    function myTile(el) {
      tile = parseInt(el.id, 10);
      makeMove();
    };

    function makeTiles(array) {


      listContainer = document.createElement("div");

      listContainer.className += " board";
      $element.html(listContainer);

      var listElement = document.createElement("ul");
      // add it to the page
      listContainer.appendChild(listElement);
      // Set up a loop that goes through the items in listItems one at a time
      var numberOfListItems = array.length;
      for (var i = 0; i < numberOfListItems; ++i) {
        // create a <li> for each one.
        var listItem = document.createElement("li");
        listItem.id = array[i];
        listItem.className = "tile tile-" + array[i];

        listItem.onclick = function () {
          myTile(this)
        };

        if(array[i] != 0)listItem.style.backgroundImage = 'url(' + $scope.$ctrl.image + ')';

        // add the item text
        listItem.innerHTML = " ";
        // add listItem to the listElement
        listElement.appendChild(listItem);
      }
    };

    function swapTiles(array) {
      //var tile = parseInt(prompt("Please enter a number to swap with 0"), 10);
      // identify the index position of my tile

      var tilePos = array.indexOf(tile);
      // identify the index position of the blank tile
      var blankPos = array.indexOf(0);
      //swap them over
      t = array[tilePos];
      array[tilePos] = array[blankPos];
      array[blankPos] = t;
    }

    function isSorted(array) {
      var len = array.length - 1;
      for (var i = 0; i < len; ++i) {
        if (array[i] > array[i + 1]) {
          return false;
        }
      }
      return true;
    }

    function makeMove() {
      swapTiles(tileList);
      $element.html('')
      makeTiles(tileList);

      //Test to see if they are sorted yet
      if (!isSorted(tileList)) {
      } else {
        $ionicPopup.alert({
          title: 'Richtig!'
        });
      }
    }

  }
});
