//collection of transistions for gameblazer api
// 

(function(root) {
  var GBGraphics;
    
  root.GBGraphics = GBGraphics = window.GBGraphics || {};
 
  GBGraphics.renderCredit = function(credit) {
    // use icon and mini popup
    // position according to gb defaults
    var popup = document.createElement("div");
    popup.setAttribute("class", "gb-credit");
    popup.setAttribute("style", "position: absolute; top: " + gb.setup.creditTop + "; left: "+ gb.credit.creditLeft);
    popup.innerHTML = credit.name;
    var title = document.createElement("div");
    title.setAttribute("class", "gb-credit-title");
    var desc = document.createElement("div"); 
     desc.setAttribute("class", "gb-credit-desc"); 
     desc.innerHTML = credit.description;
 
    popup.appendChild(desc);
    var gameCont = gb.getGameContainer();
    mainCont.appendChild(popup);

    // dissapear after a timeout, by default
    setTimeout(function() {
        popup.remove();
    },gb.defaults.alertTimeout);
  }; 
  
})(window);
