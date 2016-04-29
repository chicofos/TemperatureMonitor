var express = require('express');
var app = express();
var http = require('http').Server(app);


var port = process.env.PORT || 3000;

var io = require('socket.io')(http);

var d = new Date();
var time = d.getTime() / 1000;

  var dataPoint = [ { 
          time: Date.now() / 1000, 
          y: 30 }
        ]
        
io.on('connection', function(socket){
  
  console.log('a user connected');
  
  var i = 20;
  
  //Initial emit
  socket.emit("temp", dataPoint);
       
  socket.on('recived', function(){
      

    i++;
    setTimeout(function() {

        var newPoint = [{ 
          time: Date.now()/1000, 
          y: i + 1 
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



 