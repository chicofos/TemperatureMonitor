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
var lcd;

board.on("ready", function() {

 var temperature = new five.Thermometer({
    controller: "LM35",
    pin: "A0"
  });

  temperature.on("data", function() {
    //console.log(this.celsius + "°C");
    temp = this.celsius;
  });
  

lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [7, 8, 9, 10, 11, 12],
    backlight: 6,
    rows: 2,
    cols: 20
  });
  
  lcd.clear().cursor(0, 0).print("Temperature:");
  
  this.repl.inject({
    lcd: lcd
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
    lcd.cursor(1, 5).print(temp);
    res.render('temp');
});


http.listen(port, function(){
    console.log("server running on port %s", port);
});


io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.emit('temp', dataPoint);
  
  socket.on('recived', function(){
    setTimeout(function(){ 
       lcd.cursor(1, 5).print(temp + " C");
    socket.emit('temp', [ { 
        time: Date.now() / 1000, 
        y: temp }
      ]);
  }, 1000);
    
  });
  
});