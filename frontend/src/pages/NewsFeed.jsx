import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews, createRoom, joinRoom } from '../services/api';

// Icons as SVG components
const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full loading-spinner"></div>
  </div>
);

const NewsCard = ({ news, onCreateRoom, onJoinRoom }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      onJoinRoom(joinRoomId.trim().toUpperCase());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden card-hover">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={news.image_url || 'https://via.placeholder.com/800x400?text=News'} 
          alt={news.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
          {news.title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {news.content}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onCreateRoom(news.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl btn-transition"
          >
            <VideoIcon />
            Create Room
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl btn-transition"
          >
            <UsersIcon />
            Join Room
          </button>
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setShowJoinModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Join Discussion Room</h3>
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl mb-4 text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={8}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 btn-transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl btn-transition"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ mode, newsId, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    onSubmit({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-slide-up">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {mode === 'create' ? 'Create Discussion Room' : 'Join Discussion Room'}
        </h3>
        <p className="text-slate-600 text-sm mb-4">
          Enter your details to {mode === 'create' ? 'host' : 'join'} the discussion
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="John Doe"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="john@example.com"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 btn-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl btn-transition"
            >
              {mode === 'create' ? 'Create' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [pendingRoomId, setPendingRoomId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNews();
      if (response.success) {
        setNews(response.data);
      }
    } catch (err) {
      setError('Failed to load news. Please make sure the backend server is running.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = (newsId) => {
    setSelectedNewsId(newsId);
    setModalMode('create');
    setPendingRoomId(null);
    setShowUserModal(true);
  };

  const handleJoinRoom = (roomId) => {
    setModalMode('join');
    setSelectedNewsId(null);
    setPendingRoomId(roomId);
    setShowUserModal(true);
  };

  const handleUserSubmit = async (userInfo) => {
    try {
      setSubmitError('');
      
      if (modalMode === 'create') {
        const response = await createRoom({
          newsId: selectedNewsId,
          hostName: userInfo.name,
          hostEmail: userInfo.email,
        });
        
        if (response.success) {
          setShowUserModal(false);
          sessionStorage.setItem('user', JSON.stringify(response.data.host));
          navigate(`/room/${response.data.id}`);
        }
      } else {
        const response = await joinRoom({
          roomId: pendingRoomId,
          userName: userInfo.name,
          userEmail: userInfo.email,
        });
        
        if (response.success) {
          setShowUserModal(false);
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
          navigate(`/room/${pendingRoomId}`);
        }
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error:', err);
    }
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSubmitError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">NewZora</h1>
                <p className="text-sm text-slate-500">News Discussion Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Latest News</h2>
          <p className="text-slate-600">Join live video discussions about the stories that matter</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchNews}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 btn-transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
              />
            ))}
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No news articles available</p>
          </div>
        )}
      </main>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          mode={modalMode}
          newsId={selectedNewsId}
          onSubmit={handleUserSubmit}
          onClose={handleCloseModal}
          error={submitError}
        />
      )}
    </div>
  );
};

export default NewsFeed;
