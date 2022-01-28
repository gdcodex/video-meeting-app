const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 8080;
//listen server
server.listen(port,console.log(`Server started on port ${port}`));

app.get('/', (req, res) => {
    res.send('Video meet app server: ');
});

io.on('connection', socket => {
    console.log('user connected');
    //when user joins a room
    socket.on('join-room', (roomId, userId, streamId) => {
        console.log(`${userId} has joined ${roomId}`);
        socket.join(roomId);
        //emit to all users in the room except the user who joined
        socket.to(roomId).emit('user-connected', userId);

        //on disconnect
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId, streamId);
          })
    })
})