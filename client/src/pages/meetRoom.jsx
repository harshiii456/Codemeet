import React, { useState, useEffect, useRef } from 'react'
import Participant from '../components/MeetParticipant/Participant.jsx';
import ChatBox from '../components/MeetChatbox/ChatBox.jsx';
import MeetVideoControls from '../components/MeetVideo/MeetVideoControls.jsx';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Action.js'
import toast from 'react-hot-toast';
import Avatar from 'react-avatar';
import IconChat from '../icons/IconChat.jsx';
import IconUsers from '../icons/IconUsers.jsx';

function meetRoom() {

  const socketRef = useRef(null);
  const location = useLocation();
  // const { roomId } = useParams();
  const reactNavigator = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mystream, setMystream] = useState(null);
  const [selectedButton, setSelectedButton] = useState('chat');
  const [participants, setParticipants] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [participantCountChanged, setParticipantCountChanged] = useState(false);

  //socket
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, Try again later.');
        reactNavigator('/');
      }

      // Listen for room errors
      socketRef.current.on('room-error', ({ message }) => {
        toast.error(message);
        setTimeout(() => {
          reactNavigator('/meet-room');
        }, 2000);
      });

      // Emit JOIN to the server
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId: location.state?.roomId,
        username: location.state?.userName,
        userId: JSON.parse(localStorage.getItem('userDetails'))?._id
      });

      // Listen for 'JOINED' event and update participants
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state.userName) {
          toast.success(`${username} joined the room`, {
            icon: '👋',
            duration: 3000,
          });
        }
        setParticipants(clients);
      });

      // Listen for 'DISCONNECTED' event when a user leaves
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast(`${username} left the room`, {
          icon: '👋',
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
          }
        });
        setParticipants((prev) => {
          return prev.filter(client => client.socketId !== socketId);
        });
      });

      // Listen for 'CHAT_MESSAGE' event 
      socketRef.current.on(ACTIONS.CHAT_MESSAGE, (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Listen for room info (initial and updates)
      socketRef.current.on('room-info', (info) => {
        setRoomInfo((prevInfo) => {
          // Show animation if participant count changed
          if (prevInfo && prevInfo.participantsCount !== info.participantsCount) {
            setParticipantCountChanged(true);
            setTimeout(() => setParticipantCountChanged(false), 1000);
          }
          return info;
        });
        console.log('Room info updated:', info);
      });

      // Listen for room closed event
      socketRef.current.on('room-closed', ({ message }) => {
        toast.error(message);
        setTimeout(() => {
          reactNavigator('/meet-room');
        }, 2000);
      });

      // Listen for code sync (when joining existing room with code)
      socketRef.current.on(ACTIONS.SYNC_CODE, ({ code, language }) => {
        console.log('Syncing code from room:', { code, language });
        // This will be used by the compiler component
      });

    };

    init();

    return () => {
      // Leave room explicitly before disconnecting
      if (socketRef.current && location.state?.roomId) {
        socketRef.current.emit(ACTIONS.LEAVE, { 
          roomId: location.state.roomId 
        });
      }
      
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.off(ACTIONS.CHAT_MESSAGE);
      socketRef.current?.off('room-error');
      socketRef.current?.off('room-info');
      socketRef.current?.off('room-closed');
      socketRef.current?.off(ACTIONS.SYNC_CODE);
    };

  }, []);




  if (!location.state) {
    return <Navigate to='/' />
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        username: location.state?.userName,
        text: newMessage,
        time: new Date().toLocaleTimeString(),
      };

      socketRef.current.emit(ACTIONS.CHAT_MESSAGE, {
        roomId: location.state?.roomId, // Room ID
        message, // The message content
      });

      setNewMessage('');
    }
  };

  const handleButtonClick = (buttonId) => {
    setSelectedButton(buttonId);
  };

  // Warn user before leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  return (
    <div className='h-screen w-screen bg-slate-950 flex flex-col p-3 gap-3'>
      {/* Room Info Bar */}
      {roomInfo && (
        <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm font-medium">Room: </span>
              <span className="text-indigo-400 font-mono text-sm font-semibold">{roomInfo.roomId}</span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className={`flex items-center gap-2 transition-all duration-300 ${participantCountChanged ? 'scale-110 text-indigo-400' : ''}`}>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className={`text-sm font-medium transition-colors ${participantCountChanged ? 'text-indigo-400' : 'text-slate-400'}`}>
                {roomInfo.participantsCount} / {roomInfo.maxParticipants}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomInfo.roomId);
              toast.success('Room ID copied!');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy ID
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className='flex-1 flex gap-3'>
        {/* Main Video Area */}
        <div className='flex-1 flex flex-col gap-3'>
          {/* Participants Grid */}
          <div className="flex-1 p-5 bg-slate-900 overflow-y-auto rounded-2xl shadow-2xl border border-slate-800">
          {participants.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              <p className="text-lg">Waiting for participants to join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-fit">
              {participants.map((participant, index) => (
                <div
                  key={participant.socketId}
                  className="relative w-full aspect-video rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 hover:ring-2 hover:ring-indigo-500 transform transition-all duration-300 animate__animated animate__fadeIn shadow-lg overflow-hidden"
                >
                  {/* Avatar Centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar
                      name={participant.username}
                      size="90"
                      round={true}
                      className="shadow-2xl"
                    />
                  </div>

                  {/* Username Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900 bg-opacity-90 backdrop-blur-sm border border-slate-700 shadow-lg">
                    <span className="font-semibold text-slate-100 text-sm">
                      {participant.username.trim()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="h-20 flex justify-center items-center bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 px-4">
          <MeetVideoControls
            mystream={mystream}
            setMystream={setMystream}
            socketRef={socketRef}
            roomId={location.state?.roomId}
            reactNavigator={reactNavigator}
          />
          </div>
        </div>

        {/* Sidebar: Chat & Participants */}
        <div className='w-96 flex flex-col gap-3'>
        {/* Tab Buttons */}
        <div className="flex gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-xl">
          <button
            onClick={() => handleButtonClick("chat")}
            className={`flex-1 flex justify-center items-center gap-2 py-3 font-semibold rounded-lg transition-all duration-300 ${
              selectedButton === "chat"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            <IconChat />
            <span className="text-sm">Chat</span>
          </button>

          <button
            onClick={() => handleButtonClick("participant")}
            className={`flex-1 flex justify-center items-center gap-2 py-3 font-semibold rounded-lg transition-all duration-300 ${
              selectedButton === "participant"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            <IconUsers />
            <span className="text-sm">People</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedButton === 'chat' ? (
            <ChatBox
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          ) : (
            <Participant participants={participants} />
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default meetRoom;
