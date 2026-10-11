import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Users, Zap, Wind, Wrench, Hammer, Cpu, Paintbrush, 
  Plus, Edit2, CheckCircle2, XCircle, AlertCircle, Clock, 
  ShieldCheck, ArrowRight, Star, Check, X, Search, Filter,
  Layers, ChevronRight, Briefcase
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import MetricCard from '../components/MetricCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

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

export default function AdminTeams() {
  const { showToast } = useToast();
  const [teams, setTeams] = useState([]);
  const [handymen, setHandymen] = useState([]);
  const [pendingMemberships, setPendingMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Form State
  const [teamForm, setTeamForm] = useState({
    name: '',
    code: '',
    description: '',
    iconName: 'Users',
    isActive: true,
  });

  const [memberForm, setMemberForm] = useState({
    handymanId: '',
    isPrimary: false,
    approvalStatus: 'APPROVED',
    notes: '',
  });

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [teamsRes, hmRes, pendingRes] = await Promise.allSettled([
        api.get('/teams/all'),
        api.get('/admin/handymen'),
        api.get('/admin/teams/pending-memberships'),
      ]);

      if (teamsRes.status === 'fulfilled') {
        setTeams(teamsRes.value.data.data || []);
      }
      if (hmRes.status === 'fulfilled') {
        setHandymen(hmRes.value.data.data || []);
      }
      if (pendingRes.status === 'fulfilled') {
        setPendingMemberships(pendingRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load teams data:', err);
      setError('Could not retrieve service teams.');
      showToast('Could not load service teams.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/teams', teamForm);
      showToast(`Team '${teamForm.name}' created successfully!`, 'success');
      setShowCreateModal(false);
      setTeamForm({ name: '', code: '', description: '', iconName: 'Users', isActive: true });
      fetchTeamsData();
    } catch (err) {
      console.error('Create team failed:', err);
      const msg = err.response?.data?.message || 'Failed to create service team.';
      showToast(msg, 'error');
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    try {
      await api.put(`/admin/teams/${selectedTeam.id}`, teamForm);
      showToast(`Team '${teamForm.name}' updated successfully!`, 'success');
      setShowEditModal(false);
      fetchTeamsData();
    } catch (err) {
      console.error('Update team failed:', err);
      const msg = err.response?.data?.message || 'Failed to update service team.';
      showToast(msg, 'error');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !memberForm.handymanId) {
      showToast('Please select a technician.', 'warning');
      return;
    }
    try {
      await api.post(`/admin/teams/${selectedTeam.id}/members`, {
        handymanId: parseInt(memberForm.handymanId),
        isPrimary: memberForm.isPrimary,
        approvalStatus: memberForm.approvalStatus,
        notes: memberForm.notes,
      });
      showToast('Technician assigned to team successfully!', 'success');
      setShowAddMemberModal(false);
      setMemberForm({ handymanId: '', isPrimary: false, approvalStatus: 'APPROVED', notes: '' });
      fetchTeamsData();
    } catch (err) {
      console.error('Add member failed:', err);
      const msg = err.response?.data?.message || 'Failed to assign technician to team.';
      showToast(msg, 'error');
    }
  };

  const handleUpdateApprovalStatus = async (teamId, handymanId, status) => {
    try {
      await api.patch(`/admin/teams/${teamId}/members/${handymanId}/status`, {
        approvalStatus: status,
      });
      showToast(`Membership request ${status.toLowerCase()} successfully!`, status === 'APPROVED' ? 'success' : 'info');
      fetchTeamsData();
    } catch (err) {
      console.error('Approval update failed:', err);
      const msg = err.response?.data?.message || 'Failed to update membership status.';
      showToast(msg, 'error');
    }
  };

  const openEditModal = (t) => {
    setSelectedTeam(t);
    setTeamForm({
      name: t.name,
      code: t.code,
      description: t.description || '',
      iconName: t.iconName || 'Users',
      isActive: t.isActive,
    });
    setShowEditModal(true);
  };

  const openAddMemberModal = (t) => {
    setSelectedTeam(t);
    setMemberForm({
      handymanId: handymen.length > 0 ? handymen[0].id.toString() : '',
      isPrimary: false,
      approvalStatus: 'APPROVED',
      notes: `Assigned to ${t.name}`,
    });
    setShowAddMemberModal(true);
  };

  // Metrics
  const totalTeams = teams.length;
  const totalMembers = teams.reduce((acc, t) => acc + (t.approvedMemberCount || 0), 0);
  const activeJobsTotal = teams.reduce((acc, t) => acc + (t.activeJobsCount || 0), 0);
  const pendingApprovalsCount = pendingMemberships.length;

  const filteredTeams = teams.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Admin HQ', to: '/admin' },
          { label: 'Department & Service Teams' },
        ]}
      />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
            Service Teams &amp; Departments
          </h2>
          <p className="text-secondary small mb-0">
            Configure specialized trade departments, verify technician memberships, and route bookings intelligently.
          </p>
        </div>

        <button
          className="btn btn-primary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
          onClick={() => {
            setTeamForm({ name: '', code: '', description: '', iconName: 'Users', isActive: true });
            setShowCreateModal(true);
          }}
        >
          <Plus size={16} /> Create Department
        </button>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Service Teams"
            value={totalTeams}
            subtitle="Configured departments"
            icon={Layers}
            color="primary"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Assigned Technicians"
            value={totalMembers}
            subtitle="Active team placements"
            icon={Users}
            color="info"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            title="In-Flight Department Jobs"
            value={activeJobsTotal}
            subtitle="Dispatched / working"
            icon={Briefcase}
            color="warning"
          />
        </div>
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Pending Approvals"
            value={pendingApprovalsCount}
            subtitle={pendingApprovalsCount > 0 ? 'Requires admin action' : 'All up to date'}
            icon={ShieldCheck}
            color={pendingApprovalsCount > 0 ? 'danger' : 'success'}
          />
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <button
            className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all ${
              activeTab === 'ALL'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-outline-secondary border-0 bg-light text-dark'
            }`}
            onClick={() => setActiveTab('ALL')}
          >
            All Teams ({totalTeams})
          </button>
          <button
            className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all position-relative ${
              activeTab === 'PENDING'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-outline-secondary border-0 bg-light text-dark'
            }`}
            onClick={() => setActiveTab('PENDING')}
          >
            Pending Approvals
            {pendingApprovalsCount > 0 && (
              <span className="badge bg-danger ms-1.5 rounded-pill" style={{ fontSize: '0.7rem' }}>
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'ALL' && (
          <div className="position-relative" style={{ minWidth: 260 }}>
            <Search
              size={15}
              className="position-absolute text-muted"
              style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 rounded-3"
              placeholder="Filter teams by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="row g-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div className="hc-card p-4">
                <Skeleton height="30px" width="50%" className="mb-2" />
                <Skeleton height="15px" width="80%" className="mb-3" />
                <Skeleton height="50px" width="100%" />
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'PENDING' ? (
        /* Pending Memberships Table */
        <div className="hc-card border-0 shadow-sm p-0 overflow-hidden">
          <div className="p-3 border-bottom bg-light bg-opacity-50">
            <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-warning" />
              Technician Team Join Applications
            </h6>
          </div>
          {pendingMemberships.length === 0 ? (
            <div className="py-5 text-center">
              <CheckCircle2 size={40} className="text-success mb-2" />
              <h6 className="fw-bold text-dark">No Pending Membership Requests</h6>
              <p className="text-secondary small mb-0">All technician department requests have been processed.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Technician</th>
                    <th>Requested Department</th>
                    <th>Application Date</th>
                    <th>Technician Note</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {pendingMemberships.map((m) => {
                    const tech = handymen.find((h) => h.id === m.handymanId);
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ width: 34, height: 34, backgroundColor: '#3b82f6', fontSize: '0.8rem' }}
                            >
                              {tech?.fullName?.slice(0, 2).toUpperCase() || 'TC'}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{tech?.fullName || `Tech #${m.handymanId}`}</div>
                              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                                {tech?.phone || 'No phone'} • {tech?.experienceYears || 0} yrs exp
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                            {m.teamName}
                          </span>
                        </td>
                        <td className="text-secondary">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="text-secondary">
                          <span className="fst-italic">{m.notes || 'Qualification self-assessment submitted.'}</span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1.5">
                            <button
                              className="btn btn-sm btn-success px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleUpdateApprovalStatus(m.teamId, m.handymanId, 'APPROVED')}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleUpdateApprovalStatus(m.teamId, m.handymanId, 'REJECTED')}
                            >
                              <X size={13} /> Reject
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
      ) : (
        /* Service Teams Grid */
        <div className="row g-3">
          {filteredTeams.map((team) => {
            const IconComponent = ICON_MAP[team.iconName] || Users;
            return (
              <div key={team.id} className="col-md-6 col-lg-4">
                <div className="hc-card h-100 p-4 border-0 shadow-sm d-flex flex-column transition-all hover-shadow">
                  {/* Card Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
                        style={{ width: 44, height: 44, backgroundColor: '#2563eb' }}
                      >
                        <IconComponent size={22} />
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{team.name}</h6>
                        <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.68rem' }}>
                          {team.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`badge ${team.isActive ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {team.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.8rem', minHeight: '44px' }}>
                    {team.description}
                  </p>

                  {/* Team Stats Matrix */}
                  <div className="p-2.5 bg-light rounded-3 mb-3">
                    <div className="row g-2 text-center" style={{ fontSize: '0.75rem' }}>
                      <div className="col-4 border-end">
                        <div className="fw-bold text-dark fs-6">{team.approvedMemberCount || 0}</div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>Technicians</div>
                      </div>
                      <div className="col-4 border-end">
                        <div className="fw-bold text-primary fs-6">{team.activeJobsCount || 0}</div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>Active Jobs</div>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-success fs-6">{team.completedJobsCount || 0}</div>
                        <div className="text-secondary" style={{ fontSize: '0.7rem' }}>Completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex align-items-center justify-content-between pt-2 border-top gap-2">
                    <div className="d-flex align-items-center gap-1.5">
                      <button
                        className="btn btn-sm btn-outline-secondary px-2 py-1 rounded-2"
                        title="Edit Department"
                        onClick={() => openEditModal(team)}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary px-2 py-1 rounded-2 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => openAddMemberModal(team)}
                      >
                        <Plus size={13} /> Member
                      </button>
                    </div>

                    <Link
                      to={`/admin/teams/${team.id}`}
                      className="btn btn-sm btn-primary px-3 py-1.5 rounded-2 d-inline-flex align-items-center gap-1 fw-medium"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <span>Workbench</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Team */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Plus size={18} className="text-primary" /> Create Service Department
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTeam}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Department Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Electrical Services Team"
                      required
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Department Code</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="e.g. TEAM_ELECTRICAL"
                        required
                        value={teamForm.code}
                        onChange={(e) => setTeamForm({ ...teamForm, code: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Department Icon</label>
                      <select
                        className="form-select"
                        value={teamForm.iconName}
                        onChange={(e) => setTeamForm({ ...teamForm, iconName: e.target.value })}
                      >
                        <option value="Zap">Zap (Electrical)</option>
                        <option value="Wind">Wind (HVAC / AC)</option>
                        <option value="Wrench">Wrench (Plumbing)</option>
                        <option value="Hammer">Hammer (Carpentry)</option>
                        <option value="Cpu">Cpu (Appliance)</option>
                        <option value="Paintbrush">Paintbrush (Painting)</option>
                        <option value="Tool">Tool (General)</option>
                        <option value="Users">Users (Default)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Scope &amp; Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Describe the specialized trade services handled by this team..."
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="createActiveSwitch"
                      checked={teamForm.isActive}
                      onChange={(e) => setTeamForm({ ...teamForm, isActive: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold text-dark" htmlFor="createActiveSwitch">
                      Active Department (Open for automatic job routing)
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3">
                    Save Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Team */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Edit2 size={18} className="text-primary" /> Edit Department Details
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateTeam}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Department Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Department Icon</label>
                    <select
                      className="form-select"
                      value={teamForm.iconName}
                      onChange={(e) => setTeamForm({ ...teamForm, iconName: e.target.value })}
                    >
                      <option value="Zap">Zap (Electrical)</option>
                      <option value="Wind">Wind (HVAC / AC)</option>
                      <option value="Wrench">Wrench (Plumbing)</option>
                      <option value="Hammer">Hammer (Carpentry)</option>
                      <option value="Cpu">Cpu (Appliance)</option>
                      <option value="Paintbrush">Paintbrush (Painting)</option>
                      <option value="Tool">Tool (General)</option>
                      <option value="Users">Users (Default)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="editActiveSwitch"
                      checked={teamForm.isActive}
                      onChange={(e) => setTeamForm({ ...teamForm, isActive: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold text-dark" htmlFor="editActiveSwitch">
                      Department Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3">
                    Update Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Member */}
      {showAddMemberModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Users size={18} className="text-primary" /> Assign Technician to {selectedTeam?.name}
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
                      value={memberForm.handymanId}
                      onChange={(e) => setMemberForm({ ...memberForm, handymanId: e.target.value })}
                    >
                      <option value="">-- Choose technician --</option>
                      {handymen.map((h) => (
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
                        id="isPrimaryTeamCheck"
                        checked={memberForm.isPrimary}
                        onChange={(e) => setMemberForm({ ...memberForm, isPrimary: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold text-dark" htmlFor="isPrimaryTeamCheck">
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
                      value={memberForm.approvalStatus}
                      onChange={(e) => setMemberForm({ ...memberForm, approvalStatus: e.target.value })}
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
                      value={memberForm.notes}
                      onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
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
    </div>
  );
}
