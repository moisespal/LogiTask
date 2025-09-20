import React, { useState, useEffect, useRef} from 'react';
import { PropertyNote, ScheduleNote } from '../../types/noteTypes';
import '../../styles/components/modal.css';
import '../../styles/components/NoteFormModal.css';
import api from '../../api';
import { formatUTCtoLocal } from '../../utils/format';

export type NoteType = 'property' | 'schedule';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteType: NoteType;
  targetId: number;
  existingNote?: PropertyNote | ScheduleNote | null;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  isOpen,
  onClose,
  noteType,
  targetId,
  existingNote
}) => {
  const [content, setContent] = useState('');
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const userTimeZone = localStorage.getItem("userTimeZone") ?? "UTC";

    useEffect(() => {
        if (existingNote?.content) {
        setContent(existingNote.content);
        } 
    }, [existingNote]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(autoResizeTextarea, 0);
        }
    }, [isOpen, content]);

    const autoResizeTextarea = () => {
        const textarea = notesTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleClose = () => {
        onClose();
        setContent('');
    }

    
    const createNote = async (noteType : string) => {
      await api.post(`/api/${noteType}/${targetId}/notes/`,  { title: "title", content:content});
      handleClose();
    };
   

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container note-form-container">
        <button className="modal-close-btn" onClick={handleClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h3>{existingNote ? `Edit ${noteType} Note` : `Create ${noteType} Note`}</h3>
        {existingNote && (
          <h4> {existingNote.created_at ? formatUTCtoLocal(existingNote.created_at, userTimeZone) : ""}</h4>
        )}
        <textarea
          className="adjustment-notes"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setTimeout(() => autoResizeTextarea(), 0);
          }
          }
          placeholder={`Enter ${noteType} note here...`}
          maxLength={2000}
          ref={notesTextareaRef}
        />

        <div className="modal-btn-container">
          <button className="modal-btn modal-btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-submit"
            disabled={content.trim().length === 0}
            onClick={() =>
              createNote(noteType)
            }
          >
            {existingNote ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteFormModal;
