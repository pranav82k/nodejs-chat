const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const authRoutes = require('./routes/authRoutes');

const corsOptions = {
    origin: 'http://localhost:3001', // or passing the * for allow all
    credentials: true,
    optionSuccessStatus: 200
}

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser())
app.use(express.json());

app.use(authRoutes);

const server = http.createServer(app);
const mongoose = require('mongoose');
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
    server.listen(PORT, () => {
        console.log(`Mongodb connected and port listening on ${PORT}`);
    });
}).catch((err) => console.log(err));

const { addUser, removeUser, getUser } = require('./helper');

const Room = require('./models/Room');
const Message = require('./models/Message');

app.get('/set-cookies', (req, res) => {
    res.cookie('username', 'pranav');
    res.cookie('authenticated', true, {httpOnly: true, maxAge: 24*60*60*1000});
    res.send('Cookie are set');
});

app.get('/get-cookies', (req, res) => {
    const cookies = req.cookies;
    res.send(cookies);
})

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001"
    }
});

io.on('connection', (socket) => {
    // console.log(socket.id);
    Room.find().then(result => {
        socket.emit('output-rooms', result);
    })

    socket.on('create-room', name => {
        // console.log(`Room Name: ${name}`);
        const room = new Room({name});
        room.save().then((result) => {
            // console.log(result);
            io.emit('room-created', result);
        })
    });

    socket.on('join', ({ name, room_id, user_id }) => {
        const { error, user } = addUser({
            socket_id: socket.id,
            name,
            room_id,
            user_id
        });

        // Join the room
        socket.join(room_id);
        
        if (error) {
            console.log('join error', error);
        } else {
            console.log('join user', user); 
        }
        // Message.find({ room_id }).then((result) => {
        //     socket.emit('previous-messages', result);
        // });
    })

    socket.on('sendMessage', (message, room_id, callback) => {
        // console.log('ID ', socket.id);
        const user = getUser(socket.id);
        if (user) {
            // console.log('check user', user); return;
            const msgToStore = {
                name: user.name,
                user_id: user.user_id,
                room_id,
                text: message
            }

            // console.log('message', msgToStore);
            const msg = new Message(msgToStore);
            msg.save().then((result) => {
                io.to(room_id).emit('message', result);
                // io.to(room_id).emit('message', msgToStore);
                callback();
            });
        }
        else {
            console.log('errr');
        }
    })

    socket.on('get-messages-history', room_id => {
        Message.find({ room_id }).then(result => {
            socket.emit('output-messages', result)
        })
    })

    socket.on('disconnect', () => {
        console.log('disconnect');
        const user = removeUser(socket.id);
    })
});


app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});