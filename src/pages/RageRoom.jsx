import { Link } from 'react-router-dom';

export default function RageRoom() {
  return (
    <div className="container">
      <Link to="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Home</Link>
      <h1 className="title-main" style={{ marginTop: '2rem' }}>Rage Room</h1>
      <p className="subtitle">Coming soon: Physics-based glass shattering!</p>
    </div>
  );
}
