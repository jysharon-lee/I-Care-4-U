import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { ArrowLeft, Copy, CheckCircle, UploadCloud, Eraser, X, ImagePlus, Gift } from 'lucide-react';
import '../envelope.css';

const STICKERS = [
  { id: 'cilantro', label: 'Cilantro', img: '/stickers/cilantro.jpg' },
  { id: 'daisy', label: 'Daisy', img: '/stickers/daisy.jpg' },
  { id: 'coffee', label: 'Coffee', img: '/stickers/coffee.jpg' },
  { id: 'noodles', label: 'Instant Noodles', img: '/stickers/noodles.jpg' },
  { id: 'blueberries', label: 'Blueberries', img: '/stickers/blueberries.jpg' },
  { id: 'bubble_tea', label: 'Bubble Tea', img: '/stickers/bubble_tea.jpg' },
  { id: 'cookie', label: 'Cookie', img: '/stickers/cookie.jpg' },
  { id: 'teddy_bear', label: 'Teddy Bear', img: '/stickers/teddy_bear.jpg' },
  { id: 'donut', label: 'Donut', img: '/stickers/donut.jpg' },
  { id: 'strawberry', label: 'Strawberry', img: '/stickers/strawberry.jpg' },
  { id: 'sunflower', label: 'Sunflower', img: '/stickers/sunflower.jpg' },
  { id: 'pizza', label: 'Pizza', img: '/stickers/pizza.jpg' },
  { id: 'cupcake', label: 'Cupcake', img: '/stickers/cupcake.jpg' },
];

export default function BoxBuilder() {
  const { type } = useParams();
  const [formData, setFormData] = useState({ to_name: '', from_name: '', message: '', stickers: [] });
  const [drawingData, setDrawingData] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#2b2b2b');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('write');
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const colors = ['#2b2b2b', '#e07a5f', '#5A9DD6', '#2a9d8f', '#e9c46a', '#9b5de5'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrawNext = async () => {
    if (canvasRef.current) {
      try {
        const exported = await canvasRef.current.exportImage("png");
        setDrawingData(exported);
      } catch (err) {
        console.error('Error exporting canvas:', err);
      }
    }
    setActiveTab('photos');
  };

  const handleClearDraw = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles = [...photoFiles, ...filesArray].slice(0, 6);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setPhotoFiles(newFiles);
      setPhotoPreviews(newPreviews);
    }
  };

  const handleRemovePhoto = (index) => {
    const newFiles = [...photoFiles];
    newFiles.splice(index, 1);
    setPhotoFiles(newFiles);

    const newPreviews = [...photoPreviews];
    newPreviews.splice(index, 1);
    setPhotoPreviews(newPreviews);
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const toggleSticker = (id) => {
    setFormData((prev) => {
      const current = prev.stickers;
      if (current.includes(id)) {
        return { ...prev, stickers: current.filter((s) => s !== id) };
      }
      if (current.length >= 8) return prev;
      return { ...prev, stickers: [...current, id] };
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    let mediaUrl = null;
    let mediaType = null;
    
    // if a drawing exists but wasn't exported via handleDrawNext, export it here
    let finalDrawingData = drawingData;
    if (!finalDrawingData && canvasRef.current) {
      try {
        const paths = await canvasRef.current.exportPaths();
        if (paths.length > 0) {
          finalDrawingData = await canvasRef.current.exportImage("png");
        }
      } catch (err) {
        console.error('Error auto-exporting drawing:', err);
      }
    }

    try {
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('package-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('package-media')
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
        mediaType = mediaFile.type.startsWith('video') ? 'video' : 'audio';
      }

      const photoUrls = [];
      for (const file of photoFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('package-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('package-media')
          .getPublicUrl(fileName);
        photoUrls.push(publicUrl);
      }

      const mediaObj = {
        drawing: finalDrawingData,
        fileUrl: mediaUrl,
        fileType: mediaType,
        externalUrl: mediaUrlInput,
        photos: photoUrls
      };

      const { data, error } = await supabase
        .from('packages')
        .insert([
          {
            type: type || 'custom',
            to_name: formData.to_name,
            from_name: formData.from_name,
            message: formData.message,
            items: formData.stickers,
            media: mediaObj
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const link = `${window.location.origin}/package/${data[0].id}`;
        setShareLink(link);
      }
    } catch (error) {
      console.error('Error generating package:', error.message);
      alert('Error creating your package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareLink) {
    return (
      <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', textAlign: 'center' }}
        >
          <Gift size={64} color="#e07a5f" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', marginBottom: '10px' }}>Your Package is Sealed!</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Send this link to {formData.to_name || 'your loved one'}.</p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input 
              type="text" 
              readOnly 
              value={shareLink} 
              style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', background: '#f9f9f9' }}
            />
            <button onClick={copyToClipboard} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          
          <Link to="/" style={{ color: '#e07a5f', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <Link to="/templates" style={{ color: '#2b2b2b', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '500' }}>
          <ArrowLeft size={20} /> Back
        </Link>
      </header>
      
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2.5rem', marginBottom: '30px', textAlign: 'center' }}>
        Craft Your Message
      </h1>
      
      <div className="custom-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px', maxWidth: '100%' }}>
        {['write', 'draw', 'photos', 'media', 'stickers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === tab ? '#e07a5f' : '#fff',
              color: activeTab === tab ? '#fff' : '#666',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab ? '0 4px 10px rgba(224,122,95,0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '700px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', padding: '30px', minHeight: '500px' }}>
        
        {/* WRITE TAB */}
        <div style={{ display: activeTab === 'write' ? 'flex' : 'none', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>To</label>
              <input 
                type="text" 
                name="to_name" 
                value={formData.to_name} 
                onChange={handleInputChange} 
                placeholder="Recipient's name"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '1rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>From</label>
              <input 
                type="text" 
                name="from_name" 
                value={formData.from_name} 
                onChange={handleInputChange} 
                placeholder="Your name"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '1rem' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Message</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleInputChange}
              className="handwriting"
              placeholder="Write something sweet..."
              style={{ flex: 1, width: '100%', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '1.5rem', resize: 'none', lineHeight: '1.6', minHeight: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
            <button onClick={() => setActiveTab('draw')} className="btn-primary">Next: Draw</button>
          </div>
        </div>

        {/* DRAW TAB */}
        <div style={{ display: activeTab === 'draw' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%', background: color, border: strokeColor === color ? '3px solid #ddd' : 'none', cursor: 'pointer',
                    boxShadow: strokeColor === color ? '0 0 0 2px #555' : 'none'
                  }}
                />
              ))}
            </div>
            <button onClick={handleClearDraw} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontWeight: '500' }}>
              <Eraser size={18} /> Clear
            </button>
          </div>
          
          <div style={{ flex: 1, border: '1px dashed #ccc', borderRadius: '12px', overflow: 'hidden', minHeight: '400px' }}>
            <ReactSketchCanvas
              ref={canvasRef}
              strokeWidth={4}
              strokeColor={strokeColor}
              canvasColor="transparent"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button onClick={() => setActiveTab('write')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: '500' }}>Back</button>
            <button onClick={handleDrawNext} className="btn-primary">Next: Photos</button>
          </div>
        </div>

        {/* PHOTOS TAB */}
        <div style={{ display: activeTab === 'photos' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>Add up to 6 photos to your package.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            {photoPreviews.map((preview, index) => (
              <div key={index} style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
                <img src={preview} alt={`preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <button 
                  onClick={() => handleRemovePhoto(index)}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {photoFiles.length < 6 && (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', width: '100%', border: '2px dashed #ddd', borderRadius: '8px', cursor: 'pointer', background: '#fafafa', color: '#888' }}>
                <ImagePlus size={24} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Add Photo</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '20px' }}>
            <button onClick={() => setActiveTab('draw')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: '500' }}>Back</button>
            <button onClick={() => setActiveTab('media')} className="btn-primary">Next: Media</button>
          </div>
        </div>

        {/* MEDIA TAB */}
        <div style={{ display: activeTab === 'media' ? 'flex' : 'none', flexDirection: 'column', gap: '30px', height: '100%' }}>
          <div>
            <h3 style={{ fontFamily: 'Inter', fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>Upload Audio or Video</h3>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: '2px dashed #ddd', borderRadius: '12px', cursor: 'pointer', background: '#fafafa', color: '#666' }}>
              <UploadCloud size={32} style={{ marginBottom: '10px', color: '#e07a5f' }} />
              <span style={{ fontWeight: '500', marginBottom: '5px' }}>{mediaFile ? mediaFile.name : 'Click to browse files'}</span>
              <span style={{ fontSize: '0.85rem', color: '#999' }}>Supports MP3, MP4, WebM (Max 10MB)</span>
              <input type="file" accept="audio/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
            </label>
          </div>
          
          <div style={{ textAlign: 'center', color: '#999', fontWeight: '500' }}>OR</div>
          
          <div>
            <h3 style={{ fontFamily: 'Inter', fontSize: '1.2rem', marginBottom: '10px', color: '#333' }}>Link a YouTube/Spotify URL</h3>
            <input 
              type="url" 
              value={mediaUrlInput} 
              onChange={(e) => setMediaUrlInput(e.target.value)} 
              placeholder="https://..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <button onClick={() => setActiveTab('photos')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: '500' }}>Back</button>
            <button onClick={() => setActiveTab('stickers')} className="btn-primary">Next: Stickers</button>
          </div>
        </div>

        {/* STICKERS TAB */}
        <div style={{ display: activeTab === 'stickers' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
          <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>Choose up to 8 items to include in your package.</p>
          
          <div className="sticker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', overflowY: 'auto', padding: '10px', flex: 1, alignContent: 'start' }}>
            {STICKERS.map((sticker) => {
              const isSelected = formData.stickers.includes(sticker.id);
              return (
                <div 
                  key={sticker.id}
                  onClick={() => toggleSticker(sticker.id)}
                  className="sticker-item"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    opacity: formData.stickers.length >= 8 && !isSelected ? 0.5 : 1
                  }}
                >
                  <img 
                    src={sticker.img} 
                    alt={sticker.label} 
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover',
                      border: isSelected ? '3px solid #e07a5f' : '3px solid transparent',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 12px rgba(224,122,95,0.2)' : '0 2px 6px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <span style={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: '500', color: '#444' }}>{sticker.label}</span>
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <button onClick={() => setActiveTab('media')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: '500' }}>Back</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{formData.stickers.length}/8 selected</span>
              <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                {loading ? 'Sealing...' : 'Seal Package'}
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
