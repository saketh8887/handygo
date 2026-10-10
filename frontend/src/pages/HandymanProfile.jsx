import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Wrench, Plus, Trash2, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export default function HandymanProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add skill modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: 'Electrical Wiring & Breakers',
    proficiencyLevel: 'EXPERT',
    yearsExperience: 5,
    certificationName: 'Certified Master Electrician',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/handyman/profile');
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to load handyman profile:', err);
      setError('Could not load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.put('/handyman/profile', profile);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/handyman/skills', newSkill);
      setShowSkillModal(false);
      setSuccess('Skill added successfully.');
      fetchProfile();
    } catch (err) {
      console.error('Add skill failed:', err);
      setError('Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await api.delete(`/handyman/skills/${skillId}`);
      setSuccess('Skill deleted.');
      fetchProfile();
    } catch (err) {
      console.error('Delete skill failed:', err);
      setError('Failed to delete skill.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Technician Profile &amp; Qualifications</h2>
        <p className="text-muted mb-0">Maintain your professional skills, service zones, and working schedule</p>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <CheckCircle2 size={18} />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: General Profile Info */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <ShieldCheck className="text-primary" /> Profile &amp; Rate Settings
            </h5>

            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Hourly Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={profile?.hourlyRate || ''}
                    onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Years of Experience</label>
                  <input
                    type="number"
                    className="form-control"
                    value={profile?.experienceYears || ''}
                    onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value, 10) })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Service Coverage Zones</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile?.serviceAreas || ''}
                    onChange={(e) => setProfile({ ...profile, serviceAreas: e.target.value })}
                    required
                  />
                  <div className="form-text">Comma-separated regions where you are eligible to accept dispatches.</div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Professional Bio</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  ></textarea>
                </div>

                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary px-4 py-2" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Skills Portfolio */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Wrench className="text-primary" /> Skills &amp; Certifications
              </h5>
              <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => setShowSkillModal(true)}>
                <Plus size={16} /> Add Skill
              </button>
            </div>
            <p className="text-muted small mb-3">
              The automated dispatch engine evaluates these skills when scoring your suitability for incoming customer bookings.
            </p>

            {profile?.skills?.length === 0 ? (
              <div className="text-center py-4 bg-light rounded-3">
                <p className="text-muted mb-2">No skills registered yet.</p>
                <button className="btn btn-sm btn-primary" onClick={() => setShowSkillModal(true)}>Add Your First Skill</button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {profile?.skills?.map((sk) => (
                  <div key={sk.id} className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-dark">{sk.skillName}</div>
                      <div className="small text-muted">
                        Proficiency: <span className="badge bg-secondary">{sk.proficiencyLevel}</span> | {sk.yearsExperience} yrs exp
                      </div>
                      {sk.certificationName && (
                        <div className="small text-success mt-1">Cert: {sk.certificationName}</div>
                      )}
                    </div>
                    <button className="btn btn-outline-danger btn-sm p-1" onClick={() => handleDeleteSkill(sk.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Professional Skill</h5>
                <button type="button" className="btn-close" onClick={() => setShowSkillModal(false)}></button>
              </div>
              <form onSubmit={handleAddSkill}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Skill Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Pipe Fitting, Circuit Breakers, Drywall Repair"
                      value={newSkill.skillName}
                      onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Proficiency</label>
                      <select
                        className="form-select"
                        value={newSkill.proficiencyLevel}
                        onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })}
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="EXPERT">Expert</option>
                        <option value="MASTER">Master</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Years of Exp</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newSkill.yearsExperience}
                        onChange={(e) => setNewSkill({ ...newSkill, yearsExperience: parseInt(e.target.value, 10) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Certification Name (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. OSHA 30, Licensed Journeyman"
                      value={newSkill.certificationName}
                      onChange={(e) => setNewSkill({ ...newSkill, certificationName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowSkillModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Skill</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
