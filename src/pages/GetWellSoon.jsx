import { Link } from 'react-router-dom';

export default function GetWellSoon() {
  return (
    <div className="container">
      <Link to="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Home</Link>
      <h1 className="title-main" style={{ marginTop: '2rem' }}>Get Well Soon Kit</h1>
      <p className="subtitle">Coming soon: Send a virtual prescription of love and snacks.</p>
    </div>
  );
}
