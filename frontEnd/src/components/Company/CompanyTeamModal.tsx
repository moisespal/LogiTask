import React, { useState, useEffect } from 'react';
import '../../styles/components/TeamModal.css';
import api from '../../api';

interface TeamMember {
  email: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

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
  if (!isOpen) return;
  
  const getworkers = async () => {
    try {
      const response = await api.get(`/api/user/workers/`, {});
      if (response.data && response.data.emails) {
        const members = response.data.emails.map((email: string) => ({
          email: email
        }));
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };
  
  getworkers();
}, [isOpen]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const username = newEmail;
    const password = newPassword;

    const createworker = async () => {
      await api.post("/api/worker/create/",  { username, password });
    };
    createworker()
      .then(() => {
        alert('Worker created successfully');
        setTeamMembers([...teamMembers, { email: newEmail }]);
      })
      .catch((error) => {
        console.error('Error creating worker:', error);
      });
    
    
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
          {teamMembers.map(member => (
            <div className="team-member-card"> 
              <div className="member-avatar">
                <i className="fa-solid fa-user"></i>
              </div>

              <div className="member-info">
                <div className="member-email">{member.email}</div>
              </div>
              <div className="member-role">Worker</div>
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
                placeholder="Enter email"
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
                placeholder="Enter password"
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