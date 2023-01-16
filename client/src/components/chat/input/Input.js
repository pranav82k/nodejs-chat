import React from 'react'
import './Input.css';

const Input = ({ message, setMessage, sendMessage }) => {
    return (
        <form onSubmit={sendMessage} className='form'>
            <input type="text" className='input'
            placeholder='Enter a message'
            value={message}
            onChange={event => setMessage(event.target.value)}
            onKeyPress={event => event.key === 'ENTER' ? sendMessage : null} />
            <button className='sendButton'>Send Message</button>
        </form>
    )
}

export default Input