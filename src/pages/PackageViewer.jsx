import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Mail, Paintbrush, Image as ImageIcon, LinkIcon, Play, X } from 'lucide-react';
import '../envelope.css';

const STICKER_MAP = {
  cilantro: { label: 'Cilantro', img: '/stickers/cilantro.jpg' },
  daisy: { label: 'Daisy', img: '/stickers/daisy.jpg' },
  coffee: { label: 'Coffee', img: '/stickers/coffee.jpg' },
  noodles: { label: 'Instant Noodles', img: '/stickers/noodles.jpg' },
  blueberries: { label: 'Blueberries', img: '/stickers/blueberries.jpg' },
  bubble_tea: { label: 'Bubble Tea', img: '/stickers/bubble_tea.jpg' },
  cookie: { label: 'Cookie', img: '/stickers/cookie.jpg' },
  teddy_bear: { label: 'Teddy Bear', img: '/stickers/teddy_bear.jpg' },
  donut: { label: 'Donut', img: '/stickers/donut.jpg' },
  strawberry: { label: 'Strawberry', img: '/stickers/strawberry.jpg' },
  sunflower: { label: 'Sunflower', img: '/stickers/sunflower.jpg' },
  pizza: { label: 'Pizza', img: '/stickers/pizza.jpg' },
  cupcake: { label: 'Cupcake', img: '/stickers/cupcake.jpg' },
};

export default function PackageViewer() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const { data, error: sbError } = await supabase
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();

        if (sbError) throw sbError;
        if (!data) throw new Error('Package not found');
        setPkg(data);
      } catch (err) {
        setError(err.message || 'Error fetching package');
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ fontFamily: 'Inter', fontSize: '1.2rem', color: '#555' }}>Loading package...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div style={styles.container}>
        <p style={{ fontFamily: 'Inter', fontSize: '1.2rem', color: '#e07a5f' }}>{error || 'Package not found'}</p>
        <Link to="/" style={styles.linkButton}>Go Home</Link>
      </div>
    );
  }

  const media = pkg.media || {};
  const formattedExternalUrl = media.externalUrl && !/^https?:\/\//i.test(media.externalUrl) 
    ? `https://${media.externalUrl}` 
    : media.externalUrl;

  const handleItemClick = (type) => {
    if (type === 'link') {
      window.open(formattedExternalUrl, '_blank');
    } else {
      setExpandedItem(type);
    }
  };

  return (
    <div style={styles.container}>
      {!opened ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.closedPhase}
        >
          <h1 style={styles.title}>A care package arrived for {pkg.to_name}!</h1>
          
          <motion.div 
            style={styles.giftBoxClosed}
            whileHover={{ rotate: [-2, 2, -2, 2, 0], scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpened(true)}
          >
            <div style={styles.giftBoxLid}>
              <div style={styles.ribbonVertical}></div>
              <div style={styles.ribbonHorizontal}></div>
              <div style={styles.bowTopLeft}></div>
              <div style={styles.bowTopRight}></div>
            </div>
            <div style={styles.giftBoxBody}>
              <div style={styles.ribbonVertical}></div>
            </div>
          </motion.div>

          <motion.p 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={styles.unwrapText}
          >
            Tap to unwrap!
          </motion.p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.openPhase}
        >
          <div style={styles.giftBoxOpenContainer}>
            <AnimatePresence>
              <motion.div
                key="lid"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ ...styles.giftBoxLid, position: 'absolute', top: -40, zIndex: 10 }}
              >
                <div style={styles.ribbonVertical}></div>
                <div style={styles.ribbonHorizontal}></div>
                <div style={styles.bowTopLeft}></div>
                <div style={styles.bowTopRight}></div>
              </motion.div>
            </AnimatePresence>

            <motion.div 
              style={styles.giftBoxInterior}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {/* Stickers */}
              {pkg.stickers && pkg.stickers.map((stickerKey, idx) => {
                const stickerInfo = STICKER_MAP[stickerKey];
                if (!stickerInfo) return null;
                const randomRotate = Math.floor(Math.random() * 30) - 15;
                const randomX = Math.floor(Math.random() * 80) + 10;
                const randomY = Math.floor(Math.random() * 80) + 10;
                return (
                  <motion.img
                    key={idx}
                    src={stickerInfo.img}
                    alt={stickerInfo.label}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                    style={{
                      position: 'absolute',
                      width: 50,
                      height: 50,
                      left: `${randomX}%`,
                      top: `${randomY}%`,
                      rotate: randomRotate,
                      pointerEvents: 'none',
                      borderRadius: '8px'
                    }}
                  />
                );
              })}

              <div style={styles.itemsGrid}>
                {/* Letter */}
                <motion.div 
                  style={styles.itemCard}
                  whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  onClick={() => handleItemClick('letter')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  <Mail size={32} color="#e07a5f" />
                  <span style={styles.itemLabel}>A letter for you</span>
                </motion.div>

                {/* Doodle */}
                {media.drawing && (
                  <motion.div 
                    style={styles.itemCard}
                    whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    onClick={() => handleItemClick('doodle')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                  >
                    <Paintbrush size={32} color="#5A9DD6" />
                    <span style={styles.itemLabel}>A doodle!</span>
                  </motion.div>
                )}

                {/* Photos */}
                {media.photos && media.photos.length > 0 && (
                  <motion.div 
                    style={styles.itemCard}
                    whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    onClick={() => handleItemClick('photos')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                  >
                    <ImageIcon size={32} color="#5A9DD6" />
                    <span style={styles.itemLabel}>Photos</span>
                  </motion.div>
                )}

                {/* Link */}
                {media.externalUrl && (
                  <motion.div 
                    style={styles.itemCard}
                    whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    onClick={() => handleItemClick('link')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, type: 'spring' }}
                  >
                    <LinkIcon size={32} color="#e07a5f" />
                    <span style={styles.itemLabel}>A link for you</span>
                  </motion.div>
                )}

                {/* Media File */}
                {media.fileUrl && (
                  <motion.div 
                    style={styles.itemCard}
                    whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    onClick={() => handleItemClick('media')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, type: 'spring' }}
                  >
                    <Play size={32} color="#e07a5f" />
                    <span style={styles.itemLabel}>Voice/Video</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          <div style={styles.bottomSection}>
            <p style={styles.fromText}>From: {pkg.from_name}</p>
            <Link to="/" style={styles.makeYourOwnLink}>Make your own package</Link>
          </div>
        </motion.div>
      )}

      {/* Expanded Overlay */}
      <AnimatePresence>
        {expandedItem && (
          <motion.div 
            style={styles.overlayBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedItem(null)}
          >
            <motion.div 
              style={styles.expandedCard}
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.closeBtn} onClick={() => setExpandedItem(null)}>
                <X size={24} color="#555" />
              </button>

              <div style={styles.expandedContent}>
                {expandedItem === 'letter' && (
                  <div style={styles.letterContent}>
                    <p style={styles.letterHeader}>Dear {pkg.to_name},</p>
                    <p style={styles.letterMessage}>{pkg.message}</p>
                    <p style={styles.letterFooter}>Love,<br/>{pkg.from_name}</p>
                  </div>
                )}

                {expandedItem === 'doodle' && media.drawing && (
                  <div style={styles.mediaContainer}>
                    <img src={media.drawing} alt="A cute doodle" style={styles.expandedImg} />
                  </div>
                )}

                {expandedItem === 'photos' && media.photos && (
                  <div style={styles.photosGrid}>
                    {media.photos.map((photoUrl, idx) => (
                      <img key={idx} src={photoUrl} alt={`Photo ${idx+1}`} style={styles.expandedImg} />
                    ))}
                  </div>
                )}

                {expandedItem === 'media' && media.fileUrl && (
                  <div style={styles.mediaContainer}>
                    {media.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={media.fileUrl} controls style={styles.expandedVideo} />
                    ) : (
                      <audio src={media.fileUrl} controls style={styles.expandedAudio} />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F1E6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative'
  },
  closedPhase: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3rem'
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '2.5rem',
    color: '#333',
    textAlign: 'center',
    margin: 0
  },
  unwrapText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.2rem',
    color: '#666',
    margin: 0
  },
  giftBoxClosed: {
    position: 'relative',
    width: 250,
    height: 200,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  giftBoxBody: {
    width: 250,
    height: 150,
    backgroundColor: '#d4a574',
    position: 'relative',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    borderRadius: '0 0 8px 8px',
    overflow: 'hidden'
  },
  giftBoxLid: {
    width: 270,
    height: 50,
    backgroundColor: '#c49362',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    borderRadius: '4px',
    zIndex: 2,
    marginBottom: -5
  },
  ribbonVertical: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 30,
    height: '100%',
    backgroundColor: '#e07a5f'
  },
  ribbonHorizontal: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '100%',
    height: 30,
    backgroundColor: '#e07a5f'
  },
  bowTopLeft: {
    position: 'absolute',
    left: '50%',
    top: -20,
    width: 40,
    height: 30,
    backgroundColor: 'transparent',
    border: '8px solid #e07a5f',
    borderRadius: '20px 20px 0 20px',
    transform: 'translateX(-100%) rotate(-15deg)',
    transformOrigin: 'bottom right'
  },
  bowTopRight: {
    position: 'absolute',
    right: '50%',
    top: -20,
    width: 40,
    height: 30,
    backgroundColor: 'transparent',
    border: '8px solid #e07a5f',
    borderRadius: '20px 20px 20px 0',
    transform: 'translateX(100%) rotate(15deg)',
    transformOrigin: 'bottom left'
  },
  openPhase: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 800,
    gap: '2rem'
  },
  giftBoxOpenContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 600,
    minHeight: 400,
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'center'
  },
  giftBoxInterior: {
    width: '100%',
    minHeight: 400,
    backgroundColor: '#fffaf0',
    boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1)',
    borderRadius: '16px',
    padding: '3rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '12px solid #d4a574'
  },
  itemsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 5
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    width: 120,
    textAlign: 'center'
  },
  itemLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: '#333',
    fontWeight: 500
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem'
  },
  fromText: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: '2.5rem',
    color: '#333',
    margin: 0
  },
  makeYourOwnLink: {
    fontFamily: "'Inter', sans-serif",
    color: '#5A9DD6',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '1.1rem'
  },
  linkButton: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e07a5f',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontFamily: 'Inter'
  },
  overlayBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '2rem'
  },
  expandedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#f5f5f5'
  },
  expandedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    width: '100%'
  },
  letterContent: {
    width: '100%',
    fontFamily: "'Great Vibes', cursive",
    fontSize: '2rem',
    color: '#333',
    lineHeight: 1.5
  },
  letterHeader: {
    margin: '0 0 1rem 0'
  },
  letterMessage: {
    margin: '0 0 2rem 0',
    whiteSpace: 'pre-wrap'
  },
  letterFooter: {
    margin: 0,
    textAlign: 'right'
  },
  mediaContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  expandedImg: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px'
  },
  photosGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%'
  },
  expandedVideo: {
    width: '100%',
    borderRadius: '8px'
  },
  expandedAudio: {
    width: '100%',
    marginTop: '1rem'
  }
};
