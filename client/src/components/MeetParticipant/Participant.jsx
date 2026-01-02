import React from 'react';
import Avatar from 'react-avatar';


function Participant({ participants }) {

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h3 className="text-base font-semibold text-slate-200">
          Participants ({participants.length})
        </h3>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">No participants yet</p>
          </div>
        ) : (
          participants.map((user, index) => (
            <div
              key={user.socketId}
              className="flex items-center justify-between p-3.5 bg-slate-800 rounded-lg shadow-md hover:bg-slate-750 hover:shadow-lg transition-all duration-200 animate__animated animate__fadeInUp animate__faster"
            >
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <Avatar name={user.username} size={48} round={true} />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800 animate-pulse" title="Online"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-slate-100">
                    {user.username}
                  </span>
                  <span className="text-xs text-slate-500">Active now</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
}

export default Participant;