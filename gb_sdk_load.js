// a friendly javascript autoloader
//
// this should be used with gb_ files in this directory


var setupFiles = ['gb_graphics', 'gb_sdk'];
var scripts = document.getElementsByTagName("script");
for (var i in scripts) {
    if (scripts[i].tagName) {
    var reg = new RegExp("gb_sdk_load");
    if (reg.test(scripts[i].getAttribute("src"))) {
          var dir =  new RegExp("(.*)gb_sdk_load");
          var matches = scripts[i].getAttribute("src").match(dir);
          if (matches) {
            for (var j in setupFiles ) {
              var script = document.createElement("script");
              script.setAttribute("type", "text/javascript");
              script.setAttribute("src", matches[1]  + setupFiles[j] + ".js");
              document.body.appendChild(script);
            }
          }
    }
  }
} 


