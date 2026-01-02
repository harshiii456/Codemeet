import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generateRoomId } from '../utils/roomIdGenerator';

function JoinRoom() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState(JSON.parse(localStorage.getItem("userDetails"))?.fullname || 'user');
    const [error, setError] = useState('');
    const [isNewRoom, setIsNewRoom] = useState(false);
    const [roomCheckInfo, setRoomCheckInfo] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const createRoomInDB = async (roomId) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ roomId })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create room');
            }

            return data;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    };

    const newRoom = async (e) => {
        e.preventDefault();
        const id = generateRoomId();
        
        try {
            // Create room in database
            await createRoomInDB(id);
            
            setRoomId(id);
            setError('');
            setIsNewRoom(true);
            toast.success('Room created! Share the ID with others.');
        } catch (error) {
            toast.error(error.message || 'Failed to create room. Please try again.');
            setError('Failed to create room. Please try again.');
        }
    };

    const checkRoomExists = async (roomId) => {
        try {
            setIsChecking(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/check/${roomId}`);
            const data = await response.json();
            
            if (data.statusCode === 200) {
                setRoomCheckInfo(data.data);
            } else {
                setRoomCheckInfo(null);
            }
            
            return data;
        } catch (error) {
            console.error('Error checking room:', error);
            setRoomCheckInfo(null);
            return null;
        } finally {
            setIsChecking(false);
        }
    };

    // Check room when roomId changes (debounced)
    useEffect(() => {
        if (roomId && roomId.length >= 10 && !isNewRoom) {
            const timer = setTimeout(() => {
                checkRoomExists(roomId);
            }, 500);

            return () => clearTimeout(timer);
        } else {
            setRoomCheckInfo(null);
        }
    }, [roomId, isNewRoom]);

    const join = async (e) => {
        e.preventDefault();

        if (!roomId || !userName) {
            toast.error("RoomId & Username required!");
            setError("Both Room ID and Username are required.");
            return;
        }

        // Check if room exists
        const roomCheck = await checkRoomExists(roomId);
        
        if (!roomCheck || roomCheck.statusCode === 404) {
            toast.error("Room does not exist. Please create a new room.");
            setError("Room does not exist. Please create a new room or check the Room ID.");
            return;
        }

        if (roomCheck.data?.isFull) {
            toast.error("Room is full. Cannot join.");
            setError("This room has reached its maximum capacity.");
            return;
        }

        console.log("Joining room with RoomId:", roomId, "and Username:", userName);
        navigate(`/meet-room/${roomId}`, {
            state: { userName , roomId },
        });
    };

    return (
        <div className="h-full bg-slate-950 flex justify-center items-center p-4">
            <div className="p-8 bg-slate-900 flex flex-col gap-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800 animate__animated animate__fadeIn">
                <div className="text-center">
                    <h1 className="text-white text-3xl font-bold mb-2">
                        Join Meeting
                    </h1>
                    <p className="text-slate-400 text-sm">Enter room details or create a new room</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-lg text-center text-sm animate__animated animate__shakeX">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Room ID</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter room ID or create new"
                                className={`w-full px-4 py-3 rounded-lg bg-slate-800 text-white border transition-all font-mono text-sm ${
                                    isNewRoom 
                                        ? 'border-green-500 focus:ring-2 focus:ring-green-500' 
                                        : 'border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                                }`}
                                onChange={(e) => {
                                    setRoomId(e.target.value);
                                    setIsNewRoom(false);
                                }}
                                value={roomId}
                            />
                            {roomId && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigator.clipboard.writeText(roomId);
                                        toast.success('Room ID copied!');
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all"
                                    title="Copy Room ID"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {/* Room Status Indicators */}
                        {roomId && isNewRoom && (
                            <div className="mt-2 p-2 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Room created! Share this ID with others
                                </p>
                            </div>
                        )}
                        
                        {/* Room Check Info */}
                        {isChecking && roomId && !isNewRoom && (
                            <div className="mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg">
                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Checking room...
                                </p>
                            </div>
                        )}
                        
                        {roomCheckInfo && !isNewRoom && (
                            <div className="mt-2 p-2 bg-indigo-500 bg-opacity-10 border border-indigo-500 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-indigo-400 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Room found
                                    </p>
                                    <span className="text-xs text-indigo-400">
                                        {roomCheckInfo.participantsCount} / {roomCheckInfo.maxParticipants} participants
                                    </span>
                                </div>
                                {roomCheckInfo.isFull && (
                                    <p className="text-xs text-red-400 mt-1">⚠️ Room is full</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            onChange={(e) => setUserName(e.target.value)}
                            value={userName}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Join Button */}
                    <button
                        onClick={join}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Join Room
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-slate-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* New Room Button */}
                    <button
                        onClick={newRoom}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Create New Room
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JoinRoom;
