var releaseApp = angular.module('releaseApp', []);
releaseApp.controller('releaseCtrl', function($scope) {

  $scope.data = {
      tagSelect: [],
      statSelect: [],
      item: [],
      maxFix: 0,
      chosenFix: 0,
      unfixed: 0,
      isJewel: false,
      canEdit: true,
      canFinalize: false,
      canPush: false,
      itemPushed: ''
    };

    $scope.errors = {
      error0: "Type the name!",
      error1: "Pick one class!",
      error2: "Pick one rarity!",
      error3: "Pick one type!",
      error4: "",
      error5: "",
      error6: ""
    }

  $scope.changeName = function() {
    if ($scope.data.item.name == '') $scope.errors.error0 = "Type the name!";
    else $scope.errors.error0 = "";
    $scope.errorCheck();
  }

  $scope.changeOptions = function() {
    buff = $scope.data.tagSelect;
    isJewel = false;
    currType = '';
    classes = 0;
    rarities = 0;
    types = 0;

    for (i = 0; i < buff.length; i++) {
      switch (buff[i]) {
        case 'Any':
          classes++;
          currType = 'Any';
          break;
        case 'Dark Lord':
          classes++;
          currType = 'Dark Lord';
          break;
        case 'Blader':
          classes++;
          currType = 'Blader';
          break;
        case 'War Mage':
          classes++;
          currType = 'War Mage';
          break;
        case 'Whisperer':
          classes++;
          currType = 'Whisperer';
          break;
        case 'Ancient':
          rarities++;
          break;
        case 'Mythic':
          rarities++;
          break;
        case 'Set':
          rarities++;
          break;
        case 'Unique':
          rarities++;
          break;
        case 'Main Weapon':
          types++;
          break;
        case 'Secondary Weapon':
          types++;
          break;
        case 'Two-handed Weapon':
          types++;
          break;
        case 'One-handed Weapon':
          types++;
          break;
        case 'Helm':
          types++;
          break;
        case 'Chest':
          types++;
          break;
        case 'Pants':
          types++;
          break;
        case 'Shoulders':
          types++;
          break;
        case 'Gloves':
          types++;
          break;
        case 'Shoes':
          types++;
          break;
        case 'Necklace':
          types++;
          isJewel = true;
          break;
        case 'Earring':
          types++;
          isJewel = true;
          break;
        case 'Ring':
          types++;
          isJewel = true;
          break;
        default:
          break;
      }
    };
    if (isJewel && types == 1 && classes == 1 && currType != 'Any') $scope.errors.error4 = "Jewelry is Any class!";
    else $scope.errors.error4 = "";

    if (classes != 1) $scope.errors.error1 = "Pick one class!";
    else $scope.errors.error1 = "";
    if (rarities != 1) $scope.errors.error2 = "Pick one rarity!";
    else $scope.errors.error2 = "";
    if (types != 1) $scope.errors.error3 = "Pick one type!";
    else $scope.errors.error3 = "";

    if (isJewel) {
      $scope.data.isJewel = true;
      $scope.data.maxFix = 4
    } else {
      $scope.data.isJewel = false;
      $scope.data.maxFix = 3
    }

    $scope.changeAffix();
    $scope.errorCheck();
  }


  $scope.changeAffix = function() {
    buff = $scope.data.statSelect;
    isFilled = true;

    $scope.data.chosenFix = buff.length;
    $scope.data.unfixed = $scope.data.maxFix - $scope.data.chosenFix;

    if ($scope.data.unfixed < 0) $scope.errors.error6 = "Too many affixes!";
    else $scope.errors.error6 = "";

    for (i = 0; i < buff.length; i++) {
      if (buff[i].value == '') isFilled = false;
    }

    if (!isFilled) $scope.errors.error5 = "Fill out values!";
    else $scope.errors.error5 = "";
    $scope.errorCheck();
  }
  
  $scope.resetItem = function() {
    $scope.data.tagSelect = '';
    $scope.data.statSelect = '';
    $scope.data.item = [];
  };

  $scope.errorCheck = function() {
    buff = $scope.errors;
    areWeGut = true;
    angular.forEach(buff, function(item) {
      if (item != '') areWeGut = false;
    });

    if (areWeGut) $scope.data.canFinalize = true;
    else $scope.data.canFinalize = false;
  }

  $scope.checkItem = function() {
    biff = $scope.data.statSelect;
    for (i = 0; i < biff.length; i++) {
      biff[i].value = '+' + biff[i].value;
      if (biff[i].name != 'Attack' && biff[i].name != 'HP' && biff[i].name != 'HP Recovery per Second') {
        biff[i].value = biff[i].value + '%';
      }
    }

    if( $scope.data.unfixed > 0 ) {
      buff = { name: "Unfixed affixes", Value: $scope.data.unfixed }
    }

    $scope.data.statSelect = biff.concat(buff);
    $scope.data.canFinalize = false;
    $scope.data.canEdit = false;
    $scope.data.canPush = true;
  }

  $scope.pushItem = function() {
    $scope.data.itemPushed = "Thank you!";
  }

  $scope.resetItem = function() {
    $scope.data = {
      tagSelect: [],
      statSelect: [],
      item: [],
      maxFix: 0,
      chosenFix: 0,
      unfixed: 0,
      isJewel: false,
      canEdit: true,
      canFinalize: false,
      canPush: false,
      itemPushed: ''
    };

    $scope.errors = {
      error0: "Type the name!",
      error1: "Pick one class!",
      error2: "Pick one rarity!",
      error3: "Pick one type!",
      error4: "",
      error5: "",
      error6: ""
    }
  }

});