//io function은 알아서 socket.io를 실행하고 있는 서버를 찾음
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");


room.hidden = true;
let roomName= "";


function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
  }

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
      addMessage(`You: ${value}`);
    });
    input.value = "";
  }


function handleNickNameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickName", input.value);
}

function showRoom(){
    welcome.hidden = true;
    room.hidden =false;
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName}`

    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit", handleNickNameSubmit);

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");

    //첫번째 argument event 이름
    //두번째 argument 보내고싶은 payload
    //세번째 argument 서버에서 호출하는 function
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value=""
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (enterUser, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`
    addMessage(`${enterUser} arrived!`);
})

socket.on("bye", (LeftUser, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName} (${newCount})`
    addMessage(`${LeftUser} left! ㅠㅠ`);
})



//addMessge = 같음 = (msg) => {addMessage(msg)};
socket.on("new_message", addMessage);


// //consol.log = 같음 = (msg) => consol.log(msg)
// socket.on("room_change" , console.log)

socket.on("room_change", (rooms)=>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML ="";

    if(rooms.length  === 0){
        roomList.innerHTML = "";
        return;
    }

    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
})