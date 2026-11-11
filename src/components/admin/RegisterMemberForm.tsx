'use client';

import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MemberType = 'member' | 'invitee' | 'minister' | 'volunteer' | 'participant' | 'child';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  memberType: MemberType;
  address: string;
  conferenceDay: string;
}

const MEMBER_TYPES: { value: MemberType; label: string }[] = [
  { value: 'member',      label: 'Member (Adult)' },
  { value: 'invitee',     label: 'Guest' },
  { value: 'minister',    label: 'Invited Minister' },
  { value: 'volunteer',   label: 'Volunteer' },
  { value: 'participant', label: 'Participant' },
  { value: 'child',       label: 'Member (Children)' },
];

const CONFERENCE_DAYS = [
  { value: 'day1', label: 'Day 1 — Fri, 11 December 2026' },
  { value: 'day2', label: 'Day 2 — Sat, 12 December 2026' },
  { value: 'day3', label: 'Day 3 — Sun, 13 December 2026' },
];

const RegisterMemberForm = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    memberType: 'member',
    address: '',
    conferenceDay: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const isChild = formData.memberType === 'child';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setIsError(false);

    // Client-side validation
    if (!isChild && !formData.phone.trim() && !formData.email.trim()) {
      setMessage('Phone number or email is required.');
      setIsError(true);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/register-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          conferenceDay: formData.conferenceDay || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const dayNote = result.markedDay ? ` — marked present for ${result.markedDay}` : '';
        setMessage(`✓ ${result.user?.fullName ?? 'Member'} registered successfully${dayNote}!`);
        setIsError(false);
        setFormData({
          firstName: '', lastName: '', phone: '', email: '',
          gender: '', memberType: 'member', address: '', conferenceDay: '',
        });
      } else {
        setMessage(result.error || 'An error occurred during registration.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('An unexpected network error occurred.');
      setIsError(true);
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Register a Member</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input type="text" name="firstName" id="firstName" required value={formData.firstName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input type="text" name="lastName" id="lastName" required value={formData.lastName} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Membership type */}
        <div>
          <label htmlFor="memberType" className={labelClass}>Membership Status <span className="text-red-500">*</span></label>
          <select name="memberType" id="memberType" value={formData.memberType} onChange={handleChange}
            className={inputClass}>
            {MEMBER_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Child notice */}
        {isChild && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
            📌 Phone and email are <strong>not required</strong> for children.
          </div>
        )}

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone Number {!isChild && <span className="text-red-500">*</span>}
            {isChild && <span className="text-gray-400 font-normal"> (optional for children)</span>}
          </label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange}
            required={!isChild && !formData.email.trim()}
            placeholder={isChild ? 'Optional' : '+234 xxx xxx xxxx'}
            className={inputClass} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address {!isChild && <span className="text-gray-400 font-normal"> (optional if phone provided)</span>}
            {isChild && <span className="text-gray-400 font-normal"> (optional for children)</span>}
          </label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange}
            placeholder={isChild ? 'Optional' : 'someone@example.com'}
            className={inputClass} />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className={labelClass}>Gender <span className="text-red-500">*</span></label>
          <select name="gender" id="gender" required value={formData.gender} onChange={handleChange} className={inputClass}>
            <option value="" disabled>Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className={labelClass}>Address <span className="text-gray-400 font-normal">(optional)</span></label>
          <input type="text" name="address" id="address" value={formData.address} onChange={handleChange}
            placeholder="Church or home address"
            className={inputClass} />
        </div>

        {/* Conference day */}
        <div>
          <label htmlFor="conferenceDay" className={labelClass}>
            Mark present for day <span className="text-gray-400 font-normal">(auto-detects today if left blank)</span>
          </label>
          <select name="conferenceDay" id="conferenceDay" value={formData.conferenceDay} onChange={handleChange} className={inputClass}>
            <option value="">Auto-detect from today&apos;s date</option>
            {CONFERENCE_DAYS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {submitting ? 'Registering…' : 'Register and Mark as Present'}
        </button>

        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center text-sm font-medium px-4 py-3 rounded-lg ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default RegisterMemberForm;
