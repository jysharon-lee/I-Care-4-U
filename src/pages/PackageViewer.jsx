import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import ReactPlayer from 'react-player';
import { 
  Soup, Pill, Heart, Coffee, Gift, Headphones, Book, Clapperboard, ArrowLeft
} from 'lucide-react';
import '../envelope.css';

const ITEM_DETAILS = {
  soup: { icon: Soup, color: '#E07A5F', bg: '#FAD4C0', label: 'Hot Soup' },
  pill: { icon: Pill, color: '#81B29A', bg: '#D1E8DD', label: 'Medicine' },
  love: { icon: Heart, color: '#E56B6F', bg: '#FAD1D2', label: 'Much Love' },
  tea: { icon: Coffee, color: '#D4A373', bg: '#F2E3D5', label: 'Herbal Tea' },
  cookie: { icon: Gift, color: '#F4A261', bg: '#FCE1C6', label: 'Surprise' }, 
  gift: { icon: Gift, color: '#F4A261', bg: '#FCE1C6', label: 'Surprise Gift' },
  music: { icon: Headphones, color: '#3D5A80', bg: '#D0DDF0', label: 'Mixtape' },
  book: { icon: Book, color: '#98C1D9', bg: '#DFF1FA', label: 'Good Book' },
  movie: { icon: Clapperboard, color: '#293241', bg: '#D9DEE6', label: 'Movie Night' }
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
          
          <div className="card-letter" style={{padding: '2rem 1rem'}}>
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

            {media.externalUrl && (
              <div style={{marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '12px', textAlign: 'center'}}>
                <h4 style={{marginBottom: '1rem', color: '#555'}}>Shared Link</h4>
                
                {/youtube\.com|youtu\.be|soundcloud\.com|vimeo\.com|twitch\.tv|dailymotion\.com/i.test(media.externalUrl) ? (
                  <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <ReactPlayer url={media.externalUrl} width="100%" height="200px" controls />
                  </div>
                ) : /spotify\.com/i.test(media.externalUrl) ? (
                  <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe 
                      src={media.externalUrl.replace('spotify.com/', 'spotify.com/embed/')} 
                      width="100%" 
                      height="152" 
                      frameBorder="0" 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                    ></iframe>
                  </div>
                ) : (
                  <a href={media.externalUrl} target="_blank" rel="noreferrer" style={{
                    display: 'block', background: '#5A9DD6', color: '#fff', padding: '1rem', borderRadius: '8px', 
                    textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem'
                  }}>
                    Click here to open the link
                  </a>
                )}
              </div>
            )}

            {pkg.items && pkg.items.length > 0 && (
              <div style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '2px dashed #eee'}}>
                <h4 style={{textAlign: 'center', color: '#888', marginBottom: '1.5rem'}}>Goodies inside:</h4>
                <div style={{display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap'}}>
                  {pkg.items.map((itemId, i) => {
                    const details = ITEM_DETAILS[itemId] || ITEM_DETAILS.gift;
                    const IconComp = details.icon;
                    return (
                      <motion.div 
                        key={i}
                        initial={opened ? { scale: 0, y: 50 } : false}
                        animate={opened ? { scale: 1, y: 0 } : false}
                        transition={{ type: 'spring', delay: 1 + (i * 0.1) }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <div style={{
                          width: '70px', height: '70px', backgroundColor: details.bg, color: details.color,
                          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '0.5rem'
                        }}>
                          <IconComp size={36} />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>{details.label}</span>
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
