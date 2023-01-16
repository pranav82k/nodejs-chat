import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../UserContext'
import { useParams, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Messages from './messages/Messages';
import Input from './input/Input';
import './Chat.css';

let socket;
const Chat = () => {
    const ENDPT = 'localhost:5000';

    const { user, setUser } = useContext(UserContext);
    let { room_id } = useParams();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        console.log('chat page', user);
        socket = io(ENDPT);
        socket.emit('join', { name: user.name, room_id, user_id: user._id });
    }, []);

    // useEffect(() => {
    //     socket.on('previous-messages', messages => {
    //         setMessages(messages);
    //     })
    // }, [])

    useEffect(() => {
        socket.on('message', message => {
            setMessages([...messages, message]);
        })
    }, [messages])

    useEffect(() => {
        socket.emit('get-messages-history', room_id)
        socket.on('output-messages', messages => {
            setMessages(messages)
        })
    }, [])

    const sendMessage = (e) => {
        e.preventDefault();
        if (message) {
            // console.log(message);
            // socket.emit('sendMessage', { message, room_id }, () => setMessage(''));
            socket.emit('sendMessage', message, room_id, () => setMessage(''));
        }
    }

    if(!user) return <Navigate to="/login" />;

    return (
        <div className='outerContainer'>
            <div className='container'>
                <Messages messages={messages} user_id={user._id} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                {/* <div>{room_id} {room_name}</div> */}
                {/* <h1>Chat: {JSON.stringify(user)}</h1> */}
            </div>
        </div>
    )
}

export default Chat