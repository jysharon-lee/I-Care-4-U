import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, CalendarHeart, HeartPulse, Gift } from 'lucide-react';

const doors = [
  {
    id: 'rage',
    title: 'Rage Room',
    desc: 'Shatter glass and let it all out.',
    icon: Flame,
    colorClass: 'rage',
    link: '/rage-room'
  },
  {
    id: 'hangout',
    title: 'Plan a Hangout',
    desc: 'Ask someone out, the fun way.',
    icon: CalendarHeart,
    colorClass: 'hangout',
    link: '/plan-hangout'
  },
  {
    id: 'care4u',
    title: 'Care4U Package',
    desc: 'Tuck goodies into a digital box.',
    icon: Gift,
    colorClass: 'care4u',
    link: '/build-package/care4u'
  }
];

export default function Home() {
  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="title-main">ICare4U</h1>
        <p className="subtitle">Choose an experience to share or enjoy.</p>
      </motion.div>

      <div className="doors-grid">
        {doors.map((door, index) => (
          <motion.div
            key={door.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link to={door.link} className={`door-card ${door.colorClass}`}>
              <div className="door-icon">
                <door.icon size={48} strokeWidth={1.5} />
              </div>
              <h2 className="door-title">{door.title}</h2>
              <p className="door-desc">{door.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{ marginTop: 'auto', paddingTop: '3rem', paddingBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', width: '100%' }}
      >
        developed by <a href="https://sharonlee-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Sharon Lee</a> in 2026 
      </motion.div>
    </div>
  );
}
