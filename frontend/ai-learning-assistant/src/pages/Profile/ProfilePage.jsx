import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authServices";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { User, Mail, Lock } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        setUsername(response.data?.username || '');
        setEmail(response.data?.email || '');
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await authService.updateProfile({ username });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile Settings" />

      {/* User Information */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">User Information</h3>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <User className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                placeholder="Username"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Mail className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="email"
                value={email}
                disabled
                className="flex-1 bg-transparent text-sm text-slate-400 outline-none cursor-not-allowed"
                placeholder="Email"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updatingProfile}>
              {updatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Change Password</h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Lock className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Lock className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                placeholder="••••••••••••••••"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-orange-300 transition-all">
              <Lock className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;