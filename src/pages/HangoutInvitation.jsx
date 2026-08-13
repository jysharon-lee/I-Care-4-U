import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';
import { 
  Heart, Calendar, Clock, MessageSquare, CheckCircle, 
  Film, TreePine, ShoppingBag, Dumbbell, UtensilsCrossed, 
  Home, Sparkles, PenLine, Utensils, Pizza, Croissant, CupSoda 
} from 'lucide-react';

const ACTIVITIES = [
  { name: 'Movies', icon: Film },
  { name: 'Picnic', icon: TreePine },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Outdoor Sports', icon: Dumbbell },
  { name: 'Eat Out', icon: UtensilsCrossed },
  { name: 'Stay at Home', icon: Home },
  { name: 'Surprise Me!', icon: Sparkles },
  { name: 'Something Else', icon: PenLine }
];

const FOODS = [
  { name: 'Chinese', icon: Utensils },
  { name: 'Western', icon: Pizza },
  { name: 'Asian', icon: UtensilsCrossed },
  { name: 'Snacks', icon: Croissant },
  { name: 'Drinks & Desserts', icon: CupSoda },
  { name: 'Surprise Me!', icon: Sparkles },
  { name: 'Something Else', icon: PenLine }
];

export default function HangoutInvitation() {
  const { id } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const noButtonRef = useRef(null);

  const [answers, setAnswers] = useState({
    date: '',
    activity: '',
    customActivity: '',
    food: '',
    customFood: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    async function fetchInvitation() {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        const { data, error: sbError } = await supabase
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();
        
        if (sbError || !data || data.type !== 'hangout') {
          throw new Error('Not found');
        }
        
        setInvitation({
          to: data.to_name,
          from: data.from_name,
          email: data.media?.email
        });
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInvitation();
  }, [id]);

  const handleNoHover = () => {
    // Generate coordinates that are far away from the center "Yes" button
    // Ensure the button moves between 150px and 350px away from its original spot
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signY = Math.random() > 0.5 ? 1 : -1;
    
    const x = signX * (150 + Math.random() * 200);
    const y = signY * (150 + Math.random() * 200);
    
    setNoButtonPosition({ x, y });
    setNoCount(prev => prev + 1);
  };

  const handleNoClick = () => {
    alert("There is no option, just click yes!!");
    setNoButtonPosition({ x: 0, y: 0 }); 
  };

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalActivity = answers.activity === 'Something Else' ? answers.customActivity : answers.activity;
    const finalFood = answers.food === 'Something Else' ? answers.customFood : answers.food;
    
    const templateParams = {
      to_email: invitation.email,
      inviter_name: invitation.from,
      recipient_name: invitation.to,
      date: answers.date,
      activity: finalActivity,
      food: finalFood,
      time: answers.time,
      notes: answers.notes || 'None'
    };

    handleNext(); // Go to success screen immediately so the user isn't waiting

    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
    }).catch((err) => {
      console.error(err);
      alert('Oops! Something went wrong sending the email. But we still got your plan!');
      setStep(5);
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading invitation...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: '#FF6B6B' }}>Oops!</h1>
        <p style={{ color: 'var(--text-secondary)' }}>This invitation link seems to be broken or missing.</p>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="container" style={{ maxWidth: '700px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        
        {/* STEP 0: THE ASK */}
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ textAlign: 'center', position: 'relative' }}
          >
            <Heart size={64} color="var(--accent-pink)" fill="var(--accent-pink)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
              Hi {invitation.to},<br/> {invitation.from} wants to ask you out!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>Will you go out with me?</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center', height: '100px', position: 'relative' }}>
              <button 
                onClick={handleNext}
                style={{ background: 'var(--accent-pink)', color: '#fff', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10, transform: `scale(${1 + (noCount * 0.1)})`, transition: 'transform 0.2s' }}
              >
                Yes!
              </button>
              
              <motion.button
                ref={noButtonRef}
                onHoverStart={handleNoHover}
                onMouseEnter={handleNoHover}
                onClick={handleNoClick}
                animate={{ x: noButtonPosition.x, y: noButtonPosition.y }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ background: '#eee', color: '#666', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.2rem', position: noCount > 0 ? 'absolute' : 'relative', zIndex: 1 }}
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 1: DATE */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <Calendar size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>I knew you would say yes! When are you free?</h2>
            <input 
              type="date" 
              value={answers.date}
              onChange={e => setAnswers({...answers, date: e.target.value})}
              style={{ padding: '1rem', width: '100%', fontSize: '1.2rem', borderRadius: '12px', border: '2px solid var(--accent-blue)', marginBottom: '2rem', fontFamily: 'inherit' }}
            />
            <button onClick={handleNext} disabled={!answers.date} style={{ background: 'var(--text-primary)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', opacity: answers.date ? 1 : 0.5 }}>Next &rarr;</button>
          </motion.div>
        )}

        {/* STEP 2: ACTIVITY */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>What should we do?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {ACTIVITIES.map(act => (
                <button 
                  key={act.name}
                  onClick={() => setAnswers({...answers, activity: act.name})}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    padding: '1.5rem 1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: '500',
                    background: answers.activity === act.name ? 'var(--accent-pink)' : '#fff',
                    color: answers.activity === act.name ? '#fff' : 'var(--text-primary)',
                    border: '2px solid var(--accent-pink)', transition: 'all 0.2s',
                    boxShadow: answers.activity === act.name ? '0 4px 15px rgba(244, 166, 197, 0.4)' : 'none'
                  }}
                >
                  <act.icon size={28} />
                  {act.name}
                </button>
              ))}
            </div>

            {answers.activity === 'Something Else' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  placeholder="Type what you want to do here..." 
                  value={answers.customActivity}
                  onChange={e => setAnswers({...answers, customActivity: e.target.value})}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', fontFamily: 'inherit' }}
                />
              </motion.div>
            )}

            <button onClick={handleNext} disabled={!answers.activity || (answers.activity === 'Something Else' && !answers.customActivity)} style={{ background: 'var(--text-primary)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', opacity: (answers.activity && (answers.activity !== 'Something Else' || answers.customActivity)) ? 1 : 0.5 }}>Next &rarr;</button>
          </motion.div>
        )}

        {/* STEP 3: FOOD */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <UtensilsCrossed size={48} color="var(--accent-yellow)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>What are we eating?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>They will do their best to get what you crave!</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {FOODS.map(food => (
                <button 
                  key={food.name}
                  onClick={() => setAnswers({...answers, food: food.name})}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    padding: '1.5rem 1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: '500',
                    background: answers.food === food.name ? 'var(--accent-yellow)' : '#fff',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--accent-yellow)', transition: 'all 0.2s',
                    boxShadow: answers.food === food.name ? '0 4px 15px rgba(253, 232, 140, 0.4)' : 'none'
                  }}
                >
                  <food.icon size={28} />
                  {food.name}
                </button>
              ))}
            </div>

            {answers.food === 'Something Else' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  placeholder="Type exactly what you want to eat..." 
                  value={answers.customFood}
                  onChange={e => setAnswers({...answers, customFood: e.target.value})}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.1rem', fontFamily: 'inherit' }}
                />
              </motion.div>
            )}

            <button onClick={handleNext} disabled={!answers.food || (answers.food === 'Something Else' && !answers.customFood)} style={{ background: 'var(--text-primary)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', opacity: (answers.food && (answers.food !== 'Something Else' || answers.customFood)) ? 1 : 0.5 }}>Next &rarr;</button>
          </motion.div>
        )}

        {/* STEP 4: TIME */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <Clock size={48} color="var(--accent-green)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>What time should we meet?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No matter how early or late, they will show up.</p>
            <input 
              type="time" 
              value={answers.time}
              onChange={e => setAnswers({...answers, time: e.target.value})}
              style={{ padding: '1rem', width: '100%', fontSize: '1.2rem', borderRadius: '12px', border: '2px solid var(--accent-green)', marginBottom: '2rem', fontFamily: 'inherit' }}
            />
            <button onClick={handleNext} disabled={!answers.time} style={{ background: 'var(--text-primary)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', opacity: answers.time ? 1 : 0.5 }}>Next &rarr;</button>
          </motion.div>
        )}

        {/* STEP 5: NOTES */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <MessageSquare size={48} color="var(--text-primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Any extra notes?</h2>
            <textarea 
              placeholder="e.g. Pick me up at my house! Don't be late!"
              value={answers.notes}
              onChange={e => setAnswers({...answers, notes: e.target.value})}
              rows={4}
              style={{ padding: '1rem', width: '100%', fontSize: '1.1rem', borderRadius: '12px', border: '2px solid #ddd', marginBottom: '2rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <button onClick={handleSubmit} className="btn-primary">Send Response</button>
          </motion.div>
        )}

        {/* STEP 6: SUCCESS */}
        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <CheckCircle size={80} color="var(--accent-green)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', marginBottom: '1rem' }}>It's a Date!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
              Your response has been saved. {invitation.from} will see your answers and contact you soon.
            </p>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', textAlign: 'left', display: 'inline-block' }}>
              <p><strong>Date:</strong> {answers.date}</p>
              <p><strong>Time:</strong> {answers.time}</p>
              <p><strong>Activity:</strong> {answers.activity === 'Something Else' ? answers.customActivity : answers.activity}</p>
              <p><strong>Food:</strong> {answers.food === 'Something Else' ? answers.customFood : answers.food}</p>
              {answers.notes && <p><strong>Notes:</strong> {answers.notes}</p>}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
