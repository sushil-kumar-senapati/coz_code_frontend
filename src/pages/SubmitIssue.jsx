import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { pinLookup, submitIssue } from '../api/client';
import { TextT, Microphone, Image, MapPin, CheckCircle, PaperPlaneTilt, Stop, UploadSimple } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitIssue() {
  const { t } = useTranslation();
  const [pinCode, setPinCode] = useState('');
  const [location, setLocation] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [inputType, setInputType] = useState('text');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioError, setAudioError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePinChange = async (val) => {
    setPinCode(val);
    setLocation(null);
    if (val.length === 6) {
      setPinLoading(true);
      try { setLocation(await pinLookup(val)); } catch { /* ignore */ }
      setPinLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await submitIssue({
        submission_pin_code: pinCode,
        input_type: inputType,
        raw_text: text || undefined,
        raw_language: 'en',
        audio_file: audioFile || undefined,
        image_file: imageFile || undefined,
      });
      setTrackingId(result.tracking_id);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="success-container card" style={{ maxWidth: 500, margin: '60px auto' }}>
        <div className="success-icon"><CheckCircle size={48} weight="fill" /></div>
        <h2 className="success-title">{t('submit.success_title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{t('submit.success_msg')}</p>
        <div className="tracking-id">{trackingId}</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('submit.success_desc')}</p>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">{t('submit.title')}</h1>
        <p className="page-subtitle">{t('submit.subtitle')}</p>
      </div>

      {error && <div style={{ padding: '10px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label"><MapPin size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{t('submit.pin_code')}</label>
          <input type="text" className="form-input" placeholder={t('auth.pin_code_placeholder')} value={pinCode} onChange={(e) => handlePinChange(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
          <div className="form-hint">{t('submit.pin_code_help')}</div>
          {pinLoading && <div className="form-hint">{t('common.loading')}</div>}
          {location && (
            <div className="location-grid" style={{ marginTop: 8 }}>
              <div className="form-hint" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                <CheckCircle size={14} weight="fill" /> {t('auth.auto_filled')}
              </div>
              {[
                [t('auth.city'), location.city],
                [t('auth.district'), location.district],
                [t('auth.state'), location.state],
                [t('auth.constituency'), location.mp_constituency],
              ].map(([k, v]) => (
                <div key={k} className="location-field">
                  <span className="location-field-label">{k}</span>
                  <span className="location-field-value">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{t('submit.input_type')}</label>
          <div className="input-type-grid">
            {[
              { type: 'text', icon: <TextT size={28} />, label: t('submit.type_text') },
              { type: 'audio', icon: <Microphone size={28} />, label: t('submit.type_audio') },
              { type: 'image', icon: <Image size={28} />, label: t('submit.type_image') },
            ].map((opt) => (
              <div key={opt.type} className={`input-type-card ${inputType === opt.type ? 'selected' : ''}`} onClick={() => setInputType(opt.type)}>
                <div className="icon">{opt.icon}</div>
                <div className="label">{opt.label}</div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {inputType === 'text' && (
            <motion.div key="text" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="form-group">
              <textarea className="form-input" placeholder={t('submit.text_placeholder')} value={text} onChange={(e) => setText(e.target.value)} rows={5} />
            </motion.div>
          )}
          {inputType === 'audio' && (
            <motion.div key="audio" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="form-group">
              {audioError && <div style={{ padding: '10px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: '0.85rem' }}>{audioError}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
                {/* Record button */}
                <button type="button" className={`btn ${recording ? 'btn-danger' : 'btn-primary'} btn-lg`} onClick={async () => {
                  if (recording) {
                    // Stop recording
                    mediaRecorderRef.current?.stop();
                    clearInterval(timerRef.current);
                    setRecording(false);
                  } else {
                    // Start recording — request mic permission
                    setAudioError('');
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                      const mediaRecorder = new MediaRecorder(stream);
                      mediaRecorderRef.current = mediaRecorder;
                      audioChunksRef.current = [];
                      setAudioDuration(0);

                      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
                      mediaRecorder.onstop = () => {
                        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        const file = new File([blob], 'voice_recording.webm', { type: 'audio/webm' });
                        setAudioFile(file);
                        stream.getTracks().forEach(t => t.stop());
                      };
                      mediaRecorder.start();
                      setRecording(true);

                      // Timer
                      let sec = 0;
                      timerRef.current = setInterval(() => { sec++; setAudioDuration(sec); if (sec >= 60) { mediaRecorder.stop(); clearInterval(timerRef.current); setRecording(false); } }, 1000);
                    } catch (err) {
                      setAudioError('Microphone access denied. Please allow microphone permission in your browser and try again.');
                    }
                  }
                }}>
                  {recording ? <><Stop size={20} /> {t('submit.record_stop')}</> : <><Microphone size={20} /> {t('submit.record_start')}</>}
                </button>

                {recording && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontWeight: 600, color: 'var(--danger)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                      {String(Math.floor(audioDuration / 60)).padStart(2, '0')}:{String(audioDuration % 60).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(max 60s)</span>
                  </div>
                )}

                {audioFile && !recording && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}>
                    <CheckCircle size={18} weight="fill" />
                    <span style={{ fontWeight: 600 }}>{audioFile.name} ({(audioFile.size / 1024).toFixed(0)} KB)</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAudioFile(null)} style={{ color: 'var(--danger)' }}>Remove</button>
                  </div>
                )}

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {/* Upload existing audio file */}
                <button type="button" className="btn btn-secondary" onClick={() => document.getElementById('audioUpload').click()}>
                  <UploadSimple size={18} /> Upload Audio File
                </button>
                <input id="audioUpload" type="file" accept="audio/*" hidden onChange={(e) => {
                  if (e.target.files[0]) { setAudioFile(e.target.files[0]); setAudioError(''); }
                }} />
                <p className="form-hint" style={{ textAlign: 'center' }}>Supports .mp3, .wav, .webm, .ogg, .m4a (max 60 seconds)</p>
              </div>
            </motion.div>
          )}
          {inputType === 'image' && (
            <motion.div key="image" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="form-group">
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('imgInput').click()}>
                <Image size={40} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                <p style={{ fontWeight: 600 }}>{t('submit.upload_image')}</p>
                <p className="form-hint">{t('submit.upload_image_help')}</p>
                <input id="imgInput" type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files[0])} />
              </div>
              {imageFile && <p style={{ marginTop: 8, color: 'var(--success)' }}><CheckCircle size={16} weight="fill" /> {imageFile.name}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
          <PaperPlaneTilt size={20} weight="bold" /> {loading ? t('submit.submitting') : t('submit.submit_btn')}
        </button>
      </form>
    </div>
  );
}
