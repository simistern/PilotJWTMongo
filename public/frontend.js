
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
    //console.log("Checking client ticket " + JSON.stringify($scope.login));
    $http({
      "method": "POST",
      "url": "/api/authenticate",
      "data":{
        "client": $scope.login
      }
    }).then(function(res){
      console.log("Checking token first time " + JSON.stringify(res.data.token));
      $scope.accessToken = res.data.token;
      $scope.goToAdminPanel(res.data.token);
      //window.location.assign("/superadminpanel.html");
      //alert("user Logged in!");
    }, function(err){
      alert("Please try again");
    })
  }

  $scope.goToAdminPanel = function(token){
    console.log("Checking token second time " + JSON.stringify(token));
    $http({
      "method": "GET",
      "url" : "/api/superadmin",
      "data" : token
    }).then(function(res){
        console.log("Checking response this time " + JSON.stringify(res))
    })
  }
});
