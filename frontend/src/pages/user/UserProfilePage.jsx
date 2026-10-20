import React, { useState, useEffect } from 'react';
import { User, Shield, Save, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const GENDERS = ['Male', 'Female', 'Transgender', 'Other'];
const COMMUNITIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
const EMPLOYMENT_STATUSES = [
  'Employed',
  'Self-Employed',
  'Unemployed',
  'Student',
  'Retired',
  'Farmer',
  'Daily Wage Worker',
];

const EDUCATION_LEVELS = [
  'Below 10th Standard',
  '10th Pass (Matriculation)',
  '12th Pass (Higher Secondary)',
  'Diploma / ITI',
  'Graduate (Bachelor Degree)',
  'Post-Graduate (Master Degree)',
  'Doctorate / PhD',
];

const UserProfilePage = () => {
  const { user, profile, updateProfileData } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState('');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [community, setCommunity] = useState('');
  const [disabilityStatus, setDisabilityStatus] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Initialize fields from profile
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
    if (profile) {
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '');
      setGender(profile.gender || '');
      setState(profile.state || '');
      setDistrict(profile.district || '');
      setAnnualFamilyIncome(
        profile.annualFamilyIncome !== null && profile.annualFamilyIncome !== undefined
          ? String(profile.annualFamilyIncome)
          : ''
      );
      setEducation(profile.education || '');
      setOccupation(profile.occupation || '');
      setEmploymentStatus(profile.employmentStatus || '');
      setCommunity(profile.community || '');
      setDisabilityStatus(Boolean(profile.disabilityStatus));
    }
  }, [user, profile]);

  // Compute live age from DOB
  const computeAge = (dob) => {
    if (!dob) return null;
    const b = new Date(dob);
    if (isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  };

  const calculatedAge = computeAge(dateOfBirth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        fullName,
        phone,
        dateOfBirth: dateOfBirth || null,
        gender,
        state,
        district,
        annualFamilyIncome: annualFamilyIncome !== '' ? Number(annualFamilyIncome) : null,
        education,
        occupation,
        employmentStatus,
        community,
        disabilityStatus,
      };

      const res = await api.put('/profiles/me', payload);
      if (res.data.success) {
        updateProfileData(res.data.profile, res.data.user);
        showToast('Citizen profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gov-primary tracking-tight">Citizen Profile</h1>
        <p className="text-xs sm:text-sm text-gov-muted mt-1">
          Your profile details are stored securely and used to evaluate scheme eligibility conditions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Account Information */}
        <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-gov-primary border-b border-gov-border pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-gov-secondary" />
            <span>Identity & Contact Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email Address (Locked)"
              value={user?.email || ''}
              disabled
              helperText="Email is bound to your account credentials"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
            />
          </div>
        </div>

        {/* Demographics & Region */}
        <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-gov-primary border-b border-gov-border pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gov-secondary" />
            <span>Demographics & Regional Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gov-text mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full text-sm rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              />
              {calculatedAge !== null && (
                <span className="text-xs text-gov-secondary font-semibold mt-1 block">
                  Calculated Age: {calculatedAge} years
                </span>
              )}
            </div>

            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={GENDERS}
            />

            <Select
              label="Social Category / Community"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              options={COMMUNITIES}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Permanent State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={STATES}
            />
            <Input
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Pune, Varanasi, Patna"
            />
          </div>
        </div>

        {/* Economic Profile & Livelihood */}
        <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-gov-primary border-b border-gov-border pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gov-secondary" />
            <span>Economic Profile & Occupation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Annual Family Income (₹)"
              type="number"
              min="0"
              value={annualFamilyIncome}
              onChange={(e) => setAnnualFamilyIncome(e.target.value)}
              placeholder="e.g. 250000"
              helperText="Total combined household annual income"
            />

            <Select
              label="Highest Education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              options={EDUCATION_LEVELS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Occupation / Trade"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Farmer, Electrician, Student, Street Vendor"
            />

            <Select
              label="Employment Status"
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              options={EMPLOYMENT_STATUSES}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={disabilityStatus}
                onChange={(e) => setDisabilityStatus(e.target.checked)}
                className="w-4 h-4 rounded border-gov-border text-gov-secondary focus:ring-gov-secondary"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">Person with Disability (PwD)</span>
                <p className="text-slate-500">
                  Check this box if you possess a government Disability Certificate / UDID card.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving} className="gap-2 shadow-sm">
            <Save className="w-4 h-4" />
            <span>Save Profile Information</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
