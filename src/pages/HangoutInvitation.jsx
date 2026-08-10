import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Utensils, Clock, MessageSquare, CheckCircle } from 'lucide-react';

const ACTIVITIES = ['Movies 🍿', 'Picnic 🧺', 'Shopping 🛍️', 'Outdoor Sports 🏸', 'Eat Out 🍽️', 'Stay at Home 🛋️', 'Something Else ✨'];
const FOODS = ['Chinese 🥟', 'Western 🍔', 'Asian 🍜', 'Snacks 🥨', 'Drinks & Desserts 🧋', 'Surprise Me! 🎁'];

export default function HangoutInvitation() {
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(false);
  
  const [step, setStep] = useState(0); // 0: intro, 1: date, 2: activity, 3: food, 4: time, 5: notes, 6: success
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const noButtonRef = useRef(null);

  const [answers, setAnswers] = useState({
    date: '',
    activity: '',
    food: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    try {
      const data = searchParams.get('data');
      if (data) {
        const decoded = JSON.parse(atob(data));
        setInvitation(decoded);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
  }, [searchParams]);

  const handleNoHover = () => {
    if (noCount > 5) return; // After 5 tries, they can click it (or we force yes)
    
    // Randomize position
    const x = Math.random() * 200 - 100; // -100 to 100
    const y = Math.random() * 200 - 100;
    setNoButtonPosition({ x, y });
    setNoCount(prev => prev + 1);
  };

  const handleNoClick = () => {
    alert("There is no option, just click yes!!");
    setNoButtonPosition({ x: 0, y: 0 }); // reset so they can see yes
  };

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // This is where EmailJS would go!
    console.log("Sending to:", invitation.email);
    console.log("Answers:", answers);
    handleNext(); // go to success
  };

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: '#FF6B6B' }}>Oops!</h1>
        <p style={{ color: 'var(--text-secondary)' }}>This invitation link seems to be broken or missing.</p>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="container" style={{ maxWidth: '600px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        
        {/* STEP 0: THE ASK */}
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ textAlign: 'center' }}
          >
            <Heart size={64} color="var(--accent-pink)" fill="var(--accent-pink)" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
              Hi {invitation.to},<br/> {invitation.from} wants to hangout with you!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>Will you go out with them?</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center', height: '100px' }}>
              <button 
                onClick={handleNext}
                style={{ background: 'var(--accent-pink)', color: '#fff', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold', transform: `scale(${1 + (noCount * 0.1)})`, transition: 'transform 0.2s' }}
              >
                Yes!
              </button>
              
              <motion.button
                ref={noButtonRef}
                onHoverStart={handleNoHover}
                onMouseEnter={handleNoHover}
                onClick={handleNoClick}
                animate={{ x: noButtonPosition.x, y: noButtonPosition.y }}
                style={{ background: '#eee', color: '#666', padding: '1rem 3rem', borderRadius: '50px', fontSize: '1.2rem', position: noCount > 0 ? 'absolute' : 'relative' }}
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
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Yay! When are you free?</h2>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              {ACTIVITIES.map(act => (
                <button 
                  key={act}
                  onClick={() => setAnswers({...answers, activity: act})}
                  style={{ 
                    padding: '1rem 1.5rem', borderRadius: '50px', fontSize: '1.1rem',
                    background: answers.activity === act ? 'var(--accent-pink)' : '#fff',
                    color: answers.activity === act ? '#fff' : 'var(--text-primary)',
                    border: '2px solid var(--accent-pink)', transition: 'all 0.2s'
                  }}
                >
                  {act}
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!answers.activity} style={{ background: 'var(--text-primary)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', opacity: answers.activity ? 1 : 0.5 }}>Next &rarr;</button>
          </motion.div>
        )}

        {/* STEP 3: FOOD */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <Utensils size={48} color="var(--accent-yellow)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>What are we eating?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>They will do their best to get what you crave!</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              {FOODS.map(food => (
                <button 
                  key={food}
                  onClick={() => setAnswers({...answers, food: food})}
                  style={{ 
                    padding: '1rem 1.5rem', borderRadius: '50px', fontSize: '1.1rem',
                    background: answers.food === food ? 'var(--accent-yellow)' : '#fff',
                    color: 'var(--text-primary)',
                    border: '2px solid var(--accent-yellow)', transition: 'all 0.2s'
                  }}
                >
                  {food}
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={!answers.food} style={{ background: 'var(--text-primary)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', opacity: answers.food ? 1 : 0.5 }}>Next &rarr;</button>
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
            <button onClick={handleSubmit} style={{ background: 'var(--accent-blue)', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>Send Response</button>
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
              <p><strong>Activity:</strong> {answers.activity}</p>
              <p><strong>Food:</strong> {answers.food}</p>
              {answers.notes && <p><strong>Notes:</strong> {answers.notes}</p>}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
