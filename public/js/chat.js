
var firebaseConfig = {
  apiKey: "AIzaSyA95T4VqAonLg6MZhZ3hYPRXW17nB373ZM",
    authDomain: "chatapp-e7315.firebaseapp.com",
    databaseURL: "https://chatapp-e7315-default-rtdb.firebaseio.com",
    projectId: "chatapp-e7315",
    storageBucket: "chatapp-e7315.appspot.com",
    messagingSenderId: "228175290998",
    appId: "1:228175290998:web:2f8b65e4aab83416517557"
};

firebase.initializeApp(firebaseConfig);


const db = firebase.database();

// get user's data
// var username = prompt("Please enter your name");
var username = localStorage.getItem('myCat'); ;



// submit form
// listen for submit event on the form and call the postChat function
document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
function sendMessage(e) {
  e.preventDefault();


  // get values to be submitted
  const timestamp = Date.now();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value;


  // clear the input box
  messageInput.value = "";


  document
    .getElementById("messages")
    .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

  // create db collection and send in the data
  db.ref("messages/" + timestamp).set({
    username,
    message
  });
}

// display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.on("child_added", function (snapshot) {
  const messages = snapshot.val();
  const message = `<li class= ${
    username === messages.username ? "sent" : "receive"
  }><b><span>${messages.username} </span></b> <br>
                  <span>${messages.message}</span>

                  </li>`;

  document.getElementById("messages").innerHTML += message;

});

function meet(){
  window.location="/kwjwqjd-qsdnd";
}

function newmeet(){
  window.location="/randm";
}
