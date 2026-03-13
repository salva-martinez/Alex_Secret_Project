'use client';

import { useState, ReactElement, useCallback } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { FileType } from '@prisma/client';

interface UploadResponse {
  uploadUrl: string;
  fileKey: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUploadSuccess 
}: UploadModalProps): ReactElement | null {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Max 100MB.');
      } else {
        setError('Invalid file type or format.');
      }
      return;
    }
    
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      // Auto-populate title if empty
      if (!title) {
        setTitle(acceptedFiles[0].name.split('.')[0]);
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
    }
  });

  if (!isOpen) return null;

  const getFileType = (mimeType: string): FileType => {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;
    return FileType.DOCUMENT;
  };

  const performUpload = async (): Promise<void> => {
    if (!file) return;
    
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name.split('.')[0]);
      formData.append('type', getFileType(file.type));

      console.log('Initiating local upload for:', file.name);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      console.log('Upload successful!');
      onUploadSuccess();
      onClose();
      
      // Reset state
      setFile(null);
      setTitle('');
    } catch (err: unknown) {
      console.error('Upload failed', err);
      setError(err instanceof Error ? err.message : 'Unknown error during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <h2 className="font-display text-neon-cyan">Push to Vault</h2>
        
        <div className="input-group">
          <label>VAULT_TITLE</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Neon Skyline..." 
            className="synth-input"
          />
        </div>

        <div className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`} {...getRootProps()}>
          <input {...getInputProps()} />
          {file ? (
            <div className="file-info">
              <span className="file-name text-neon-pink">{file.name}</span>
              <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          ) : (
            <p>{isDragActive ? "DROP_IT_NOW" : "DRAG_&_DROP_OR_CLICK"}</p>
          )}
        </div>

        {error && <p className="error-text text-neon-pink">{error}</p>}

        <div className="modal-actions">
          <button onClick={onClose} className="btn-link" disabled={uploading}>CANCEL</button>
          <button 
            onClick={performUpload} 
            className="btn-primary" 
            disabled={uploading || !file}
          >
            {uploading ? 'PUSHING_TO_S3...' : 'INITIATE_UPLOAD'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        .modal-content {
          padding: 2.5rem;
          width: 90%; max-width: 500px;
          display: flex; flex-direction: column; gap: 1.5rem;
          box-shadow: 0 0 30px rgba(5, 217, 232, 0.2);
        }
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group label {
          font-family: 'Righteous', cursive;
          font-size: 0.8rem; color: var(--accent-pink);
          letter-spacing: 2px;
        }
        .synth-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          padding: 12px; color: white; border-radius: 4px;
          outline: none; transition: border-color 0.3s;
        }
        .synth-input:focus { border-color: var(--accent-cyan); }
        .dropzone {
          border: 2px dashed var(--glass-border);
          padding: 2rem; text-align: center; cursor: pointer;
          transition: all 0.3s; border-radius: 8px;
          background: rgba(255,255,255,0.02);
        }
        .dropzone:hover, .dropzone.active {
          border-color: var(--accent-cyan);
          background: rgba(5, 217, 232, 0.05);
          box-shadow: inset 0 0 10px rgba(5, 217, 232, 0.1);
        }
        .dropzone.has-file { border-style: solid; border-color: var(--accent-pink); }
        .file-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .file-name { font-weight: bold; overflow: hidden; text-overflow: ellipsis; }
        .file-size { font-size: 0.8rem; color: var(--text-muted); }
        .error-text { font-size: 0.8rem; text-align: center; background: rgba(255,42,109,0.1); padding: 8px; border-radius: 4px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 2rem; align-items: center; }
        .btn-link {
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; font-family: 'Righteous', cursive;
        }
        .btn-link:hover { color: white; }
      `}} />
    </div>
  );
}
