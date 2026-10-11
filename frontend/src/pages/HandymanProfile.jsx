import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Wrench, Plus, Trash2, CheckCircle2, AlertCircle, Clock, 
  ShieldCheck, Award, Briefcase, MapPin, User, Check, X, Users,
  Calendar
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

export default function HandymanProfile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [specializationsList, setSpecializationsList] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Specialization modal
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [selectedPrimarySpec, setSelectedPrimarySpec] = useState('');
  const [selectedAdditionalSpecs, setSelectedAdditionalSpecs] = useState([]);

  // Add skill modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    proficiencyLevel: 'EXPERT',
    yearsExperience: 5,
    certificationName: '',
  });

  // Add certification modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCert, setNewCert] = useState({
    certificationName: '',
    licenseNumber: '',
    issuingAuthority: '',
    expiresAt: '',
  });

  // Department & Team Memberships
  const [availableTeams, setAvailableTeams] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamRequest, setTeamRequest] = useState({
    teamId: '',
    notes: '',
  });
  const [submittingTeam, setSubmittingTeam] = useState(false);

  useEffect(() => {
    fetchProfileAndData();
  }, []);

  const fetchProfileAndData = async () => {
    try {
      setLoading(true);
      const [profRes, specRes, skillRes, teamRes] = await Promise.allSettled([
        api.get('/handyman/profile'),
        api.get('/specializations'),
        api.get('/skills'),
        api.get('/teams'),
      ]);

      if (profRes.status === 'fulfilled') {
        const p = profRes.value.data.data;
        setProfile(p);
        const primary = p.specializations?.find(s => s.isPrimary)?.specializationId?.toString() || '';
        const additionals = p.specializations?.filter(s => !s.isPrimary).map(s => s.specializationId?.toString()) || [];
        setSelectedPrimarySpec(primary);
        setSelectedAdditionalSpecs(additionals);

        // Populate weekly working schedule
        const currentAvails = p.availabilities || [];
        const mappedSchedule = DAYS_OF_WEEK.map(d => {
          const match = currentAvails.find(a => a.dayOfWeek?.toUpperCase() === d.key);
          return {
            dayOfWeek: d.key,
            label: d.label,
            startTime: match?.startTime ? match.startTime.substring(0, 5) : '08:00',
            endTime: match?.endTime ? match.endTime.substring(0, 5) : '17:00',
            isActive: match ? (match.isActive ?? true) : (d.key !== 'SATURDAY' && d.key !== 'SUNDAY'),
          };
        });
        setWeeklySchedule(mappedSchedule);
      }
      if (specRes.status === 'fulfilled') {
        setSpecializationsList(specRes.value.data.data || []);
      }
      if (skillRes.status === 'fulfilled') {
        setCatalogSkills(skillRes.value.data.data || []);
      }
      if (teamRes.status === 'fulfilled') {
        setAvailableTeams(teamRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load handyman profile:', err);
      setError('Could not load profile details.');
      showToast('Could not load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScheduleDay = (dayKey, field, value) => {
    setWeeklySchedule(prev => prev.map(item => {
      if (item.dayOfWeek === dayKey) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSaveWeeklySchedule = async (e) => {
    e.preventDefault();
    try {
      setSavingSchedule(true);
      const payload = weeklySchedule.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime?.length === 5 ? `${s.startTime}:00` : (s.startTime || '08:00:00'),
        endTime: s.endTime?.length === 5 ? `${s.endTime}:00` : (s.endTime || '17:00:00'),
        isActive: Boolean(s.isActive),
      }));
      await api.put('/handyman/availability', payload);
      showToast('Weekly availability & working hours updated successfully!', 'success');
      fetchProfileAndData();
    } catch (err) {
      console.error('Failed to update working hours:', err);
      const msg = err.response?.data?.message || 'Failed to update schedule.';
      showToast(msg, 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleRequestJoinTeam = async (e) => {
    e.preventDefault();
    if (!teamRequest.teamId) {
      showToast('Please select a department to join.', 'warning');
      return;
    }
    try {
      setSubmittingTeam(true);
      await api.post('/handyman/teams/request', {
        teamId: parseInt(teamRequest.teamId, 10),
        notes: teamRequest.notes || 'Technician requested department membership via profile',
      });
      showToast('Department membership request submitted for administrator review!', 'success');
      setShowTeamModal(false);
      setTeamRequest({ teamId: '', notes: '' });
      fetchProfileAndData();
    } catch (err) {
      console.error('Failed to request team membership:', err);
      const msg = err.response?.data?.message || 'Failed to submit department request.';
      showToast(msg, 'error');
    } finally {
      setSubmittingTeam(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.put('/handyman/profile', profile);
      const msg = 'Profile, workload, and availability updated successfully.';
      setSuccess(msg);
      showToast(msg, 'success');
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSpecializations = async (e) => {
    e.preventDefault();
    try {
      const payload = [];
      if (selectedPrimarySpec) {
        payload.push({
          specializationId: parseInt(selectedPrimarySpec, 10),
          isPrimary: true,
        });
      }
      selectedAdditionalSpecs.forEach(specId => {
        if (specId !== selectedPrimarySpec) {
          payload.push({
            specializationId: parseInt(specId, 10),
            isPrimary: false,
          });
        }
      });

      await api.put('/handyman/specializations', payload);
      showToast('Specializations updated successfully!', 'success');
      setShowSpecModal(false);
      fetchProfileAndData();
    } catch (err) {
      console.error('Failed to update specializations:', err);
      showToast('Failed to update specializations.', 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/handyman/skills', newSkill);
      setShowSkillModal(false);
      showToast('Trade skill registered and queued for verification.', 'success');
      setNewSkill({
        skillName: '',
        proficiencyLevel: 'EXPERT',
        yearsExperience: 5,
        certificationName: '',
      });
      fetchProfileAndData();
    } catch (err) {
      console.error('Add skill failed:', err);
      showToast('Failed to add skill.', 'error');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Remove this skill from your portfolio?')) return;
    try {
      await api.delete(`/handyman/skills/${skillId}`);
      showToast('Skill removed.', 'info');
      fetchProfileAndData();
    } catch (err) {
      console.error('Delete skill failed:', err);
      showToast('Failed to remove skill.', 'error');
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    try {
      await api.post('/handyman/certifications', newCert);
      setShowCertModal(false);
      showToast('Trade certification submitted for compliance review.', 'success');
      setNewCert({
        certificationName: '',
        licenseNumber: '',
        issuingAuthority: '',
        expiresAt: '',
      });
      fetchProfileAndData();
    } catch (err) {
      console.error('Add certification failed:', err);
      showToast('Failed to submit certification.', 'error');
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await api.delete(`/handyman/certifications/${certId}`);
      showToast('Certification removed.', 'info');
      fetchProfileAndData();
    } catch (err) {
      console.error('Delete cert failed:', err);
      showToast('Failed to remove certification.', 'error');
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

  const primarySpec = profile?.specializations?.find(s => s.isPrimary);
  const additionalSpecs = profile?.specializations?.filter(s => !s.isPrimary) || [];

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Technician Workbench', path: '/handyman' },
          { label: 'Profile & Trade Specializations' }
        ]}
      />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
              Technician Profile &amp; Qualifications
            </h2>
            {profile?.isVerified ? (
              <span className="hc-badge hc-badge-success" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={12} className="me-0.5" /> Verified Specialist
              </span>
            ) : (
              <span className="badge bg-warning bg-opacity-20 text-dark border border-warning" style={{ fontSize: '0.75rem' }}>
                Pending Review
              </span>
            )}
          </div>
          <p className="text-secondary small mb-0">
            Maintain your verified trade specializations, workload limits, licenses, and service zones
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4 small rounded-3" role="alert">
          <CheckCircle2 size={16} />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 small rounded-3" role="alert">
          <AlertCircle size={16} />
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: General Profile & Operational Controls */}
        <div className="col-12 col-lg-6">
          <div className="hc-card p-4 border-0 shadow-sm mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 pb-2 border-bottom" style={{ fontSize: '1.1rem' }}>
              <ShieldCheck className="text-primary" size={18} /> Profile &amp; Operational Controls
            </h5>

            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Hourly Labor Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control form-control-sm"
                    value={profile?.hourlyRate || ''}
                    onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Years of Trade Experience</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={profile?.experienceYears || ''}
                    onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value, 10) })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Max Concurrent Workload</label>
                  <select
                    className="form-select form-select-sm"
                    value={profile?.maxActiveWorkload || 3}
                    onChange={(e) => setProfile({ ...profile, maxActiveWorkload: parseInt(e.target.value, 10) })}
                  >
                    <option value="1">1 Active Job Max</option>
                    <option value="2">2 Active Jobs Max</option>
                    <option value="3">3 Active Jobs Max (Default)</option>
                    <option value="4">4 Active Jobs Max</option>
                    <option value="5">5 Active Jobs Max</option>
                  </select>
                  <div className="form-text" style={{ fontSize: '0.72rem' }}>
                    Prevents dispatching new jobs once reached.
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Current Availability Status</label>
                  <select
                    className="form-select form-select-sm"
                    value={profile?.availabilityStatus || 'AVAILABLE'}
                    onChange={(e) => setProfile({ ...profile, availabilityStatus: e.target.value })}
                  >
                    <option value="AVAILABLE">Available for Jobs</option>
                    <option value="BUSY">Busy (Temporarily)</option>
                    <option value="ON_BREAK">On Break</option>
                    <option value="OFF_DUTY">Off Duty</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small text-dark">Profile Photo URL</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="https://..."
                    value={profile?.profilePhotoUrl || ''}
                    onChange={(e) => setProfile({ ...profile, profilePhotoUrl: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small text-dark">Authorized Service Coverage Zones</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile?.serviceAreas || ''}
                    onChange={(e) => setProfile({ ...profile, serviceAreas: e.target.value })}
                    required
                  />
                  <div className="form-text" style={{ fontSize: '0.72rem' }}>Comma-separated regions (e.g. Downtown Metro, North Suburbs).</div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small text-dark">Professional Bio</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  ></textarea>
                </div>

                <div className="col-12 mt-3">
                  <button type="submit" className="btn btn-primary px-4 py-2 btn-sm fw-medium shadow-sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Settings'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Trade Specializations Box */}
          <div className="hc-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <Briefcase className="text-primary" size={18} /> Trade Specializations
              </h5>
              <button className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-3" onClick={() => setShowSpecModal(true)}>
                Configure Specializations
              </button>
            </div>

            <div className="mb-2">
              <span className="text-secondary small d-block mb-1">Primary Trade Specialization:</span>
              {primarySpec ? (
                <span className="badge bg-primary text-white px-3 py-1.5 rounded-pill" style={{ fontSize: '0.8rem' }}>
                  ★ {primarySpec.specializationName} (Primary)
                </span>
              ) : (
                <span className="badge bg-light text-secondary border">None configured</span>
              )}
            </div>

            <div className="mt-3">
              <span className="text-secondary small d-block mb-1">Secondary Trade Specializations:</span>
              {additionalSpecs.length > 0 ? (
                <div className="d-flex flex-wrap gap-1.5">
                  {additionalSpecs.map(s => (
                    <span key={s.id} className="badge bg-light text-dark border px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                      {s.specializationName}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted small">No secondary trades set.</span>
              )}
            </div>
          </div>

          {/* Weekly Working Days & Hours Schedule */}
          <div className="hc-card p-4 border-0 shadow-sm mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                  <Clock className="text-primary" size={18} /> Working Days &amp; Hours Schedule
                </h5>
                <span className="text-secondary small">Defines active dispatch slots and prevents schedule conflicts</span>
              </div>
            </div>

            <form onSubmit={handleSaveWeeklySchedule}>
              <div className="d-flex flex-column gap-2 mb-3">
                {weeklySchedule.map((slot) => (
                  <div key={slot.dayOfWeek} className="p-2.5 bg-light rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                    <div className="d-flex align-items-center gap-2" style={{ minWidth: '130px' }}>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`switch-${slot.dayOfWeek}`}
                          checked={slot.isActive}
                          onChange={(e) => handleUpdateScheduleDay(slot.dayOfWeek, 'isActive', e.target.checked)}
                        />
                      </div>
                      <label htmlFor={`switch-${slot.dayOfWeek}`} className={`small fw-semibold mb-0 ${slot.isActive ? 'text-dark' : 'text-muted'}`} style={{ cursor: 'pointer' }}>
                        {slot.label}
                      </label>
                    </div>

                    {slot.isActive ? (
                      <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-sm-end">
                        <div className="d-flex align-items-center gap-1">
                          <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>From</span>
                          <input
                            type="time"
                            className="form-control form-control-sm text-center py-1 px-2"
                            style={{ width: '100px' }}
                            value={slot.startTime}
                            onChange={(e) => handleUpdateScheduleDay(slot.dayOfWeek, 'startTime', e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>to</span>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="time"
                            className="form-control form-control-sm text-center py-1 px-2"
                            style={{ width: '100px' }}
                            value={slot.endTime}
                            onChange={(e) => handleUpdateScheduleDay(slot.dayOfWeek, 'endTime', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border small py-1 px-2">
                        Day Off
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3 py-1.5 fw-medium shadow-sm d-inline-flex align-items-center gap-1.5"
                  disabled={savingSchedule}
                >
                  <Clock size={14} /> {savingSchedule ? 'Saving Schedule...' : 'Save Working Hours'}
                </button>
              </div>
            </form>
          </div>

          {/* Department & Team Memberships Box */}
          <div className="hc-card p-4 border-0 shadow-sm mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                  <Users className="text-primary" size={18} /> Department &amp; Team Memberships
                </h5>
                <span className="text-secondary small">Specialized service departments for automated dispatch routing</span>
              </div>
              <button 
                type="button"
                className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-3 d-inline-flex align-items-center gap-1"
                onClick={() => setShowTeamModal(true)}
              >
                <Plus size={14} /> Request Department
              </button>
            </div>

            {(!profile?.teamMemberships || profile.teamMemberships.length === 0) ? (
              <div className="text-center py-4 bg-light rounded-3">
                <Users size={24} className="text-secondary opacity-50 mb-2" />
                <p className="text-muted small mb-2">No service department memberships recorded.</p>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => setShowTeamModal(true)}>
                  Apply to Join a Department
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {profile.teamMemberships.map((tm) => (
                  <div key={tm.id || tm.teamId} className="p-3 bg-light rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold text-dark">{tm.teamName}</span>
                        <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.68rem' }}>
                          {tm.teamCode}
                        </span>
                        {tm.isPrimary && (
                          <span className="badge bg-primary text-white" style={{ fontSize: '0.68rem' }}>
                            ★ Primary Team
                          </span>
                        )}
                        <span className={`badge ${
                          tm.approvalStatus === 'APPROVED'
                            ? 'bg-success bg-opacity-15 text-success border border-success'
                            : tm.approvalStatus === 'REJECTED'
                            ? 'bg-danger bg-opacity-15 text-danger border border-danger'
                            : 'bg-warning bg-opacity-20 text-warning border border-warning'
                        }`} style={{ fontSize: '0.68rem' }}>
                          {tm.approvalStatus === 'APPROVED' ? 'Active Member' : tm.approvalStatus === 'PENDING' ? 'Approval Pending' : 'Application Rejected'}
                        </span>
                      </div>
                      {tm.notes && (
                        <div className="text-secondary small mt-1" style={{ fontSize: '0.74rem' }}>
                          Notes: {tm.notes}
                        </div>
                      )}
                      {tm.approvedByUserName && tm.approvalStatus === 'APPROVED' && (
                        <div className="text-muted mt-0.5" style={{ fontSize: '0.7rem' }}>
                          Approved by {tm.approvedByUserName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Skills & Certifications */}
        <div className="col-12 col-lg-6">
          {/* Skills Portfolio */}
          <div className="hc-card p-4 border-0 shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <Wrench className="text-primary" size={18} /> Registered Trade Skills
              </h5>
              <button className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-3 d-inline-flex align-items-center gap-1" onClick={() => setShowSkillModal(true)}>
                <Plus size={14} /> Add Skill
              </button>
            </div>

            {profile?.skills?.length === 0 ? (
              <div className="text-center py-4 bg-light rounded-3">
                <p className="text-muted small mb-2">No individual trade skills registered.</p>
                <button className="btn btn-sm btn-primary" onClick={() => setShowSkillModal(true)}>Add Your First Skill</button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {profile?.skills?.map((sk) => (
                  <div key={sk.id} className="p-2.5 bg-light rounded-3 d-flex justify-content-between align-items-center border">
                    <div>
                      <div className="fw-bold text-dark small">{sk.skillName}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        Proficiency: <span className="badge bg-secondary ms-1">{sk.proficiencyLevel}</span> • {sk.yearsExperience} yrs exp
                        {sk.isVerified && (
                          <span className="badge bg-success bg-opacity-15 text-success border border-success ms-1.5">
                            <Check size={9} className="inline" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-link text-danger p-0" onClick={() => handleDeleteSkill(sk.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Licenses & Certifications */}
          <div className="hc-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <Award className="text-primary" size={18} /> Trade Licenses &amp; Credentials
              </h5>
              <button className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-3 d-inline-flex align-items-center gap-1" onClick={() => setShowCertModal(true)}>
                <Plus size={14} /> Add License
              </button>
            </div>

            {profile?.certifications?.length === 0 ? (
              <div className="text-center py-4 bg-light rounded-3">
                <p className="text-muted small mb-2">No trade licenses logged yet.</p>
                <button className="btn btn-sm btn-primary" onClick={() => setShowCertModal(true)}>Submit Trade License</button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {profile?.certifications?.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-3 border d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-dark small">{c.certificationName}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        License #: <span className="font-monospace text-dark">{c.licenseNumber || 'N/A'}</span> • {c.issuingAuthority}
                      </div>
                      <div className="mt-1">
                        {c.isVerified ? (
                          <span className="badge bg-success bg-opacity-15 text-success border border-success" style={{ fontSize: '0.68rem' }}>
                            <Check size={10} className="inline me-0.5" /> Authenticated &amp; Active
                          </span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-20 text-warning border border-warning" style={{ fontSize: '0.68rem' }}>
                            <Clock size={10} className="inline me-0.5" /> Compliance Audit Pending
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="btn btn-link text-danger p-0" onClick={() => handleDeleteCert(c.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specializations Modal */}
      {showSpecModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-dark">Configure Trade Specializations</h5>
                <button type="button" className="btn-close" onClick={() => setShowSpecModal(false)}></button>
              </div>
              <form onSubmit={handleSaveSpecializations}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark small">Primary Trade Specialization:</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedPrimarySpec}
                      onChange={(e) => setSelectedPrimarySpec(e.target.value)}
                      required
                    >
                      <option value="">-- Select Primary Trade --</option>
                      {specializationsList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <div className="form-text" style={{ fontSize: '0.72rem' }}>
                      Your main professional category for algorithm priority scoring.
                    </div>
                  </div>

                  <div>
                    <label className="form-label fw-bold text-dark small mb-2">Additional Trade Specializations:</label>
                    <div className="d-flex flex-column gap-2">
                      {specializationsList.filter(s => s.id.toString() !== selectedPrimarySpec).map(s => {
                        const checked = selectedAdditionalSpecs.includes(s.id.toString());
                        return (
                          <div key={s.id} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`spec-${s.id}`}
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAdditionalSpecs([...selectedAdditionalSpecs, s.id.toString()]);
                                } else {
                                  setSelectedAdditionalSpecs(selectedAdditionalSpecs.filter(id => id !== s.id.toString()));
                                }
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`spec-${s.id}`}>
                              {s.name} <span className="text-secondary" style={{ fontSize: '0.7rem' }}>({s.description})</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowSpecModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Save Specializations</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-dark">Register Trade Skill</h5>
                <button type="button" className="btn-close" onClick={() => setShowSkillModal(false)}></button>
              </div>
              <form onSubmit={handleAddSkill}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Trade Skill Title</label>
                    <input
                      type="text"
                      list="catalogSkillsList"
                      className="form-control form-control-sm"
                      placeholder="e.g. Pipe Fitting, Circuit Breakers, Drywall Repair"
                      value={newSkill.skillName}
                      onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                      required
                    />
                    <datalist id="catalogSkillsList">
                      {catalogSkills.map(s => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small text-dark">Proficiency Level</label>
                      <select
                        className="form-select form-select-sm"
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
                      <label className="form-label fw-semibold small text-dark">Years of Experience</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={newSkill.yearsExperience}
                        onChange={(e) => setNewSkill({ ...newSkill, yearsExperience: parseInt(e.target.value, 10) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Associated Certification (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Master Plumber License, EPA 608"
                      value={newSkill.certificationName}
                      onChange={(e) => setNewSkill({ ...newSkill, certificationName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowSkillModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Register Skill</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-dark">Submit Trade License / Credential</h5>
                <button type="button" className="btn-close" onClick={() => setShowCertModal(false)}></button>
              </div>
              <form onSubmit={handleAddCertification}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Certification / License Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. State Journeyman Electrician License"
                      value={newCert.certificationName}
                      onChange={(e) => setNewCert({ ...newCert, certificationName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">License / Registration Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="e.g. LIC-EL-99238"
                      value={newCert.licenseNumber}
                      onChange={(e) => setNewCert({ ...newCert, licenseNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Issuing Licensing Board / Authority</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Department of Professional Licensing"
                      value={newCert.issuingAuthority}
                      onChange={(e) => setNewCert({ ...newCert, issuingAuthority: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Expiration Date (Optional)</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={newCert.expiresAt}
                      onChange={(e) => setNewCert({ ...newCert, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCertModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Submit Credential</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Department Membership Modal */}
      {showTeamModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Users size={18} className="text-primary" /> Apply to Join Service Department
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowTeamModal(false)}></button>
              </div>
              <form onSubmit={handleRequestJoinTeam}>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">
                    Submit your credentials to join a dedicated department team. Applications are reviewed by system administrators to maintain verified service qualification.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark small">Select Department / Service Team:</label>
                    <select
                      className="form-select form-select-sm"
                      value={teamRequest.teamId}
                      onChange={(e) => setTeamRequest({ ...teamRequest, teamId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      {availableTeams
                        .filter(t => !profile?.teamMemberships?.some(m => m.teamId === t.id && m.approvalStatus !== 'REJECTED'))
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.code}) — {t.totalMembers || 0} active handymen
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark small">Trade Qualifications &amp; Notes for Admin:</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Detail your relevant trade experience, certifications, and readiness for this department..."
                      value={teamRequest.notes}
                      onChange={(e) => setTeamRequest({ ...teamRequest, notes: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowTeamModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4" disabled={submittingTeam || !teamRequest.teamId}>
                    {submittingTeam ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
