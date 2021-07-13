const socket = io('/')
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById('videoGrid')
const myVideo = document.createElement('video')
myVideo.muted = true
let peers = {}, currentPeer = [];
let userlist= [];
let cUser;
const user = prompt("Enter your name to be displayed in meet");

var peer = new Peer()

const myPeer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: '5000',
})


let myVideoStream

let chatInputBox = document.getElementById("chat_message");
let all_messages = document.getElementById("all_messages");

navigator.mediaDevices  //by using this we can access user device media(audio, video)
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream
		addVideoStream(myVideo, stream)

		socket.on('user-connected', (userId) => {
			connectToNewUser(userId, stream)

		})

		peer.on('call', (call) => {  //here user system answer call and send there video stream to us
			call.answer(stream)        //via this send video stream to caller
			const video = document.createElement('video')
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream)
			})
			currentPeer.push(call.peerConnection);
			// Handle when the call finishes
			call.on('close', function(){
                video.remove();
                alert("The videocall has finished");
          });
		})


		document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (message, userName) => {
      all_messages.innerHTML =
    all_messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "you" : userName
        }
        ${new Date().toLocaleString('en-US', {
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
                  </span> </b>
        <span>${message}</span>
    </div>`;
      scrollToBottom()
    });
	})

socket.on('user-disconnected', (userId) => {
	if (peers[userId]) peers[userId].close()
})

//if someone try to join room
peer.on('open', (id) => {
	cUser = id;
	socket.emit('join-room', ROOM_ID, id,user)
})

const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream)  //we call new user and sended our video stream to him
	const video = document.createElement('video')
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream)  // Show stream in some video/canvas element.
	})
	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
	currentPeer.push(call.peerConnection);
}

const addVideoStream = (video, stream) => {
	video.srcObject = stream
	video.controls = true
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
	let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";

    }
  }
}



const inviteButton = document.querySelector("#inviteButton");


const scrollToBottom = () => {
	var d = $('.main__chat__window')
	d.scrollTop(d.prop('scrollHeight'))
}

//to Mute or Unmute Option method
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}

const setMuteButton = () => {
	const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const setUnmuteButton = () => {
	const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
	document.querySelector('.mainMuteButton').innerHTML = html
}

const playStop = () => {
	console.log('object')
	let enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		setStopVideo()
		myVideoStream.getVideoTracks()[0].enabled = true
	}
}

//Video ON or OFF
const setStopVideo = () => {
	const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

const setPlayVideo = () => {
	const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
	document.querySelector('.mainVideoButton').innerHTML = html
}

//code to share url of roomId
inviteButton.addEventListener("click", (e) => {
	try {
    navigator.clipboard.writeText(window.location.href);
  }
  catch (err) {
    console.error('Failed to copy: ', err);
  }
  alert(
    "Link Copied"
  );
});

//code for disconnect from client
const disconnectNow = ()=>{
    window.location = "/end";
}

const screenshare = () =>{
 navigator.mediaDevices.getDisplayMedia({
     video:{
       cursor:'always'
     },
     audio:{
            echoCancellation:true,
            noiseSupprission:true
     }

 }).then(stream =>{
     let videoTrack = stream.getVideoTracks()[0];
         videoTrack.onended = function(){
           stopScreenShare();
         }
         for (let x=0;x<currentPeer.length;x++){

           let sender = currentPeer[x].getSenders().find(function(s){
              return s.track.kind == videoTrack.kind;
            })

            sender.replaceTrack(videoTrack);
       }

  })

 }

//screenShare
function stopScreenShare(){
  let videoTrack = myVideoStream.getVideoTracks()[0];
  for (let x=0;x<currentPeer.length;x++){
          let sender = currentPeer[x].getSenders().find(function(s){
              return s.track.kind == videoTrack.kind;
            })
          sender.replaceTrack(videoTrack);
  }
}

//raised hand
const raisedHand = ()=>{
  const sysbol = "&#9995;";
  socket.emit('message', sysbol, user);
  unChangeHandLogo();
}

const unChangeHandLogo = ()=>{
  const html = `<i class="far fa-hand-paper" style="color:red;"></i>
                <span>Raised</span>`;
  document.querySelector('.raisedHand').innerHTML = html;
  console.log("chnage")
  changeHandLogo();
}

const changeHandLogo = ()=>{
  setInterval(function(){
    const html = `<i class="far fa-hand-paper" style="color:"white"></i>
                <span>Hand</span>`;
    document.querySelector('.raisedHand').innerHTML = html;
  },3000);
}
