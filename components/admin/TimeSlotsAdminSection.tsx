"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTimeSlot,
  deleteTimeSlot,
  getAdminTimeSlots,
  updateTimeSlot,
} from "@/app/actions/admin-pricing";
import type { TimeSlot } from "@/lib/supabase/booking-data";
import { Clock, Plus, RefreshCw, Trash2 } from "lucide-react";

export function TimeSlotsAdminSection() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({ time_value: "", display_label: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSlots(await getAdminTimeSlots());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newSlot.time_value.trim() || !newSlot.display_label.trim()) {
      setError("Time value and display label are required");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await createTimeSlot({
      time_value: newSlot.time_value.trim(),
      display_label: newSlot.display_label.trim(),
    });
    setSaving(false);
    if (result.success && result.data) {
      setSlots((prev) => [...prev, result.data!].sort((a, b) => a.display_order - b.display_order));
      setNewSlot({ time_value: "", display_label: "" });
    } else {
      setError(result.error ?? "Failed to add time slot");
    }
  };

  const toggleActive = async (slot: TimeSlot) => {
    setSaving(true);
    const result = await updateTimeSlot(slot.id, { is_active: !slot.is_active });
    setSaving(false);
    if (result.success) {
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, is_active: !s.is_active } : s))
      );
    } else {
      setError(result.error ?? "Failed to update time slot");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this time slot?")) return;
    setSaving(true);
    const result = await deleteTimeSlot(id);
    setSaving(false);
    if (result.success) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } else {
      setError(result.error ?? "Failed to delete time slot");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Booking Time Slots</h2>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Active slots appear in the booking form schedule step. Use 24-hour format for time value (e.g. 08:00).
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Time (08:00)"
          value={newSlot.time_value}
          onChange={(e) => setNewSlot({ ...newSlot, time_value: e.target.value })}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-28"
          disabled={saving}
        />
        <input
          type="text"
          placeholder="Label (08:00 AM)"
          value={newSlot.display_label}
          onChange={(e) => setNewSlot({ ...newSlot, display_label: e.target.value })}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg flex-1 min-w-[140px]"
          disabled={saving}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-2xl hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading time slots...</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-500">No time slots configured.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-4 py-3 text-sm font-mono">{slot.time_value}</td>
                  <td className="px-4 py-3 text-sm">{slot.display_label}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{slot.display_order}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(slot)}
                      disabled={saving}
                      className={`text-xs px-2 py-1 rounded-full ${
                        slot.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {slot.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Delete time slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
