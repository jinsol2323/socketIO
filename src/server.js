import http from "http";
import SocktIO from "socket.io"
import { WebSocketServer } from 'ws';
import express from "express";
import path from "path";
import { connected } from "process";
import { Socket } from "dgram";
import { doesNotMatch } from "assert";


//express = views를 설정, render
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
//home.pug를 render해주는 router handler를 만듬
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (req,res)=> res.render("home"));
app.get("/*", (req,res)=>res.redirect("/"));


const handleListen = () => console.log(`Listening on http://localhost:3000`)


//같은 server에서 http, webSocker 둘 다 작동 시키기
//http서버 위에 webSocket 서버 만들기 
//localhost는 동일한 포트에서 http, ws request 두 개를 다 처리 가능
// http://localhost:3000'
// ws://localhost:3000'
const httpServer = http.createServer(app);
// const wss = new WebSocketServer({ server });

//localhost:3000/socket.io/socket.io.js
const wsServer = SocktIO(httpServer);

function publicRooms(){
    const {
        sockets:{
            adapter: {sids, rooms},
        },
    } = wsServer;
    // const sids = wsServer.sockets.adapter.sids;
    // const room = wsServer.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms;
}

function countRoom(roomName){
   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        // console.log(wsServer.sockets.adapter);
        console.log(`Socket Event:${event}`);
    });

    socket.on("enter_room", (roomName,showRoom) => {
        console.log(socket.rooms)
        socket.join(roomName);
        showRoom();
        socket.to(roomName).emit("welcome",socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("nickName", nickname => (socket["nickname"] = nickname));

    //socket.rooms > room의 id
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room => socket.to(room).emit("bye",socket.nickname, countRoom(room)-1));
    })

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
      });

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}:${msg}`);
        done();
    })
})


httpServer.listen(3000, handleListen);