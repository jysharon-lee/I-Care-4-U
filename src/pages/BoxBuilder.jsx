import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { 
  FcLike, FcVideoCall, FcMusic, FcPackage, FcLikePlaceholder, FcReading, FcBiotech, FcHeadset, FcIdea 
} from 'react-icons/fc';
import { ArrowLeft, Copy, CheckCircle, UploadCloud, Eraser, PenTool } from 'lucide-react';
import '../envelope.css';

const ITEMS_DB = {
  getwellsoon: [
    { id: 'soup', label: 'Hot Soup', icon: FcLikePlaceholder },
    { id: 'pill', label: 'Medicine', icon: FcBiotech },
    { id: 'love', label: 'Much Love', icon: FcLike },
    { id: 'tea', label: 'Herbal Tea', icon: FcIdea },
    { id: 'gift', label: 'Surprise', icon: FcPackage },
  ],
  care4u: [
    { id: 'gift', label: 'Surprise Gift', icon: FcPackage },
    { id: 'music', label: 'Mixtape', icon: FcHeadset },
    { id: 'book', label: 'Good Book', icon: FcReading },
    { id: 'love', label: 'Hugs', icon: FcLike },
    { id: 'movie', label: 'Movie Night', icon: FcVideoCall },
  ]
};

export default function BoxBuilder() {
  const { type } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // write, draw, upload, goodies
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    to_name: '',
    from_name: '',
    message: '',
    items: []
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const canvasRef = useRef(null);

  const availableItems = ITEMS_DB[type] || ITEMS_DB.care4u;

  const handleItemToggle = (itemId) => {
    setFormData(prev => {
      const isSelected = prev.items.includes(itemId);
      if (isSelected) {
        return { ...prev, items: prev.items.filter(id => id !== itemId) };
      } else {
        if (prev.items.length >= 4) return prev;
        return { ...prev, items: [...prev.items, itemId] };
      }
    });
  };

  const uploadFileToSupabase = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('package-media')
      .upload(fileName, file);
      
    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    
    const { data } = supabase.storage
      .from('package-media')
      .getPublicUrl(fileName);
      
    return data.publicUrl;
  };

  const handleGenerate = async () => {
    if (!formData.to_name || !formData.from_name) {
      alert("Please fill in who this is to and from!");
      setActiveTab('write');
      return;
    }
    setLoading(true);

    try {
      // 1. Get drawing if exists
      let drawingData = null;
      if (canvasRef.current) {
        const paths = await canvasRef.current.exportPaths();
        if (paths.length > 0) {
          drawingData = await canvasRef.current.exportImage("png");
        }
      }

      // 2. Upload video/audio if exists
      let mediaUrl = null;
      let mediaType = null;
      if (mediaFile) {
        mediaUrl = await uploadFileToSupabase(mediaFile);
        mediaType = mediaFile.type;
      }

      const mediaObj = {
        drawing: drawingData,
        fileUrl: mediaUrl,
        fileType: mediaType,
        externalUrl: mediaUrlInput
      };

      // 3. Save to DB
      const { data, error } = await supabase
        .from('packages')
        .insert([
          {
            type: type,
            to_name: formData.to_name,
            from_name: formData.from_name,
            message: formData.message,
            items: formData.items,
            media: mediaObj
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/package/${data.id}`;
      setShareLink(link);
      setIsOpen(false); // close envelope to show link outside
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

      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 className="title-main" style={{ fontSize: '3rem' }}>
          {type === 'getwellsoon' ? 'Get Well Soon Kit' : 'Care4U Package'}
        </h1>
        <p className="subtitle">Tap the envelope flap to open and pack your box.</p>
      </div>

      {shareLink ? (
        <motion.div initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale: 1}} style={{textAlign: 'center', maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e07a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FcPackage size={50} />
          </div>
          <h2 style={{color: '#253237', marginBottom: '1rem'}}>Package is Sealed & Ready!</h2>
          <p style={{color: '#5c6b73', marginBottom: '2rem'}}>
            Send this link to {formData.to_name} for them to unbox it.
          </p>

          <div style={{ padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', wordBreak: 'break-all', textAlign: 'left', gap: '1rem' }}>
            <span style={{color: '#253237', fontSize: '0.9rem'}}>{shareLink}</span>
            <button onClick={copyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4caf50' : '#e07a5f', padding: '0.5rem' }}>
              {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
            </button>
          </div>
          
          <a href={shareLink} target="_blank" rel="noreferrer" style={{color: '#e07a5f', fontWeight: 'bold', textDecoration: 'none'}}>
            Preview Package
          </a>
        </motion.div>
      ) : (
        <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`}>
          <div className="envelope">
            <div className="envelope-flap" onClick={() => setIsOpen(true)}></div>
            <div className="card-letter">
              <div className="custom-tabs">
                <button className={activeTab === 'write' ? 'active' : ''} onClick={() => setActiveTab('write')}>Write</button>
                <button className={activeTab === 'draw' ? 'active' : ''} onClick={() => setActiveTab('draw')}>Draw</button>
                <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>Media</button>
                <button className={activeTab === 'goodies' ? 'active' : ''} onClick={() => setActiveTab('goodies')}>Goodies</button>
              </div>

              {activeTab === 'write' && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <input type="text" placeholder="To:" value={formData.to_name} onChange={e => setFormData({...formData, to_name: e.target.value})} style={{border: 'none', borderBottom: '1px dashed #ccc', background: 'transparent', fontSize: '1.2rem', padding: '0.5rem', width: '100%'}} />
                    <input type="text" placeholder="From:" value={formData.from_name} onChange={e => setFormData({...formData, from_name: e.target.value})} style={{border: 'none', borderBottom: '1px dashed #ccc', background: 'transparent', fontSize: '1.2rem', padding: '0.5rem', width: '100%'}} />
                  </div>
                  <textarea 
                    className="handwriting"
                    placeholder="Write a sweet message..." 
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{width: '100%', height: '180px', border: 'none', background: 'transparent', resize: 'none', marginTop: '1rem', outline: 'none'}}
                  />
                  <button className="btn-primary" onClick={() => setActiveTab('draw')} style={{alignSelf: 'flex-end', padding: '0.5rem 1.5rem'}}>Next</button>
                </div>
              )}

              {activeTab === 'draw' && (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <span style={{color: '#888'}}>Doodle something!</span>
                    <button onClick={() => canvasRef.current?.clearPaths()} style={{color: '#e07a5f', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <Eraser size={16}/> Clear
                    </button>
                  </div>
                  <div style={{flex: 1, border: '2px dashed #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem'}}>
                    <ReactSketchCanvas
                      ref={canvasRef}
                      strokeWidth={4}
                      strokeColor="#2b2b2b"
                      canvasColor="transparent"
                    />
                  </div>
                  <button className="btn-primary" onClick={() => setActiveTab('upload')} style={{alignSelf: 'flex-end', padding: '0.5rem 1.5rem'}}>Next</button>
                </div>
              )}

              {activeTab === 'upload' && (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                  <p style={{color: '#666', textAlign: 'center', marginTop: '1rem'}}>Upload a voice memo or video clip, OR paste a link from YouTube/Spotify!</p>
                  
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', border: '2px solid #5A9DD6', color: '#5A9DD6', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                  }}>
                    <UploadCloud size={20} />
                    {mediaFile ? mediaFile.name : 'Choose File (Audio/Video)'}
                    <input type="file" accept="audio/*,video/*" style={{display: 'none'}} onChange={(e) => setMediaFile(e.target.files[0])} />
                  </label>

                  <span style={{color: '#aaa', fontWeight: 'bold'}}>— OR —</span>

                  <input 
                    type="url" 
                    placeholder="Paste YouTube, Spotify, or TikTok link here" 
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    style={{width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', background: '#fff'}}
                  />
                  
                  <div style={{marginTop: 'auto', alignSelf: 'stretch', display: 'flex', justifyContent: 'flex-end'}}>
                    <button className="btn-primary" onClick={() => setActiveTab('goodies')} style={{padding: '0.5rem 1.5rem'}}>Next</button>
                  </div>
                </div>
              )}

              {activeTab === 'goodies' && (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                  <p style={{color: '#666', marginBottom: '1rem'}}>Select up to 4 virtual goodies to pack.</p>
                  
                  <div className="sticker-grid">
                    {availableItems.map(item => {
                      const isSelected = formData.items.includes(item.id);
                      return (
                        <button key={item.id} className={`sticker-item ${isSelected ? 'selected' : ''}`} onClick={() => handleItemToggle(item.id)}>
                          <item.icon size={48} />
                          <span style={{fontSize: '0.8rem', marginTop: '0.5rem', color: '#555', fontWeight: 500}}>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div style={{marginTop: 'auto', alignSelf: 'stretch', display: 'flex', justifyContent: 'center'}}>
                    <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{width: '100%', padding: '1rem', fontSize: '1.2rem', marginTop: '1rem', backgroundColor: '#e07a5f'}}>
                      {loading ? 'Sealing Envelope...' : 'Seal & Generate Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
