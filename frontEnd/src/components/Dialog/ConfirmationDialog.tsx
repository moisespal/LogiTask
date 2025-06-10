import React from 'react';
import '../../styles/components/ConfirmationDialog.css';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}
  
  const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, title, message, onConfirm, onCancel }) => (
    open ?(
        <div className="dialog-overlay">
            <div className="dialog-container">
                <h3 className="dialog-title">{title}</h3>
                <div className="dialog-message">{message}</div>
                <div className="dialog-buttons">
                    <button className="dialog-button cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="dialog-button confirm-button" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    ) : null
  );


export default ConfirmationDialog;