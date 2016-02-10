
var app = angular.module("pilotLogin", []);
app.controller("controller", function($scope, $http, $location){
  $scope.signup = {
    "clientId":"",
    "clientSecret":"",
    "grantType": "undeclared",
  }
  $scope.login = {
    "clientId": "",
    "clientSecret":"",
    "grantType": "undeclared"
  }

  $scope.signupEvent = function() {
    $http({
      "method": "POST",
      "url": "/api/register",
      "data": $scope.signup
    }).then(function(res){
      $scope.signup = {
        "clientId" : "",
        "clientSecret" : "",
        "grantType": "customer",
      }
      alert("User signed up!");
    }, function(err){
      alert("There was an error! " + JSON.stringify(err));
    })
  }

  $scope.loginEvent = function(){
    $http({
      "method": "POST",
      "url": "/login",
      "data":{
        "client": $scope.login
      }
    }).then(function(res){
      $scope.accessToken = res.data.accessToken;
      console.log("checking access token " + $scope.accessToken);
      if($scope.login.grantType == "customer"){
        //window.location.assign("/clientticketsubmit.html");
    }else if($scope.login.grantType == "admin"){
      // window.location.assign("/ticketadminpage.html");
    }
    else{
        console.log("Checking client ticket " + JSON.stringify($scope.login));
        //alert("Sorry you are not customer");
      }
      //alert("user Logged in!");
    }, function(err){
      alert("Please try again");
    })
  }
})
