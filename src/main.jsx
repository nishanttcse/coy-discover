import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function HeartIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.4-4.35-9.55-8.45C.5 8.9 2.63 5 6.7 5c2.12 0 3.76 1.2 5.3 3.02C13.54 6.2 15.18 5 17.3 5c4.07 0 6.2 3.9 4.25 7.55C19.4 16.65 12 21 12 21Z" />
    </svg>
  );
}

function ProfileCard({ profile, onSwipe }) {
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [exit, setExit] = useState('');
  const startX = useRef(0);

  const pointerDown = (event) => {
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, active: true });
  };

  const pointerMove = (event) => {
    if (!drag.active) return;
    setDrag({ x: event.clientX - startX.current, active: true });
  };

  const pointerUp = () => {
    if (!drag.active) return;
    if (Math.abs(drag.x) > 90) {
      swipe(drag.x > 0 ? 'like' : 'pass');
    } else {
      setDrag({ x: 0, active: false });
    }
  };

  const swipe = (action) => {
    setDrag({ x: 0, active: false });
    setExit(action === 'like' ? 'exit-right' : 'exit-left');
    window.setTimeout(() => onSwipe(profile.id, action), 260);
  };

  const rotation = drag.x / 18;

  return (
    <article
      className={`profile-card ${exit}`}
      style={{
        transform: exit ? undefined : `translateX(${drag.x}px) rotate(${rotation}deg)`
      }}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={() => setDrag({ x: 0, active: false })}
    >
      <div className="photo-wrap">
        <img src={profile.photo} alt={profile.name} draggable="false" />
        <div className={`swipe-label like ${drag.x > 40 ? 'visible' : ''}`}>LIKE</div>
        <div className={`swipe-label pass ${drag.x < -40 ? 'visible' : ''}`}>PASS</div>
        <div className="photo-gradient" />
        <div className="profile-info">
          <h2>{profile.name}, {profile.age}</h2>
          <p className="location"><span>⌖</span> {profile.city}</p>
        </div>
      </div>
      <div className="profile-details">
        <p className="bio">{profile.bio}</p>
        <div className="interests">
          {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
        </div>
      </div>
      <div className="action-row">
        <button className="action-button pass-button" onClick={() => swipe('pass')} aria-label="Pass">
          <span>×</span>
        </button>
        <button className="action-button like-button" onClick={() => swipe('like')} aria-label="Like">
          <HeartIcon />
        </button>
      </div>
    </article>
  );
}

function Discover() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);

  const loadFeed = () => {
    fetch('/feed')
      .then((res) => res.json())
      .then((profiles) => setFeed(profiles))
      .finally(() => setLoading(false));
  };

  useEffect(loadFeed, []);

  const handleSwipe = async (profileId, action) => {
    const res = await fetch('/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, action })
    });
    const result = await res.json();
    setFeed((current) => current.slice(1));
    if (result.match) {
      setMatch(feed[0]);
    }
  };

  if (loading) return <main className="center-state"><div className="loader" /></main>;

  return (
    <main className="discover-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Discover</p>
          <h1>Meet someone new</h1>
        </div>
        <button className="filter-button" aria-label="Filters">☷</button>
      </header>

      <section className="card-stage">
        {feed.length ? (
          <ProfileCard profile={feed[0]} onSwipe={handleSwipe} />
        ) : (
          <div className="empty-state">
            <div className="empty-heart"><HeartIcon size={34} /></div>
            <h2>You’re all caught up</h2>
            <p>No more profiles right now. Check back later for new people.</p>
          </div>
        )}
      </section>

      {match && (
        <div className="match-overlay" role="dialog" aria-modal="true">
          <div className="match-modal">
            <div className="match-photos">
              <div className="mini-photo">You</div>
              <img src={match.photo} alt={match.name} />
            </div>
            <p className="match-kicker">A new connection</p>
            <h2>It’s a match!</h2>
            <p>You and {match.name} liked each other.</p>
            <button className="primary-button" onClick={() => setMatch(null)}>Keep discovering</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/matches')
      .then((res) => res.json())
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="matches-page">
      <header className="page-header"><div><p className="eyebrow">Connections</p><h1>Matches</h1></div></header>
      {loading ? <div className="center-state"><div className="loader" /></div> : matches.length ? (
        <div className="matches-grid">
          {matches.map((profile) => (
            <article className="match-list-card" key={profile.id}>
              <img src={profile.photo} alt={profile.name} />
              <div><h3>{profile.name}, {profile.age}</h3><p>{profile.city}</p></div>
              <button aria-label={`View ${profile.name}`}><HeartIcon size={16} /></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state matches-empty">
          <div className="empty-heart"><HeartIcon size={34} /></div>
          <h2>No matches yet</h2>
          <p>When you both like each other, they’ll appear here.</p>
        </div>
      )}
    </main>
  );
}

function Home() {
  return (
    <main className="home-page" aria-label="Home">
      <div className="home-mark">coy</div>
    </main>
  );
}

function App() {
  const [tab, setTab] = useState('discover');
  return (
    <div className="app-shell">
      {tab === 'home' && <Home />}
      {tab === 'discover' && <Discover />}
      {tab === 'matches' && <Matches />}
      <nav className="tab-bar" aria-label="Primary navigation">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>
          <span className="nav-icon home-icon">⌂</span><span>Home</span>
        </button>
        <button className={tab === 'discover' ? 'active' : ''} onClick={() => setTab('discover')}>
          <span className="nav-icon compass-icon">◇</span><span>Discover</span>
        </button>
        <button className={tab === 'matches' ? 'active' : ''} onClick={() => setTab('matches')}>
          <span className="nav-icon"><HeartIcon size={21} /></span><span>Matches</span>
        </button>
      </nav>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
