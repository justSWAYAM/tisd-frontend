// chat interface
import React from 'react'
import { auth } from '../firebase/config'

const Chat = () => {
    const userId = auth.currentUser?.uid;
    console.log('Current user ID:', userId);
  
    return (
        <div>Chat</div>
    )
}

export default Chat