import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowLeft } from 'lucide-react';

export default function PlanHangout() {
  const [formData, setFormData] = useState({ to: '', from: '', email: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!formData.to || !formData.from || !formData.email) return;

    // Basic Base64 encoding to prevent the email from being plain text in the URL
    // (This is not encryption, just slight obfuscation for client-side URL params)
    const encodedData = btoa(JSON.stringify(formData));
    const link = `${window.location.origin}/hangout-invite?data=${encodedData}`;
    setGeneratedLink(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <Link to="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-main" style={{ fontSize: '2.5rem' }}>Plan a Hangout</h1>
        <p className="subtitle">Fill out the details below to generate a fun, interactive invitation link to send to your friend or crush.</p>

        <div className="card" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)' }}>
          {!generatedLink ? (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Who is this for?</label>
                <input 
                  type="text" 
                  placeholder="Their name (e.g. Alex)" 
                  value={formData.to}
                  onChange={e => setFormData({ ...formData, to: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Who is it from?</label>
                <input 
                  type="text" 
                  placeholder="Your name" 
                  value={formData.from}
                  onChange={e => setFormData({ ...formData, from: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Your Email</label>
                <input 
                  type="email" 
                  placeholder="Where should we send their answers?" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                  required
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>We use EmailJS to securely email you their responses. We don't save this email.</p>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                Generate Link
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>It's ready! 🎉</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Send this link to {formData.to}. When they fill it out, you'll get an email at {formData.email}.</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', backgroundColor: '#f9f9f9', color: '#666' }}
                />
                <button 
                  onClick={handleCopy}
                  style={{ background: copied ? 'var(--accent-green)' : 'var(--text-primary)', color: '#fff', padding: '0 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button 
                onClick={() => { setGeneratedLink(''); setFormData({ to: '', from: '', email: '' }); }}
                style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontSize: '0.9rem' }}
              >
                Create another one
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
