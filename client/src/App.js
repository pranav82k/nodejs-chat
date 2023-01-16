import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { UserContext } from './UserContext';

import Chat from './components/chat/Chat';
import Home from './components/home/Home';
import Navbar from './components/layout/Navbar';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const verifyUser = async() => {
      try {
        const res = await fetch("http://localhost:5000/verifyuser", {
          credentials: 'include',
          headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        if(data.user) {
          setUser(data?.user)
        } else {
          console.log(data.error);
        }
      } catch (error) {
        console.log(error);
        // cookies.remove("jwt");
        // setUser(null);
      }
    }
    verifyUser();
  }, [])
  
  return (
    <Router>
      <div className="App">
        <UserContext.Provider value={{ user, setUser }}>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/chat/:room_id' element={<Chat />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
