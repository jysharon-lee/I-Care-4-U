import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { 
  HeartPulse, Gift, Coffee, Pill, Flower2, 
  Gamepad2, Music, Stethoscope, Soup, Cookie,
  Copy, CheckCircle, ArrowLeft
} from 'lucide-react';

const ITEMS_DB = {
  getwellsoon: [
    { id: 'soup', label: 'Hot Soup', icon: Soup },
    { id: 'pill', label: 'Medicine', icon: Pill },
    { id: 'stethoscope', label: 'Doctor Hug', icon: Stethoscope },
    { id: 'heart', label: 'Much Love', icon: HeartPulse },
    { id: 'tea', label: 'Herbal Tea', icon: Coffee },
    { id: 'cookie', label: 'Comfort Cookie', icon: Cookie },
  ],
  care4u: [
    { id: 'gift', label: 'Surprise Gift', icon: Gift },
    { id: 'flower', label: 'Fresh Flowers', icon: Flower2 },
    { id: 'game', label: 'Video Game', icon: Gamepad2 },
    { id: 'music', label: 'Mixtape', icon: Music },
    { id: 'coffee', label: 'Iced Coffee', icon: Coffee },
    { id: 'cookie', label: 'Sweet Treat', icon: Cookie },
  ]
};

export default function BoxBuilder() {
  const { type } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    to_name: '',
    from_name: '',
    message: '',
    items: []
  });

  const availableItems = ITEMS_DB[type] || ITEMS_DB.care4u;

  const handleItemToggle = (itemId) => {
    setFormData(prev => {
      const isSelected = prev.items.includes(itemId);
      if (isSelected) {
        return { ...prev, items: prev.items.filter(id => id !== itemId) };
      } else {
        if (prev.items.length >= 4) return prev; // max 4 items
        return { ...prev, items: [...prev.items, itemId] };
      }
    });
  };

  const handleGenerate = async () => {
    if (!formData.to_name || !formData.from_name) {
      alert("Please fill in the names!");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([
          {
            type: type,
            to_name: formData.to_name,
            from_name: formData.from_name,
            message: formData.message,
            items: formData.items,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/package/${data.id}`;
      setShareLink(link);
      setStep(3);
    } catch (err) {
      alert("Error saving package: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <Link to="/" style={{ color: '#5c6b73', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <ArrowLeft size={20} /> Back Home
      </Link>

      <motion.div 
        className="form-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="title-main" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {type === 'getwellsoon' ? 'Get Well Soon Kit' : 'Care4U Package'}
        </h1>
        <p className="subtitle" style={{ marginBottom: '2rem' }}>
          Pack a digital box full of goodies for someone special.
        </p>

        {step === 1 && (
          <motion.div className="form-group" initial={{opacity:0}} animate={{opacity:1}}>
            <label>Who is this for?</label>
            <input 
              type="text" 
              placeholder="Their name" 
              value={formData.to_name}
              onChange={(e) => setFormData({...formData, to_name: e.target.value})}
            />
            
            <label style={{marginTop: '1.5rem'}}>Who is it from?</label>
            <input 
              type="text" 
              placeholder="Your name" 
              value={formData.from_name}
              onChange={(e) => setFormData({...formData, from_name: e.target.value})}
            />

            <label style={{marginTop: '1.5rem'}}>Add a sweet message</label>
            <textarea 
              placeholder="Hope you feel better soon..." 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={4}
            />

            <button 
              className="btn-primary" 
              style={{marginTop: '2rem'}}
              onClick={() => setStep(2)}
              disabled={!formData.to_name || !formData.from_name}
            >
              Next: Pick Items
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <h3 style={{marginBottom: '1rem', color: '#253237'}}>Select up to 4 virtual items to pack</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {availableItems.map(item => {
                const isSelected = formData.items.includes(item.id);
                return (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleItemToggle(item.id)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#e07a5f' : '#e0e0e0'}`,
                      backgroundColor: isSelected ? '#fdf6f5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <item.icon size={32} color={isSelected ? '#e07a5f' : '#5c6b73'} />
                    <span style={{ fontWeight: 500, color: '#253237' }}>{item.label}</span>
                  </motion.div>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setStep(1)} style={{flex: 1}}>
                Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleGenerate} 
                disabled={loading || formData.items.length === 0}
                style={{flex: 2}}
              >
                {loading ? 'Packing...' : 'Pack & Generate Link'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale: 1}} style={{textAlign: 'center'}}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: '#e07a5f', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Gift size={40} />
            </div>
            <h2 style={{color: '#253237', marginBottom: '1rem'}}>Package is Ready!</h2>
            <p style={{color: '#5c6b73', marginBottom: '2rem'}}>
              Send this link to {formData.to_name} for them to unbox it.
            </p>

            <div style={{
              padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '2rem', wordBreak: 'break-all', textAlign: 'left',
              gap: '1rem'
            }}>
              <span style={{color: '#253237', fontSize: '0.9rem'}}>{shareLink}</span>
              <button 
                onClick={copyLink}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', 
                  color: copied ? '#4caf50' : '#e07a5f', padding: '0.5rem'
                }}
              >
                {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
              </button>
            </div>
            
            <a href={shareLink} target="_blank" rel="noreferrer" style={{color: '#e07a5f', fontWeight: 'bold', textDecoration: 'none'}}>
              Preview Package
            </a>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
