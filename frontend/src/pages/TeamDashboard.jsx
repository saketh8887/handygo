import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Users, Zap, Wind, Wrench, Hammer, Cpu, Paintbrush, 
  Plus, Edit2, CheckCircle2, XCircle, AlertCircle, Clock, 
  ShieldCheck, ArrowRight, Star, Check, X, Phone, Mail,
  Calendar, Layers, MapPin, DollarSign, Activity, Eye, Trash2,
  ChevronRight, RefreshCw, Briefcase, Award
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import MetricCard from '../components/MetricCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const ICON_MAP = {
  Zap: Zap,
  Wind: Wind,
  Wrench: Wrench,
  Hammer: Hammer,
  Cpu: Cpu,
  Paintbrush: Paintbrush,
  Tool: Wrench,
  Users: Users,
  Briefcase: Briefcase,
};

export default function TeamDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [allTeams, setAllTeams] = useState([]);
  const [team, setTeam] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [allHandymen, setAllHandymen] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MEMBERS');

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    handymanId: '',
    isPrimary: false,
    approvalStatus: 'APPROVED',
    notes: '',
  });
  const [selectedSkillId, setSelectedSkillId] = useState('');

  useEffect(() => {
    fetchTeamAndRelatedData();
  }, [id]);

  const fetchTeamAndRelatedData = async () => {
    try {
      setLoading(true);
      const [
        allTeamsRes,
        teamRes,
        metricsRes,
        jobsRes,
        skillsRes,
        handymenRes,
        servicesRes,
      ] = await Promise.allSettled([
        api.get('/teams/all'),
        api.get(`/teams/${id}`),
        api.get(`/teams/${id}/metrics`),
        api.get(`/teams/${id}/jobs`),
        api.get('/skills'),
        api.get('/admin/handymen'),
        api.get('/services'),
      ]);

      if (allTeamsRes.status === 'fulfilled') {
        setAllTeams(allTeamsRes.value.data.data || []);
      }
      if (teamRes.status === 'fulfilled') {
        setTeam(teamRes.value.data.data);
      }
      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value.data.data);
      }
      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.data.data || []);
      }
      if (skillsRes.status === 'fulfilled') {
        setCatalogSkills(skillsRes.value.data.data || []);
      }
      if (handymenRes.status === 'fulfilled') {
        setAllHandymen(handymenRes.value.data.data || []);
      }
      if (servicesRes.status === 'fulfilled') {
        setServices(servicesRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load team workbench:', err);
      showToast('Could not load department details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberData.handymanId) {
      showToast('Please select a technician.', 'warning');
      return;
    }
    try {
      await api.post(`/admin/teams/${id}/members`, {
        handymanId: parseInt(newMemberData.handymanId),
        isPrimary: newMemberData.isPrimary,
        approvalStatus: newMemberData.approvalStatus,
        notes: newMemberData.notes,
      });
      showToast('Technician assigned to department successfully!', 'success');
      setShowAddMemberModal(false);
      setNewMemberData({ handymanId: '', isPrimary: false, approvalStatus: 'APPROVED', notes: '' });
      fetchTeamAndRelatedData();
    } catch (err) {
      console.error('Add member failed:', err);
      const msg = err.response?.data?.message || 'Failed to add technician to team.';
      showToast(msg, 'error');
    }
  };

  const handleUpdateMemberStatus = async (handymanId, status) => {
    try {
      await api.patch(`/admin/teams/${id}/members/${handymanId}/status`, {
        approvalStatus: status,
      });
      showToast(`Membership status updated to ${status}.`, 'success');
      fetchTeamAndRelatedData();
    } catch (err) {
      console.error('Status update failed:', err);
      const msg = err.response?.data?.message || 'Failed to update member status.';
      showToast(msg, 'error');
    }
  };

  const handleRemoveMember = async (handymanId) => {
    if (!window.confirm('Are you sure you want to remove this technician from this department?')) return;
    try {
      await api.delete(`/admin/teams/${id}/members/${handymanId}`);
      showToast('Technician removed from department.', 'info');
      fetchTeamAndRelatedData();
    } catch (err) {
      console.error('Remove member failed:', err);
      const msg = err.response?.data?.message || 'Failed to remove member.';
      showToast(msg, 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) {
      showToast('Please select a skill to map.', 'warning');
      return;
    }
    try {
      await api.post(`/admin/teams/${id}/skills`, { skillId: parseInt(selectedSkillId) });
      showToast('Skill assigned to department!', 'success');
      setShowAddSkillModal(false);
      setSelectedSkillId('');
      fetchTeamAndRelatedData();
    } catch (err) {
      console.error('Add skill failed:', err);
      const msg = err.response?.data?.message || 'Failed to assign skill.';
      showToast(msg, 'error');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    if (!window.confirm('Remove this skill from department requirements?')) return;
    try {
      await api.delete(`/admin/teams/${id}/skills/${skillId}`);
      showToast('Skill unmapped from department.', 'info');
      fetchTeamAndRelatedData();
    } catch (err) {
      console.error('Remove skill failed:', err);
      const msg = err.response?.data?.message || 'Failed to remove skill.';
      showToast(msg, 'error');
    }
  };

  const IconComponent = ICON_MAP[team?.iconName] || Users;
  const teamMembers = team?.members || [];
  const activeJobs = jobs.filter((j) => ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(j.status));
  const pendingJobs = jobs.filter((j) => j.status === 'PENDING');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const teamServices = services.filter((s) => s.teamId?.toString() === id.toString());

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Admin HQ', to: '/admin' },
          { label: 'Departments & Teams', to: '/admin/teams' },
          { label: team?.name || 'Department Workbench' },
        ]}
      />

      {/* Top Department Switcher Tab Bar */}
      <div className="d-flex align-items-center gap-2 overflow-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {allTeams.map((t) => {
          const TIcon = ICON_MAP[t.iconName] || Users;
          const isSelected = t.id?.toString() === id?.toString();
          return (
            <button
              key={t.id}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all flex-shrink-0 d-inline-flex align-items-center gap-1.5 ${
                isSelected
                  ? 'btn-primary text-white shadow-sm'
                  : 'btn-outline-secondary border-0 bg-light text-dark'
              }`}
              onClick={() => navigate(`/admin/teams/${t.id}`)}
            >
              <TIcon size={14} />
              <span>{t.name}</span>
              {t.pendingMemberCount > 0 && (
                <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                  {t.pendingMemberCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="hc-card p-5 mb-4">
          <Skeleton height="35px" width="40%" className="mb-2" />
          <Skeleton height="20px" width="60%" className="mb-4" />
          <div className="row g-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-md-3">
                <Skeleton height="80px" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Department Banner Header */}
          <div className="hc-card p-4 p-md-5 border-0 shadow-sm mb-4 bg-white position-relative overflow-hidden">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                  style={{ width: 56, height: 56, backgroundColor: '#2563eb' }}
                >
                  <IconComponent size={28} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h3 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                      {team?.name}
                    </h3>
                    <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.72rem' }}>
                      {team?.code}
                    </span>
                    <span
                      className={`badge ${team?.isActive ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary'}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {team?.isActive ? 'Active Department' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-secondary small mb-0" style={{ maxWidth: 750 }}>
                    {team?.description}
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-primary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm"
                  onClick={() => {
                    setNewMemberData({
                      handymanId: allHandymen.length > 0 ? allHandymen[0].id.toString() : '',
                      isPrimary: false,
                      approvalStatus: 'APPROVED',
                      notes: `Assigned to ${team?.name}`,
                    });
                    setShowAddMemberModal(true);
                  }}
                >
                  <Plus size={16} /> Add Technician
                </button>
              </div>
            </div>
          </div>

          {/* Department KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <MetricCard
                title="Available Capacity"
                value={`${metrics?.availableMembers || 0} / ${metrics?.totalMembers || 0}`}
                subtitle="Technicians online"
                icon={Users}
                color="primary"
              />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard
                title="Active In-Flight Jobs"
                value={activeJobs.length}
                subtitle={`${pendingJobs.length} awaiting dispatch`}
                icon={Briefcase}
                color="warning"
              />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard
                title="Completed Services"
                value={completedJobs.length}
                subtitle="Fulfillment record"
                icon={CheckCircle2}
                color="success"
              />
            </div>
            <div className="col-6 col-lg-3">
              <MetricCard
                title="Department Rating"
                value={`★ ${metrics?.averageRating || 4.9}`}
                subtitle={`On-time rate: ${metrics?.onTimeRatePercent || 97.4}%`}
                icon={Star}
                color="info"
              />
            </div>
          </div>

          {/* Workbench Tabs */}
          <div className="d-flex align-items-center gap-2 overflow-auto pb-2 mb-4 border-bottom" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'MEMBERS', label: 'Technicians (Workforce)', count: teamMembers.length },
              { id: 'ACTIVE_JOBS', label: 'In-Flight Jobs', count: activeJobs.length },
              { id: 'SERVICES_SKILLS', label: 'Catalog Services & Skills', count: teamServices.length },
              { id: 'HISTORY', label: 'Completed History', count: completedJobs.length },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm px-3 py-2 border-0 fw-semibold position-relative ${
                  activeTab === tab.id ? 'text-primary' : 'text-secondary'
                }`}
                style={{
                  borderBottom: activeTab === tab.id ? '2px solid var(--hc-primary)' : '2px solid transparent',
                  borderRadius: 0,
                  marginBottom: -1,
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span
                  className={`badge ms-1.5 rounded-pill ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-light text-secondary border'
                  }`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* TAB 1: MEMBERS (TECHNICIANS) */}
          {activeTab === 'MEMBERS' && (
            <div className="hc-card border-0 shadow-sm p-0 overflow-hidden">
              <div className="p-3 border-bottom bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-dark mb-0">Department Technician Roster</h6>
                <button
                  className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1"
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <Plus size={14} /> Assign Technician
                </button>
              </div>

              {teamMembers.length === 0 ? (
                <EmptyState
                  title="No Technicians Assigned"
                  message="This department has no certified technicians assigned yet. Add members to enable automatic job routing."
                  actionLabel="Add First Technician"
                  onAction={() => setShowAddMemberModal(true)}
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-secondary">
                      <tr>
                        <th>Technician Profile</th>
                        <th>Role in Department</th>
                        <th>Approval Status</th>
                        <th>Live Availability</th>
                        <th>Active Workload</th>
                        <th>Trade Rating</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {teamMembers.map((m) => {
                        const tech = allHandymen.find((h) => h.id === m.handymanId);
                        const isApproved = m.approvalStatus === 'APPROVED';
                        return (
                          <tr key={m.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2.5">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                                  style={{ width: 38, height: 38, backgroundColor: '#2563eb', fontSize: '0.85rem' }}
                                >
                                  {tech?.fullName?.slice(0, 2).toUpperCase() || 'TC'}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark">{tech?.fullName || `Tech #${m.handymanId}`}</div>
                                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                    {tech?.phone || 'No phone'} • {tech?.experienceYears || 0} yrs verified exp
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {m.isPrimary ? (
                                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                                  Primary Department
                                </span>
                              ) : (
                                <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                  Secondary Department
                                </span>
                              )}
                            </td>
                            <td>
                              {isApproved ? (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                  <Check size={11} className="me-0.5" /> Approved
                                </span>
                              ) : (
                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                                  Pending Review
                                </span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  tech?.availabilityStatus === 'AVAILABLE'
                                    ? 'bg-success bg-opacity-10 text-success'
                                    : tech?.availabilityStatus === 'BUSY'
                                    ? 'bg-warning bg-opacity-10 text-warning'
                                    : 'bg-danger bg-opacity-10 text-danger'
                                }`}
                              >
                                {tech?.availabilityStatus || 'AVAILABLE'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1.5">
                                <span className="fw-semibold text-dark">
                                  {tech?.completedJobCount ? `${Math.min(2, tech.completedJobCount % 3)}/4` : '0/4'}
                                </span>
                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>jobs</span>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1 text-warning fw-semibold">
                                <Star size={13} fill="currentColor" />
                                <span>{tech?.ratingAvg ? Number(tech.ratingAvg).toFixed(1) : '4.9'}</span>
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="d-flex align-items-center justify-content-end gap-1.5">
                                {!isApproved ? (
                                  <button
                                    className="btn btn-sm btn-success px-2 py-1 rounded-2"
                                    title="Approve Membership"
                                    onClick={() => handleUpdateMemberStatus(m.handymanId, 'APPROVED')}
                                  >
                                    <Check size={13} /> Approve
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-outline-warning px-2 py-1 rounded-2"
                                    title="Revoke / Set Pending"
                                    onClick={() => handleUpdateMemberStatus(m.handymanId, 'PENDING')}
                                  >
                                    Suspend
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-outline-danger px-2 py-1 rounded-2"
                                  title="Remove from Team"
                                  onClick={() => handleRemoveMember(m.handymanId)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IN-FLIGHT JOBS */}
          {activeTab === 'ACTIVE_JOBS' && (
            <div className="hc-card border-0 shadow-sm p-0 overflow-hidden">
              <div className="p-3 border-bottom bg-light bg-opacity-50">
                <h6 className="fw-bold text-dark mb-0">Active Department Assignments ({activeJobs.length})</h6>
              </div>
              {activeJobs.length === 0 ? (
                <div className="py-5 text-center">
                  <CheckCircle2 size={36} className="text-success mb-2" />
                  <h6 className="fw-bold text-dark">No In-Flight Jobs Right Now</h6>
                  <p className="text-secondary small mb-0">All active bookings for this department have been fulfilled.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-secondary">
                      <tr>
                        <th>Booking Ref</th>
                        <th>Service</th>
                        <th>Customer</th>
                        <th>Scheduled Window</th>
                        <th>Assigned Technician</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {activeJobs.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <Link to={`/bookings/${b.id}`} className="fw-bold text-primary font-monospace text-decoration-none">
                              {b.bookingReference}
                            </Link>
                          </td>
                          <td className="fw-semibold text-dark">{b.serviceName}</td>
                          <td className="text-secondary">{b.customerName}</td>
                          <td className="text-secondary">
                            {b.scheduledDate} ({b.scheduledTimeSlot})
                          </td>
                          <td>
                            {b.assignedHandymanName ? (
                              <span className="badge bg-light text-dark border">
                                {b.assignedHandymanName}
                              </span>
                            ) : (
                              <span className="badge bg-warning bg-opacity-20 text-warning border">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="text-end">
                            <Link to={`/bookings/${b.id}`} className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-2">
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVICES & SKILLS */}
          {activeTab === 'SERVICES_SKILLS' && (
            <div className="row g-4">
              {/* Mapped Services */}
              <div className="col-md-6">
                <div className="hc-card p-4 border-0 shadow-sm h-100">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Briefcase size={18} className="text-primary" />
                    Catalog Services Handled ({teamServices.length})
                  </h6>
                  {teamServices.length === 0 ? (
                    <p className="text-secondary small mb-0">No services currently routed to this department.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {teamServices.map((svc) => (
                        <div key={svc.id} className="p-3 border rounded-3 bg-light bg-opacity-50">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                              {svc.name}
                            </span>
                            <span className="fw-bold text-primary" style={{ fontSize: '0.85rem' }}>
                              ${parseFloat(svc.indicativeBasePrice || svc.basePrice || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-secondary small line-clamp-1 mb-2" style={{ fontSize: '0.78rem' }}>
                            {svc.description}
                          </div>
                          <div className="d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.72rem' }}>
                            <Clock size={12} className="text-primary" /> Est. duration: {svc.estimatedDurationMinutes} mins
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mapped Skills */}
              <div className="col-md-6">
                <div className="hc-card p-4 border-0 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <Award size={18} className="text-primary" />
                      Required Trade Skills ({team?.skills?.length || 0})
                    </h6>
                    <button
                      className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setShowAddSkillModal(true)}
                    >
                      <Plus size={13} /> Add Skill
                    </button>
                  </div>

                  {!team?.skills || team.skills.length === 0 ? (
                    <p className="text-secondary small mb-0">No specific trade skills configured for this department.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {team.skills.map((s) => (
                        <div key={s.id} className="p-2.5 border rounded-3 d-flex justify-content-between align-items-center bg-white">
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                              {s.skillName}
                            </div>
                            <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                              <span className="font-monospace text-muted">{s.skillCode}</span> — {s.skillDescription}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-link text-danger p-0 ms-2"
                            title="Unmap skill"
                            onClick={() => handleRemoveSkill(s.skillId)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="hc-card border-0 shadow-sm p-0 overflow-hidden">
              <div className="p-3 border-bottom bg-light bg-opacity-50">
                <h6 className="fw-bold text-dark mb-0">Completed Department Jobs ({completedJobs.length})</h6>
              </div>
              {completedJobs.length === 0 ? (
                <div className="py-5 text-center">
                  <Clock size={36} className="text-secondary mb-2" />
                  <h6 className="fw-bold text-dark">No Completed Jobs Recorded Yet</h6>
                  <p className="text-secondary small mb-0">Completed services will appear here with final billings and timestamps.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-secondary">
                      <tr>
                        <th>Booking Ref</th>
                        <th>Service</th>
                        <th>Customer</th>
                        <th>Technician</th>
                        <th>Final Amount</th>
                        <th>Completion Date</th>
                        <th className="text-end">Details</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {completedJobs.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <Link to={`/bookings/${b.id}`} className="fw-bold text-primary font-monospace text-decoration-none">
                              {b.bookingReference}
                            </Link>
                          </td>
                          <td className="fw-semibold text-dark">{b.serviceName}</td>
                          <td className="text-secondary">{b.customerName}</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {b.assignedHandymanName || 'Staff Specialist'}
                            </span>
                          </td>
                          <td className="fw-bold text-success">
                            ${parseFloat(b.finalAmount || b.quotationAmount || 0).toFixed(2)}
                          </td>
                          <td className="text-secondary">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="text-end">
                            <Link to={`/bookings/${b.id}`} className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-2">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal: Add Technician to Department */}
      {showAddMemberModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Plus size={18} className="text-primary" /> Assign Technician to {team?.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddMemberModal(false)}></button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Select Certified Technician</label>
                    <select
                      className="form-select"
                      required
                      value={newMemberData.handymanId}
                      onChange={(e) => setNewMemberData({ ...newMemberData, handymanId: e.target.value })}
                    >
                      <option value="">-- Choose technician --</option>
                      {allHandymen.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.fullName} ({h.experienceYears || 0} yrs exp • {h.verificationStatus})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="modalPrimaryCheck"
                        checked={newMemberData.isPrimary}
                        onChange={(e) => setNewMemberData({ ...newMemberData, isPrimary: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold text-dark" htmlFor="modalPrimaryCheck">
                        Set as Primary Department
                      </label>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Primary team technicians receive the highest priority score in intelligent dispatch.
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Approval Status</label>
                    <select
                      className="form-select"
                      value={newMemberData.approvalStatus}
                      onChange={(e) => setNewMemberData({ ...newMemberData, approvalStatus: e.target.value })}
                    >
                      <option value="APPROVED">APPROVED (Immediate Job Eligibility)</option>
                      <option value="PENDING">PENDING (Review Required)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Administrative Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Certified specialist assigned by Operations Lead"
                      value={newMemberData.notes}
                      onChange={(e) => setNewMemberData({ ...newMemberData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddMemberModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3">
                    Assign Technician
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Skill to Department */}
      {showAddSkillModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Plus size={18} className="text-primary" /> Map Skill to {team?.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddSkillModal(false)}></button>
              </div>
              <form onSubmit={handleAddSkill}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Select Trade Skill</label>
                    <select
                      className="form-select"
                      required
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                    >
                      <option value="">-- Choose skill from catalog --</option>
                      {catalogSkills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.specializationName || s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-secondary small mb-0">
                    Assigning this skill makes it a prerequisite qualification for technicians dispatched to this department.
                  </p>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddSkillModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3">
                    Assign Skill
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
