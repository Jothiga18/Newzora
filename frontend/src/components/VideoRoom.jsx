import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { getAgoraToken } from '../services/api';

const VideoRoom = ({ channelName, onLeave }) => {
  const [users, setUsers] = useState([]);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

  useEffect(() => {
    if (!APP_ID) {
      setError('Agora App ID not configured');
      setIsConnecting(false);
      return;
    }

    initAgora();

    return () => {
      cleanup();
    };
  }, [channelName]);

  const initAgora = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get token from backend API
      const tokenResponse = await getAgoraToken(channelName, null, 'publisher');
      
      if (!tokenResponse.success) {
        throw new Error('Failed to get Agora token');
      }

      const { token, appId } = tokenResponse.data;

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Join channel with token from API
      await client.join(appId, channelName, token, null);

      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;

      // Play local video
      if (localVideoRef.current && videoTrack) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish local tracks
      await client.publish([audioTrack, videoTrack]);

      // Handle remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            const exists = prevUsers.find((u) => u.uid === user.uid);
            if (!exists) {
              return [...prevUsers, user];
            }
            return prevUsers;
          });
        }
        
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        }
      });

      client.on('user-left', (user) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      });

      setIsConnecting(false);
    } catch (err) {
      console.error('Agora connection error:', err);
      setError('Failed to connect to video call: ' + err.message);
      setIsConnecting(false);
    }
  };

  const cleanup = async () => {
    try {
      // Stop and close local tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!localAudioEnabled);
      setLocalAudioEnabled(!localAudioEnabled);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!localVideoEnabled);
      setLocalVideoEnabled(!localVideoEnabled);
    }
  };

  const handleLeave = async () => {
    await cleanup();
    if (onLeave) {
      onLeave();
    }
  };

  // Calculate grid layout
  const getGridClass = () => {
    const total = users.length + 1;
    if (total <= 1) return 'grid-cols-1';
    if (total === 2) return 'grid-cols-2';
    if (total <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Leave
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className={`grid ${getGridClass()} gap-4`}>
        {/* Local Video */}
        <div className="relative rounded-xl overflow-hidden bg-slate-700 aspect-video">
          {isConnecting ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full loading-spinner"></div>
            </div>
          ) : localVideoEnabled ? (
            <div ref={localVideoRef} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">You</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            You {localVideoEnabled ? '' : '(Camera off)'}
          </div>
        </div>

        {/* Remote Videos */}
        {users.map((user) => (
          <RemoteVideo key={user.uid} user={user} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${
            localAudioEnabled ? 'bg-slate-700' : 'bg-red-500'
          } text-white hover:opacity-80`}
          title={localAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {localAudioEnabled ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            localVideoEnabled ? 'bg-slate-700' : 'bg-red-500'
          } text-white hover:opacity-80`}
          title={localVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {localVideoEnabled ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
            </svg>
          )}
        </button>

        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
          title="Leave call"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Remote Video Component
const RemoteVideo = ({ user }) => {
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (user.hasVideo && videoRef.current) {
      user.videoTrack.play(videoRef.current);
      setHasVideo(true);
    }

    return () => {
      if (user.videoTrack) {
        user.videoTrack.stop();
      }
    };
  }, [user]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-700 aspect-video">
      {hasVideo ? (
        <div ref={videoRef} className="w-full h-full" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">U</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
        User {user.uid.toString().slice(-4)}
      </div>
    </div>
  );
};

export default VideoRoom;
