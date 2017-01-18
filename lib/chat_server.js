var socketio = require('socket.io');
var io;
var guestNumber=1;
var nickNames={};
var namesUsed=[];
var currentRoom={};

exports.listen = function(server){
    io = socketio.listen(server);
    io.set('log level',1);
    io.sockets.on('connection',function(socket){
        guestNumber = assignGuestName(socket,guestNumber,nickNames,
        namesUsed);
        joinRoom(socket,'Lobby');
        handleMessageBroadcasting(socket,nickNames);
        handleNameChangeAttemps(socket,nickNames,namesUsed);
        handleRoomJoining(socket);

        socket.on('rooms',function(){socket.emit('rooms',io.sockets.manager.rooms);
        });
        handleClientDisconnection(socket,nickNames,namesUsed);
        
        });
    
    }


function assignGuestName(socket,guestNumber,nickNames,namesUsed){
    var name = '用户'+ guestNumber;
    nickNames[socket.id]=name;
    socket.emit('nameResult',{success:true,name:name});
    namesUsed.push(name);
    return guestNumber + 1;
    
    }


function joinRoom(socket,room){
    socket.join(room);
    currentRoom[socket.id]= room;
    socket.emit('加入房间结果',{room:room});
    socket.broadcast.to(room).emit('message',{text:nickNames[socket.id]+'已经加入'+room});

    var nsersInRoom = io.sockets.clients(room);
    if(usersInRoom.length>1){
        var usersInRoomSummary = 'Users currently in' + room + ':';
        for(var index in userInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index>0){
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
                usersInRoomSummary += '.';
                socket.emit('message',{text:usersInRoomSummary});
     }
    
    }

function handleMessageBroadcasting(socket){
    socket.on('message',function(message){
        socket.broadcast.to(message.room).emit('message',{
            text:nickNames[socket.id]+ ':' + message.text
            });
        });
    }



function handleRoomJoining(socket){
    socket.on('join',function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
        });
    
    }


function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
        
        });
    
    
    }




