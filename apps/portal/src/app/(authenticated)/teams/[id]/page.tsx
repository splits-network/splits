'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Team {
  id: string;
  name: string;
  owner_user_id: string;
  status: 'active' | 'suspended';
  member_count: number;
  active_member_count: number;
  total_placements: number;
  total_revenue: number;
  created_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  recruiter_id: string;
  role: 'owner' | 'admin' | 'member' | 'collaborator';
  joined_at: string;
  status: 'active' | 'invited' | 'removed';
  recruiter: {
    id: string;
    user_id: string;
    name: string;
    email: string;
  };
}

interface SplitConfiguration {
  id: string;
  team_id: string;
  model: 'flat_split' | 'tiered_split' | 'individual_credit' | 'hybrid';
  config: any;
  is_default: boolean;
  created_at: string;
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;
  const { getToken } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'collaborator',
  });

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      // Load team details
      const teamResponse = await fetch(`/api/network/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!teamResponse.ok) throw new Error('Failed to load team');
      const teamData = await teamResponse.json();
      setTeam(teamData);

      // Load team members
      const membersResponse = await fetch(`/api/network/teams/${teamId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!membersResponse.ok) throw new Error('Failed to load members');
      const membersData = await membersResponse.json();
      setMembers(membersData.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    try {
      setInviting(true);
      setError(null);
      const token = await getToken();

      const response = await fetch(`/api/network/teams/${teamId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'member' });
      // Refresh members list
      await loadTeamData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = await getToken();
      const response = await fetch(`/api/network/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      // Refresh members list
      await loadTeamData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="badge badge-primary badge-sm">Owner</span>;
      case 'admin':
        return <span className="badge badge-secondary badge-sm">Admin</span>;
      case 'member':
        return <span className="badge badge-sm">Member</span>;
      case 'collaborator':
        return <span className="badge badge-outline badge-sm">Collaborator</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="alert alert-error">
        <i className="fa-solid fa-circle-exclamation"></i>
        <span>Team not found</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <a href="/teams" className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-arrow-left"></i>
            </a>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {team.status === 'active' ? (
              <span className="badge badge-success">Active</span>
            ) : (
              <span className="badge badge-error">Suspended</span>
            )}
          </div>
          <p className="text-base-content/60">
            Created {formatDate(team.created_at)}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Team Members</p>
                <p className="text-2xl font-bold">{team.active_member_count}</p>
              </div>
              <i className="fa-solid fa-users text-3xl text-primary/20"></i>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Total Placements</p>
                <p className="text-2xl font-bold">{team.total_placements}</p>
              </div>
              <i className="fa-solid fa-briefcase text-3xl text-success/20"></i>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(team.total_revenue)}</p>
              </div>
              <i className="fa-solid fa-dollar-sign text-3xl text-accent/20"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button
          className={`tab ${activeTab === 'members' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <i className="fa-solid fa-users mr-2"></i>
          Members
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fa-solid fa-cog mr-2"></i>
          Settings
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Members ({members.length})</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowInviteModal(true)}>
              <i className="fa-solid fa-user-plus"></i>
              Invite Member
            </button>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.recruiter.name}</td>
                      <td>{member.recruiter.email}</td>
                      <td>{getRoleBadge(member.role)}</td>
                      <td>
                        {member.status === 'active' ? (
                          <span className="badge badge-success badge-sm">Active</span>
                        ) : member.status === 'invited' ? (
                          <span className="badge badge-warning badge-sm">Invited</span>
                        ) : (
                          <span className="badge badge-error badge-sm">Removed</span>
                        )}
                      </td>
                      <td>{formatDate(member.joined_at)}</td>
                      <td>
                        {member.role !== 'owner' && member.status === 'active' && (
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Team Settings</h2>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Split Distribution</h3>
              <p className="text-base-content/60 mb-4">
                Configure how placement fees are distributed among team members.
              </p>
              <button className="btn btn-primary btn-sm">
                <i className="fa-solid fa-cog"></i>
                Configure Splits
              </button>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold mb-2">Team Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Team ID:</strong> {team.id}</p>
                <p><strong>Created:</strong> {formatDate(team.created_at)}</p>
                <p><strong>Status:</strong> {team.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Invite Team Member</h3>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="fieldset">
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  className="input w-full"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="recruiter@example.com"
                  required
                  autoFocus
                />
              </div>

              <div className="fieldset">
                <label className="label">Role</label>
                <select
                  className="select w-full"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="collaborator">Collaborator</option>
                </select>
                <label className="label">
                  <span className="label-text-alt">
                    Admins can manage members and settings
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteForm({ email: '', role: 'member' });
                  }}
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={inviting}>
                  {inviting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => !inviting && setShowInviteModal(false)}></div>
        </div>
      )}
    </div>
  );
}
