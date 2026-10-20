import React, { useState } from 'react';
import { Bell, Calendar, Clock, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'IST - India Standard Time (UTC+05:30)' },
  { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
];

const ReminderModal = ({ isOpen, onClose, scheme, onSaved = null }) => {
  const { showToast } = useToast();

  // default date to tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultDateStr = tomorrow.toISOString().slice(0, 16);

  const [reminderDate, setReminderDate] = useState(defaultDateStr);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reminderDate) {
      setError('Please select a reminder date and time.');
      return;
    }

    const selectedTime = new Date(reminderDate);
    if (selectedTime <= new Date()) {
      setError('Reminder must be scheduled for a future date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/reminders', {
        schemeId: scheme._id,
        reminderDate: selectedTime.toISOString(),
        timezone,
        message,
      });

      if (res.data.success) {
        showToast('Reminder scheduled successfully! You will receive a notification when it is due.', 'success');
        if (onSaved) onSaved(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Scheme Reminder"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Schedule Reminder
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold">{scheme?.schemeName}</span>
          <p className="text-blue-700 mt-1">
            We will trigger an in-portal notification for this scheme at the scheduled time.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gov-text mb-1.5">
            Reminder Date & Time <span className="text-gov-error">*</span>
          </label>
          <input
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-gov-border bg-white text-sm text-gov-text px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
            required
          />
        </div>

        <Select
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={TIMEZONES}
        />

        <div>
          <label className="block text-sm font-medium text-gov-text mb-1.5">
            Reminder Note (Optional)
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Check deadline, prepare 7/12 land extract, renew income certificate..."
            className="w-full rounded-lg border border-gov-border bg-white text-sm text-gov-text p-3 focus:outline-none focus:ring-2 focus:ring-gov-secondary placeholder:text-slate-400"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ReminderModal;
