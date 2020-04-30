// to connect to psql from terminal: heroku pg:psql
// 8-bit characters error in terminal: run chcp 1252 before psql

// starting server
const express = require('express');
const app = express();
const serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(process.env.PORT || 4000);
console.log("Server is up & ready to mingle.");

// connecting to mongo database
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:admin@cluster-8aq0v.azure.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/*
client.connect(err => {
    const collection = client.db("LookingForAGroupDB").collection("Offers");
    // preform actions on collection
    collection.insertOne({Name: "Honza"}, function(err, resoult) {
        if(err) {
            console.log(err);
        }
        client.close();
    });
});
*/

// listening to incoming sockets from client
SOCKET_LIST = {};
const io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    console.log('Socket connection');

    socket.on('request', function() {
        client.connect(err => {
            const collection = client.db("LookingForAGroupDB").collection("Posts");
            var cursor = collection.find();
        
            cursor.each(function(err, item) {
                // If the item is null then the cursor is exhausted/empty and closed
                if(item == null) {
                    client.close(); // you may not want to close the DB if you have more code....
                    return;
                }
                // otherwise, do something with the item
                socket.emit('post', item);
            });
        });
    });

    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
    });
});