import React, { useState } from 'react';
import IconMic from '../../icons/microphone/IconMic';
import IconMicOff from '../../icons/microphone/IconMicOff';
import IconVideo from '../../icons/video/IconVideo';
import IconVideoOff from '../../icons/video/IconVideoOff';
import IconScreen from '../../icons/IconScreenShare';
import CompilerPage from '../../pages/Compiler/index';
import IconEndMeet from '../../icons/IconEndMeet';

function MeetVideoControls({ mystream, setMystream, socketRef, roomId, reactNavigator }) {
  const [isMicOn, setMicOn] = useState(true);
  const [isVideoOn, setVideoOn] = useState(true);
  const [isCompiler, setCompiler] = useState(false);
  const [isCompilerVisible, setIsCompilerVisible] = useState(false);

  const toggleMic = () => {
    if (mystream) {
      const audioTrack = mystream.getTracks().find((track) => track.kind === "audio");
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);

        const updatedStream = new MediaStream([
          ...mystream.getAudioTracks(),
          ...mystream.getVideoTracks(),
        ]);
        setMystream(updatedStream);
      }
    }
  };

  const toggleVideo = () => {
    if (mystream) {
      const videoTrack = mystream.getTracks().find((track) => track.kind === "video");
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOn(videoTrack.enabled);

        const updatedStream = new MediaStream([
          ...mystream.getAudioTracks(),
          ...mystream.getVideoTracks(),
        ]);
        setMystream(updatedStream);
      }
    }
  };

  const toggleScreenSharing = () => {
    setCompiler(!isCompiler);
    setIsCompilerVisible(!isCompilerVisible);
  };

  const endCall = () => {
    reactNavigator('/meet-room');
  }

  return (
    <>
      <div className="flex gap-4 justify-center items-center">
        {/* Mic button */}
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none shadow-xl ${
            isMicOn 
              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <IconMic /> : <IconMicOff />}
        </button>

        {/* Video button */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none shadow-xl ${
            isVideoOn 
              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isVideoOn ? <IconVideo /> : <IconVideoOff />}
        </button>

        {/* Compiler button */}
        <button
          onClick={toggleScreenSharing}
          className={`p-4 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none shadow-xl ${
            isCompiler 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/50' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
          title="Toggle Code Compiler"
        >
          <IconScreen />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-700"></div>

        {/* End Call button */}
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-110 focus:outline-none shadow-xl shadow-red-500/30"
          title="Leave Meeting"
        >
          <IconEndMeet />
        </button>
      </div>

      {/* Compiler Modal */}
      {isCompilerVisible && (
        <CompilerPage 
          socketRef={socketRef} 
          roomId={roomId} 
          onClose={() => {
            setCompiler(false);
            setIsCompilerVisible(false);
          }}
        />
      )}
    </>
  );
}

export default MeetVideoControls;
