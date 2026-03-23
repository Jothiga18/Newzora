import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, leaveRoom } from '../services/api';
import socketService from '../services/socket';
import VideoRoom from '../components/VideoRoom';

// User Icon Component
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Copy Icon Component
const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  // Fetch room data
  const fetchRoomData = useCallback(async () => {
    try {
      const response = await getRoom(roomId);
      if (response.success) {
        setRoom(response.data);
        setParticipants(response.data.participants || []);
      }
    } catch (err) {
      console.error('Error fetching room:', err);
    }
  }, [roomId]);

  // Initialize on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    
    // Connect to socket
    socketService.connect();

    // Join the room via socket
    socketService.joinRoom(roomId, userData.id.toString(), userData.name);

    // Listen for user joined
    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      if (data.users) {
        setParticipants(data.users);
      }
      fetchRoomData();
    };

    // Listen for user left
    const handleUserLeft = (data) => {
      console.log('User left:', data);
      if (data.users) {
        setParticipants(data.users);
      }
      fetchRoomData();
    };

    // Listen for current room users
    const handleRoomUsers = (data) => {
      console.log('Room users:', data);
      if (data.users) {
        setParticipants(data.users);
      }
    };

    socketService.on('user_joined', handleUserJoined);
    socketService.on('user_left', handleUserLeft);
    socketService.on('room_users', handleRoomUsers);

    // Fetch initial room data
    fetchRoomData().then(() => setLoading(false));

    // Cleanup
    return () => {
      socketService.off('user_joined', handleUserJoined);
      socketService.off('user_left', handleUserLeft);
      socketService.off('room_users', handleRoomUsers);
      
      // Leave room via socket
      if (userData) {
        socketService.leaveRoom(roomId, userData.id.toString(), userData.name);
      }
    };
  }, [roomId, navigate, fetchRoomData]);

  const handleLeave = async () => {
    try {
      // Leave via API
      if (user) {
        await leaveRoom({ roomId, userId: user.id });
      }
    } catch (err) {
      console.error('Error leaving room:', err);
    }
    
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate placeholder video slots
  const maxSlots = room?.max_users || 6;
  const emptySlots = Math.max(0, maxSlots - participants.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-400">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Room Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium btn-transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeave}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">Discussion Room</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-400 text-sm font-mono">ID: {roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Copy Room ID"
                >
                  <CopyIcon />
                </button>
                {copied && <span className="text-green-400 text-xs">Copied!</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showVideo 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {showVideo ? 'Hide Video' : 'Show Video'}
            </button>
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-full">
              <UserIcon />
              <span className="text-white font-medium">
                {participants.length} / {room?.max_users || 10}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {showVideo ? (
            // Agora Video Room
            <VideoRoom 
              channelName={roomId} 
              onLeave={handleLeave} 
            />
          ) : (
            // Placeholder Video Grid (no Agora)
            <>
              {/* Video Grid Placeholder */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {/* Participant Videos */}
                {participants.map((participant) => (
                  <div
                    key={participant.userId || participant.id}
                    className="video-container relative rounded-xl overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-white">
                            {participant.userName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <p className="text-white font-medium">{participant.userName}</p>
                        <p className="text-slate-400 text-sm">Participant</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty Slots */}
                {[...Array(emptySlots)].map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="video-container relative rounded-xl overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-slate-500 text-sm">Waiting for participant...</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Participant List */}
              <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-bold text-lg mb-4">
                  Participants ({participants.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.userId || participant.id}
                      className="flex items-center gap-3 bg-slate-700 rounded-xl p-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {participant.userName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{participant.userName}</p>
                      </div>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="col-span-full text-center py-4 text-slate-500">
                      No participants yet. Share the Room ID to invite others!
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleLeave}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl btn-transition"
            >
              Leave Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;
