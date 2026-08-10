import { Link } from 'react-router-dom';

export default function Care4U() {
  return (
    <div className="container">
      <Link to="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Home</Link>
      <h1 className="title-main" style={{ marginTop: '2rem' }}>Care4U Package</h1>
      <p className="subtitle">Coming soon: Tuck digital goodies into a virtual box.</p>
    </div>
  );
}
