/* Gameblazer Javascript SDK 1.0.
 * Copyright (c) 2013 Gameblazer. All rights reserved.  * This library can be copied/used under an MIT license   */
 
/* This library holds information that can be distributed; copied free of charge.
 * Authors: Nadir Hamid et the Gameblazer team.
 */

(function () {
  window.assert = function(cond) { return cond ? cond : console.log('!Assertion Error' + cond); };
  window.object = function(type) { return typeof type === 'object' ? true : false; };
  window.string = function(type) { return typeof type === 'string' ? true : false; };
  window.number = function(type) { return typeof type === 'number' ? true : false; };
  window.array = function(type) { return typeof type === 'array' ? true : false; };
  window.bool = function(type) { return !!type === type ? true : false; };
  window.function = function(type) { return typeof type === 'function' ? true : false; };
  window.unset = function(type) { return typeof type === 'undefined' ? true : false; };
  window.same = function(type1, type2) { return typeof type1 === typeof type2 ? true : false; };
  window.pure = function(type1, type2) { }; 
  window.either = function(value1, value2, value3) { return value1 === value2 || value1 === value3 ? true : false; }
  window.both = function(value1, value2, value3) { return value1 === value2 && value1 === value3 ? true : false; }
  window.posseses = function(value, type) {  }; 
  window.real = function(type) { };
  window.convertable = function(value) { // optimize maybe
    var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return '';
  }
}).call(this);

(function () {
  var root = this;
  var Gameblazer;
  if (typeof exports !== 'undefined')
    Gameblazer = exports;
  else
    Gameblazer = root.Gameblazer = {};

  Gameblazer.VERSION = '0.0.1';
  Gameblazer.base = {};
  Gameblazer.setup = {};
  Gameblazer.apihome = 'https://gameblazer.net/api/';
  Gameblazer.home = window.APPLICATION_BASE || 'https://gameblazer.net/api/';
  Gameblazer.player = {}; // main player is always at root of this. 
  Gameblazer.received = 0; // cross window communication signal.
  Gameblazer.endpoints = ['credits', 'login', 'logout']; // list of valid endpoints
  Gameblazer.authToken = ""; // our OAUTH token
  Gameblazer.icon = "";
  Gameblazer.useGBGraphics = true;
  
  // open the oauth grant for the current client
  // @param q -> area to open
  Gameblazer.open = function(q) { 
  	q = q || '';
  	return window.open(Gameblazer.apihome + q, 'Gameblazer OAuth Grant', 'left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
  };

  // message passing between two or more endpoints(domains)
  // this is used to get and set cookies, etc.
  // @param e -> post message event object
  Gameblazer.message = function(e) {
  	if (e.origin) {}
    if (e.data !== 'idle') { 
      Gameblazer.received = 1; 
      // assuming it is stringified by the popup
      Gameblazer.player = JSON.parse(e.data);
    }
  };

  window.addEventListener('message', Gameblazer.message, false);

  Gameblazer.makeIframe = function() {
  	var iframe = document.createElement('iframe');
  	iframe.setAttribute('src', 'https://gameblazer.net/');					
  	iframe.setAttribute('id', 'gb_user_frame');
  	iframe.style.width = '0px';
  	iframe.style.border = '0';
  	iframe.style.height = '0px';
  	document.body.appendChild(iframe);
  };

  // Whenever client side requests are made, this is usually invoked.
  // it checks for a cookie in the browser
  // marked by gb_someuniqueid. This cookie contains information of
  // the authenticated user.
  Gameblazer.fetchCookie = function() {
  };

  // Simply check the configuration for
  // the provided set of rules.
  Gameblazer.check = function() {
    return (unset(Gameblazer.setup.pubKey) || unset(Gameblazer.setup.gameId)) ? false :
    	   ((Gameblazer.setup.processed) = true && (Gameblazer.setup.legal = true));
  };

  // Initiaize the api with the provided
  // set of options. Ideally this includes the game id and 
  // public key. Implementors musn't expose their private key here
  // or anywhere in the javascript sdk.
  // @param client -> gameblazer api object
  Gameblazer.init = function(client) {
  	Gameblazer.setup.pubKey = client['pubKey'] || ''; // mandatory
  	Gameblazer.setup.gameId = client['gameId'] || ''; // which game is the sdk running on
  	Gameblazer.setup.cookies = client['cookies'] || true; // true or false. Not mandated.
    Gameblazer.setup.gbGraphics = client['gbGraphics'] || false;
    if (typeof client['gameContainer'] !== 'undefined') {
        if (typeof window['$'] !== 'undefined') {
            if (typeof client.gameContainer.get === 'undefined') {
                  Gameblazer.setup.gameContainer = client.gameContainer;
            } else { // try jquery
                  Gameblazer.setup.gameContainer = client.gameContainer.get()[0];
            }
        } else {
            Gameblazer.setup.gameContainer = client.gameContainer;
        }
    }

  	return {
  		setup: function() {
  			return Gameblazer.check();
  		}
  	}
  };

  // Login to the Gameblazer platform. This simply
  // takes a callback which has an arity of /1.
  // containing the requested 'scope' of information.
  // which can also be set in the second parameter 
  // of this function -- analagous to facebook.
  // @param callback -> function [response -> user defined response]
  // @param scope -> permission scope
  Gameblazer.login = function(callback, scope) {
  	assert(Gameblazer.setup.processed);
  	assert(Gameblazer.setup.legal);
  	var win = Gameblazer.open('?pubkey=' + Gameblazer.setup.pubKey + '&gameId=' + Gameblazer.setup.gameId + '&scope=' + scope.scope);

  	// here we wait for the cookie or localstorage object
  	// to be set
  	// there are three types of responses. 
  	// 1 -> the user has logged in and the scope is minimal
  	// meaning there will no further computations needed.
  	// 2 -> the user isn't logged in and the game requests
  	// 3 -> request isn't granted.
  	var I = window.setInterval(function() {
  	  win.postMessage('waiting on response', Gameblazer.apihome);


      // by now the client has either logged into the game or canceled
      // the request. We analyze what happened here.
      // if the permissions were granted, we can invoke
      // the callback -- if not, we'll warn the implementor.
      // callback's response is stored in Gameblazer.player
      if (Gameblazer.received && Gameblazer.player) {
        window.clearInterval(I);
        //
        // set the oauth token
        Gameblazer.authToken = Gameblazer.player.authToken;
        Gameblazer.game  = Gameblazer.player.game;
        callback(Gameblazer.player);
      }
  	}, 1000);
  };

  Gameblazer.getAuthToken = function() {
    return Gameblazer.authToken;
  };

  Gameblazer.setAuthToken = function(token) {
    Gameblazer.authToken =  token;
  };
  // check agaisnt what was asked in our login
  // scope
  // return a list of things that were accepted
  // @param params -> list of params to check
  Gameblazer.hasAuthFor = function(params) {
    // no auth at all
    if (!Gameblazer.authToken) {
      return false; 
    }
    var acceptedList = [];
    assert(Gameblazer.setup.processed);
    assert(Gameblazer.setup.legal);
    for (var i in Gameblazer.authAccepted) {
      for (var j in params) {
        if (Gameblazer.authAccepted[i] === params[j]) {
          acceptedList.push(params[j]);
        }
      }
    }
    return acceptedList;
  };
  // credit based callback
  //  needs the following:
  // name, description and amount
  // optinally specify the id of the credit
  // as made in the gb developer interface
  //
  // @param opts -> list of options for this credit
  // @param callback -> callback onsuccess or error
  Gameblazer.credit = function(opts, callback) {
    assert(Gameblazer.setup.processed);
    assert(Gameblazer.setup.legal);
    if (Gameblazer.hasAuthFor(['credit', 'login'])) {

      // start a request to the credit
      // endpoint with this credit information
      //
      opts['user_id'] = Gameblazer.player.uid;
      opts['game_id'] = Gameblazer.setup.gameId;
      Gameblazer.request("credits", opts, function(data_received) {
        Gameblazer.afterwards(data_received);
        callback(data_received);
        
      });
    } 
  };

  // basic highscore manipulation 
  // add a highscore or fetch a list of high
  // scores
  //

  Gameblazer.highscores = function(opts, callback) {
    assert(Gameblazer.setup.processed);
    assert(Gameblazer.setup.legal);
    if (typeof opts.action !=='undefined') {
      if (opts.action =='add') {
          // use the current game in creating
          // a new highscore
          if (Gameblazer.hasAuthFor(['highscores'])) {
              opts['user_id'] = Gameblazer.player.uid; 
              opts['game_id'] = Gameblazer.setup.gameId;
              opts['action'] = "add";
              Gameblazer.request("highscores", opts, function(data) {
                  return callback(data); 
              });
          }
      } else {
          // list needs an offset 
          // it can be 0 .. 1000
          //
          opts = {};
          opts['game_id'] = Gameblazer.setup.gameId;
          opts['sort_by'] = opts['sort_by'] || "score";
          opts['action'] = "list";

           Gameblazer.request("highscores", opts, function(data) {
                return callback(data);
            });
         }
      } else {
        Gameblazer.warn("You need to specify 'action'");
      }

  };
  

  // requests on the private API
  //
  // method -> GET | POST only
  // endpoint -> valid endpoint in Gameblazer see gb.endpoints
  // data -> Javascript object
  // callback -> function
  Gameblazer.request = function(method, endpoint, data, callback) {
    var xhr = new XMLHttpRequest, parameterString; 

    xhr.onreadystatechange = function() {
      if (this.readyState === "4") {
        Gameblazer.callbackInternal(this.responseText, callback, true);
      } 
    };
    if (method === "POST") {
      for (var i in data) {
        parameterString +=  i + "=" + data[i] + '&';
      }   
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("Authorization", "Bearer " + Gameblazer.authToken);
      xhr.open(method, Gameblazer.apihome + endpoint + "/", parameterString, false /** async **/);
      xhr.send(parameterString);
    } else { // get
      parameterString = "?";
      for (var i in data) {
        parameterString += i + "=" + data[i];
      }
      xhr.open(method, Gameblazer.apihome + "/_request/" + "?endpoint=" +  endpoint + "/" + parameterString, false /** async **/);

      xhr.setRequestHeader("Authorization", "Bearer " + Gameblazer.authToken);
      xhr.send();
    }

  };

  // data should be unserialized
  //
  Gameblazer.callbackInternal = function(data, callback, success) {
      var dataSerialized = JSON.parse(data);
      return callback(dataSerialized);
  }

  Gameblazer.getGameContainer = function() {
      if (Gameblazer.setup.gameContainer) {
      // saetup with jQuery friendly
      return typeof $ !== 'undefined' ? $(Gameblazer.setup.gameContainer) : Gameblazer.setup.gameContainer;
      }
      // warn by default 
      //Throw("You need to set the Gameblazer.setup.mainContainer to use this");
  };


  // Simply request a logout for the user.
  // @param callback -> function [response -> user defined response]
  Gameblazer.logout = function(callback) {
    assert(Gameblazer.player);
    Gameblazer.request("logout", function(data) {
      callback(data);
    });
  };
  
  // right after the api has been hit
  // either use the gbgraphics or not
  // 
  // can only be called on success
  Gameblazer.afterwards = function(data) {
    if (data.status) {
      if (Gameblazer.setup.gbGraphics) {
            // what is it?
            if (data.type_of_object === "credits") {
                GBGraphics.renderCredit(data);
            }
        }
      }
    };

  Gameblazer.set = function(key, val) {
      Gameblazer.setup[key] = val;
  };
  // Stub to the AdConn. This basically allows
  // the implementor to design an ad and have it served
  // @param options -> ad based options 
  Gameblazer.ad = function(options) {
  	assert(Gameblazer.setup.processed);
  	assert(Gameblazer.setup.legal);

  	return {
  		// set up the ad with the provided options.
  		// this simply adds a callback to the setup whose
  		// first parameter is the DOM element of the newly created
  		// ad.
  		setup: function() {

  		}
  	}
  };

  gb = GB = Gameblazer;
}).call(this);
