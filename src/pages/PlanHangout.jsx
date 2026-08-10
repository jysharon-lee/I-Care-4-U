import { Link } from 'react-router-dom';

export default function PlanHangout() {
  return (
    <div className="container">
      <Link to="/" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Home</Link>
      <h1 className="title-main" style={{ marginTop: '2rem' }}>Plan a Hangout</h1>
      <p className="subtitle">Coming soon: The interactive "will you go out with me" form.</p>
    </div>
  );
}
