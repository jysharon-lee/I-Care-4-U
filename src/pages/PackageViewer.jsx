import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { 
  HeartPulse, Gift, Coffee, Pill, Flower2, 
  Gamepad2, Music, Stethoscope, Soup, Cookie,
  PackageOpen, Sparkles
} from 'lucide-react';

const ICON_MAP = {
  soup: Soup, pill: Pill, stethoscope: Stethoscope,
  heart: HeartPulse, tea: Coffee, cookie: Cookie,
  gift: Gift, flower: Flower2, game: Gamepad2, music: Music, coffee: Coffee
};

export default function PackageViewer() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error("Package not found!");
        
        setPkg(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: '#e07a5f'}}>Finding your package...</div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="form-card" style={{textAlign: 'center'}}>
          <h2 style={{color: '#e07a5f'}}>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div 
            key="closed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setOpened(true)}
          >
            <h2 style={{ color: '#253237', marginBottom: '2rem', fontSize: '2rem' }}>
              A package arrived for {pkg.to_name}!
            </h2>
            
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{
                width: '200px', height: '200px', margin: '0 auto',
                backgroundColor: '#e07a5f', borderRadius: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(224, 122, 95, 0.3)',
                position: 'relative'
              }}
            >
              <Gift size={80} color="#fff" />
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '24px' }}
              />
            </motion.div>
            
            <p style={{ marginTop: '2rem', color: '#5c6b73', fontWeight: 'bold' }}>
              Tap to open
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="opened"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="form-card"
            style={{ maxWidth: '600px', width: '100%', textAlign: 'center', position: 'relative' }}
          >
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              style={{
                width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fdf6f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#e07a5f'
              }}
            >
              <PackageOpen size={32} />
            </motion.div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ color: '#253237', marginBottom: '0.5rem', fontSize: '2rem' }}
            >
              From {pkg.from_name}
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ fontSize: '1.2rem', color: '#5c6b73', marginBottom: '2rem', fontStyle: 'italic', lineHeight: 1.6 }}
            >
              "{pkg.message}"
            </motion.p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {pkg.items.map((itemId, i) => {
                const IconComp = ICON_MAP[itemId] || Sparkles;
                return (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', delay: 0.6 + (i * 0.1) }}
                    style={{
                      padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #e0e0e0',
                      borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    <IconComp size={40} color="#e07a5f" />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
