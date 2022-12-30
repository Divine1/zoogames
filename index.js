const express = require("express");
const http = require("http");
const cors = require('cors')

const app = express();

app.use(cors())

const socket = require("socket.io");
const PORT = process.env.PORT || 80;
const expressServer = http.createServer(app);


app.use(express.static("public"));
app.get("/zoo/animal",(req,res)=>{
    res.send({"data" : Math.random()+"" });
});


const expressServerListen = expressServer.listen(PORT,()=>{
    console.log("listening in port ",PORT);
});



const socketApp = socket(expressServer,{
    cors:{
        origin:'*'
    }
});

socketApp.on("connection",function(socket){
    console.log("websocket connected ",socket.id);
    socketApp.emit("broadcastMessage", `${socket.id} is connected now`);

    socket.on("joinroom",(roomname)=>{
        console.log("joinroom roomname ",roomname);
        
        const rooms = socketApp.of("/").adapter.rooms;
        console.log("allrooms ",rooms," rooms.get ",rooms.get(roomname));
        if(rooms.get(roomname)){
            console.log("room already exists roomname ",roomname)
            socket.emit("joined",{ isroomexisting : true});
        }
        else{
            console.log("room doesnot exist.creating... roomname ",roomname)
            socket.emit("joined",{ isroomexisting : false});
        }
        socket.join(roomname);
    
        
    })

    socket.on("leaveroom",(roomname)=>{
        console.log("leaveroom roomname ",roomname);
        socket.leave(roomname);
        const rooms = socketApp.of("/").adapter.rooms;
        console.log("allrooms ",rooms," rooms.get ",rooms.get(roomname));
        socket.emit("leave");
    })

    socket.on("ready",(roomname)=>{
        // emit to all connected users in the room except current user
        console.log("ready event roomname ",roomname);

        socket.broadcast.to(roomname).emit("ready");
    })


    // requires ICE candidate and roomname
    socket.on("candidate",(candidate,roomname)=>{
        // emit to all connected users in the room except current user
        console.log("candidate event candidate ",candidate," roomname ",roomname);
        socket.broadcast.to(roomname).emit("candidate",candidate);
    })

    socket.on("offer",(offer,roomname)=>{
        // emit to all connected users in the room except current user
        console.log("offer event offer ",offer," roomname ",roomname);
        socket.broadcast.to(roomname).emit("offer",offer);
    })

    socket.on("answer",(answer,roomname)=>{
        // emit to all connected users in the room except current user
        console.log("answer event answer ",answer," roomname ",roomname);
        socket.broadcast.to(roomname).emit("answer",answer);
    })
/*
    socketApp.of("/").adapter.on("create-room", (room) => {
        console.log(`create-room room ${room} was created`);
      });
      
      socketApp.of("/").adapter.on("join-room", (room, id) => {
        console.log(`join-room socket ${id} has joined room ${room}`);
      });
      */


    socket.on("disconnect",()=>{
        console.log("websocket disconnected ",socket.id);
    })
});