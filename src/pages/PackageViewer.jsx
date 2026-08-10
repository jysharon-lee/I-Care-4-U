import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { 
  FcLike, FcVideoCall, FcMusic, FcGift, FcLikePlaceholder, FcReading, FcBiotech, FcHeadset, FcIdea 
} from 'react-icons/fc';
import { ArrowLeft } from 'lucide-react';
import '../envelope.css';

const ICON_MAP = {
  soup: FcLikePlaceholder, pill: FcBiotech, love: FcLike,
  tea: FcIdea, cookie: FcGift, gift: FcGift,
  music: FcHeadset, book: FcReading, movie: FcVideoCall
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
    return <div className="container" style={{textAlign: 'center', marginTop: '20vh', color: '#e07a5f'}}>Finding your package...</div>;
  }
  if (error || !pkg) {
    return <div className="container" style={{textAlign: 'center', marginTop: '20vh', color: '#e07a5f'}}>Oops! {error}</div>;
  }

  const media = pkg.media || {};

  return (
    <div className="container" style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {!opened && (
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h2 style={{ color: '#253237', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            A package arrived for {pkg.to_name}!
          </h2>
          <p style={{ color: '#5c6b73', fontWeight: 'bold' }}>
            Tap the envelope flap to open it.
          </p>
        </div>
      )}

      <div className={`envelope-wrapper viewer ${opened ? 'open' : ''}`}>
        <div className="envelope">
          <div className="envelope-flap" onClick={() => setOpened(true)}></div>
          
          <div className="card-letter" style={{padding: '2rem 1rem', overflowY: 'visible'}}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.2rem', color: '#888' }}>To: </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#253237' }}>{pkg.to_name}</span>
            </div>

            <p className="handwriting" style={{ marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
              {pkg.message}
            </p>

            {media.drawing && (
              <div style={{marginBottom: '2rem'}}>
                <img src={media.drawing} alt="A hand-drawn doodle" style={{width: '100%', borderRadius: '8px', border: '2px dashed #eee'}} />
              </div>
            )}

            {media.fileUrl && (
              <div style={{marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '12px', textAlign: 'center'}}>
                <h4 style={{marginBottom: '1rem', color: '#555'}}>Attached Media</h4>
                {media.fileType && media.fileType.startsWith('video/') ? (
                  <video src={media.fileUrl} controls style={{width: '100%', borderRadius: '8px'}} />
                ) : (
                  <audio src={media.fileUrl} controls style={{width: '100%'}} />
                )}
              </div>
            )}

            {pkg.items && pkg.items.length > 0 && (
              <div style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #eee'}}>
                <h4 style={{textAlign: 'center', color: '#888', marginBottom: '1.5rem'}}>Goodies inside:</h4>
                <div style={{display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap'}}>
                  {pkg.items.map((itemId, i) => {
                    const IconComp = ICON_MAP[itemId] || FcGift;
                    return (
                      <motion.div 
                        key={i}
                        initial={opened ? { scale: 0, y: 50 } : false}
                        animate={opened ? { scale: 1, y: 0 } : false}
                        transition={{ type: 'spring', delay: 1 + (i * 0.1) }}
                        style={{
                          width: '80px', height: '80px', backgroundColor: '#fff', 
                          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                      >
                        <IconComp size={50} />
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '3rem' }}>
              <span style={{ fontSize: '1.2rem', color: '#888' }}>From, </span><br/>
              <span className="handwriting">{pkg.from_name}</span>
            </div>
          </div>
        </div>
      </div>
      
      {opened && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 2}} style={{marginTop: '4rem'}}>
          <Link to="/" className="btn-secondary" style={{padding: '0.8rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
            <ArrowLeft size={18} /> Make your own package
          </Link>
        </motion.div>
      )}
    </div>
  );
}
