var express = require('express');
var five  = require("johnny-five");
var app = express();
var http = require('http').Server(app);

var port = process.env.PORT || 3000;

var io = require('socket.io')(http);


var dataPoint = [ { 
        time: Date.now() / 1000, 
        y: 0 }
      ]
  
var board = new five.Board({port : 'COM3'});

var temp = 0;

board.on("ready", function() {
  
// var virtual = new five.Board.Virtual(
//     new five.Expander("MCP23017")
//   );
  

 var temperature = new five.Thermometer({
    controller: "LM35",
    pin: "A0"
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C");
    temp = this.celsius;
  });
  
});
      
io.on('connection', function(socket){
  
  console.log('a user connected');
  

  //Initial emit
  socket.emit("temp", dataPoint);
       
  socket.on('recived', function(){
      
    setTimeout(function() {

        var newPoint = [{ 
          time: Date.now()/1000, 
          y: temp 
        }];
        
        socket.emit("temp", newPoint);
        
    }, 1000);
    
  });
  
});


//view engine
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

//Middleware
app.use(express.static(__dirname + '/public'));

//Routes
app.get('/', function(req, res){
    //get initial temperature
    res.render('temp', { temp: 20 });
});


http.listen(port, function(){
    console.log("server running on port %s", port);
});

//realtime 
//io(server);



 