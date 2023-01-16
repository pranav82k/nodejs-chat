import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../UserContext';
import { Navigate } from 'react-router-dom';
import RoomList from './RoomList';
import io from 'socket.io-client';

let socket;
const Home = () => {
    // console.log('Usercontext', useContext(UserContext));
    const ENDPT = 'localhost:5000';
    const { user, setUser } = useContext(UserContext);
    const [room, setRoom] = useState('');
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        socket = io(ENDPT);

        return () => {
            socket.disconnect();
            socket.off();
        }
    }, [ENDPT]);

    useEffect(() => {
        // console.log('console user', user);
        socket.on('output-rooms', rooms => {
            setRooms(rooms);
        })
    }, []);

    useEffect(() => {
        socket.on('room-created', room => {
            // console.log(room);
            setRooms([...rooms, room]);
        })
    }, [rooms])

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit('create-room', room);
        console.log(room);
        setRoom('');
    }

    // const setAsJohn = () => {
    //     const john = {
    //         name: 'John',
    //         email: 'john@email.com',
    //         password: 123,
    //         id: 1234
    //     }
    //     setUser(john);
    // }
    // const setAsTom = () => {
    //     const tom = {
    //         name: 'Tom',
    //         email: 'tom@email.com',
    //         password: 456,
    //         id: 4564
    //     }
    //     setUser(tom);
    // }

    if (!user) {
        return <Navigate to="/login" />
    }
    console.log("HOME", user);

    return (
        <div>
            <div className="row">
                <div className="col s12 m6">
                    <div className="card blue-grey darken-1">
                        <div className="card-content white-text">
                            <span className="card-title">Welcome {user ? user.name : ''}</span>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="input-field col s12">
                                        <input placeholder="Enter a Room Name" id="room" type="text" className="validate"
                                            value={room}
                                            onChange={e => setRoom(e.target.value)} />
                                        <label htmlFor="room">Room Name</label>
                                    </div>
                                </div>
                                <button className='btn'>Create Room</button>
                            </form>
                        </div>
                        <div className="card-action">
                            {/* <a href="#" onClick={setAsJohn}>set as John</a>
                            <a href="#" onClick={setAsTom}>set as Tom</a> */}
                        </div>
                    </div>
                </div>
                <div className='col s6 m5 offset-1'>
                    <RoomList rooms={rooms} />
                </div>
            </div>
        </div>
    )
}

export default Home