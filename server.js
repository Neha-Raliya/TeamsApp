const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
	debug: true,
})
const { v4: uuidv4 } = require('uuid')
const userS = [], userI = [];

app.use('/peerjs', peerServer)
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	res.render('auth')
})

app.get('/chat', (req, res) => {
	res.render('chat')
})

app.get('/randm', (req, res) => {
	res.redirect(`/${uuidv4()}`) //send uuid to client address bar
})

app.get('/end',(req,res)=>{
	res.render('end');
})

app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room }) //get id from address bar and send to ejs
})

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId, userName) => {
		userS.push(socket.id);
		userI.push(userId);
		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected', userId)

    //code to massage in roomId
		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userName)
		})
		socket.on('disconnect', () => {
			var i = userS.indexOf(socket.id);
	    	userS.splice(i, 1);
            socket.to(roomId).broadcast.emit('user-disconnected', userI[i]);
            //update array

            userI.splice(i, 1);
		})
		socket.on('seruI', () =>{
	    	socket.emit('all_users_inRoom', userI);
			//console.log(userS);
		    console.log(userI);
	    });
	})
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
