import React, { useState, useEffect } from 'react';
import '../../styles/components/TeamModal.css';

interface TeamMember {
  id: number;
  email: string;
  role: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [teamMembers] = useState<TeamMember[]>([
    { id: 1, email: 'john@company.com', role: 'Worker' },
    { id: 2, email: 'jane@company.com', role: 'Worker' }
  ]);

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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding member:', { email: newEmail, password: newPassword });
    
    setNewEmail('');
    setNewPassword('');
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setNewEmail('');
    setNewPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="team-modal-overlay">
      <div className="team-modal-container">
        <button 
          type="button"
          className="close-modal-btn" 
          onClick={handleCancel}
          aria-label="Close"
        >
          <i className="fas fa-xmark"></i>
        </button>
        
        <h3>Team Members</h3>
        
        <div className="team-members-list">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-member-card">
              <div className="member-avatar">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="member-info">
                <div className="member-email">{member.email}</div>
              </div>
              {member.role && (
                <div className="member-role">{member.role}</div>
              )}
            </div>
          ))}
        </div>

        {/* Add Member Form */}
        {showAddForm ? (
          <form onSubmit={handleAddMember} className="add-member-form">
            <h4>Add New Team Member</h4>
            <div className="form-group">
              <label htmlFor="member-email">Email</label>
              <input
                id="member-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newmember@company.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="member-password">Password</label>
              <input
                id="member-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Set initial password"
                required
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
              >
                Add Member
              </button>
            </div>
          </form>
        ) : (
          <button 
            className="add-member-btn"
            onClick={() => setShowAddForm(true)}
          >
            Add Team Member
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamModal;