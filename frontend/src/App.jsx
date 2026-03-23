import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewsFeed from './pages/NewsFeed';
import Room from './pages/Room';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<NewsFeed />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
