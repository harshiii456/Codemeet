const ACTIONS = {
    JOIN: 'join',                 // When a user joins a room
    JOINED: 'joined',             // When a user is successfully connected to a room
    DISCONNECTED: 'disconnected', // When a user disconnects
    CODE_CHANGE: 'code-change',   // Collaborative code editor change
    SYNC_CODE: 'sync-code',       // Synchronize code with new participants
    LEAVE: 'leave',               // When a user leaves the room
    CHAT_MESSAGE: 'chat-message', // For sending/receiving chat messages
    NEW_PARTICIPANT: 'new-participant', // Notify when a new participant joins

};

export default ACTIONS;
