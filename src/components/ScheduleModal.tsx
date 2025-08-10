import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Plus, Trash2, Edit } from 'lucide-react';
import { apiService, TemplateGroup, TemplateSchedule, AvailableMonth, CanvasTemplate } from '../services/api';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CanvasTemplate[];
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, templates }) => {
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);
  const [schedules, setSchedules] = useState<TemplateSchedule[]>([]);
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [activeGroup, setActiveGroup] = useState<TemplateGroup | null>(null);
  
  // Form states
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TemplateGroup | null>(null);
  
  // Group form
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  
  // Schedule form
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groupsData, schedulesData, monthsData, activeGroupData] = await Promise.all([
        apiService.getTemplateGroups(),
        apiService.getSchedules(currentYear),
        apiService.getAvailableMonths(),
        apiService.getActiveTemplateGroup()
      ]);
      
      setTemplateGroups(groupsData);
      setSchedules(schedulesData);
      setAvailableMonths(monthsData.months);
      setCurrentYear(monthsData.currentYear);
      setActiveGroup(activeGroupData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setLoading(true);
      if (editingGroup) {
        await apiService.updateTemplateGroup(editingGroup.id, {
          name: groupName.trim(),
          description: groupDescription.trim(),
          templateIds: selectedTemplates
        });
      } else {
        await apiService.createTemplateGroup({
          name: groupName.trim(),
          description: groupDescription.trim(),
          templateIds: selectedTemplates
        });
      }
      
      resetGroupForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this template group?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteTemplateGroup(groupId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedGroupId || !selectedMonth || !selectedDay || !selectedHour || !selectedMinute) {
      setError('All schedule fields are required');
      return;
    }

    try {
      setLoading(true);
      await apiService.createSchedule({
        groupId: selectedGroupId,
        year: currentYear,
        month: parseInt(selectedMonth),
        day: parseInt(selectedDay),
        hour: parseInt(selectedHour),
        minute: parseInt(selectedMinute)
      });
      
      resetScheduleForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteSchedule(scheduleId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateGroup = async (groupId: string) => {
    try {
      setLoading(true);
      await apiService.activateTemplateGroup(groupId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate group');
    } finally {
      setLoading(false);
    }
  };

  const resetGroupForm = () => {
    setShowGroupForm(false);
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setSelectedTemplates([]);
  };

  const resetScheduleForm = () => {
    setShowScheduleForm(false);
    setSelectedGroupId('');
    setSelectedMonth('');
    setSelectedDay('');
    setSelectedHour('');
    setSelectedMinute('');
  };

  const startEditGroup = (group: TemplateGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description);
    setSelectedTemplates(group.template_ids || []);
    setShowGroupForm(true);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const formatScheduleTime = (schedule: TemplateSchedule) => {
    const date = new Date(schedule.year, schedule.month - 1, schedule.day, schedule.hour, schedule.minute);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Template Scheduler</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage template groups and schedule automatic activations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Template Groups */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Template Groups</h3>
                <button
                  onClick={() => setShowGroupForm(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Group</span>
                </button>
              </div>

              {/* Active Group Display */}
              {activeGroup && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Active: {activeGroup.name}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {activeGroup.template_ids?.length || 0} templates active
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading...</p>
                </div>
              ) : templateGroups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No template groups yet</p>
                  <p className="text-sm text-gray-400">Create your first group to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templateGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`border rounded-lg p-4 ${
                        group.is_active ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{group.name}</h4>
                            {group.is_active && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {group.template_count || 0} templates
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!group.is_active && (
                            <button
                              onClick={() => handleActivateGroup(group.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Activate group"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => startEditGroup(group)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit group"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Schedules */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Schedules ({currentYear})</h3>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  disabled={templateGroups.length === 0}
                >
                  <Calendar className="w-4 h-4" />
                  <span>New Schedule</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No schedules for {currentYear}</p>
                  <p className="text-sm text-gray-400">Create a schedule to automate template activation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`border rounded-lg p-4 ${
                        schedule.is_executed ? 'border-gray-300 bg-gray-50' : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{schedule.group_name}</h4>
                            {schedule.is_executed ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Executed
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatScheduleTime(schedule)}</span>
                            </div>
                          </div>
                          {schedule.executed_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Executed: {new Date(schedule.executed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Group Form Modal */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingGroup ? 'Edit Template Group' : 'Create Template Group'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Templates
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                    {templates.map((template) => (
                      <label key={template.id} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.includes(template.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTemplates([...selectedTemplates, template.id]);
                            } else {
                              setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{template.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={resetGroupForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create Schedule
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Group *
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a group</option>
                    {templateGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.template_count} templates)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month *
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setSelectedDay(''); // Reset day when month changes
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select month</option>
                      {availableMonths.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day *
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled={!selectedMonth}
                    >
                      <option value="">Select day</option>
                      {selectedMonth && Array.from(
                        { length: getDaysInMonth(parseInt(selectedMonth), currentYear) },
                        (_, i) => i + 1
                      ).map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hour *
                    </label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select hour</option>
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <option key={hour} value={hour}>
                          {hour.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minute *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0-59"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={resetScheduleForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSchedule}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};