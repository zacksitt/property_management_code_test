import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskAPI, propertyAPI } from '../services/api';
import { TaskType, TaskStatus, type CreateTaskDto, type Task } from '../types';

interface TaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  propertyId?: string;
  task?: Task; // For edit mode
}

const TaskForm = ({ onClose, onSuccess, propertyId, task }: TaskFormProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;

  const [formData, setFormData] = useState<CreateTaskDto>({
    propertyId: task?.propertyId || propertyId || '',
    description: task?.description || '',
    type: task?.type || TaskType.CLEANING,
    assignedTo: task?.assignedTo || '',
    status: task?.status || TaskStatus.PENDING,
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Fetch properties for the dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-all'],
    queryFn: async () => {
      const response = await propertyAPI.getAll({ limit: 100 }); // Get more for dropdown
      return response.data;
    },
  });

  const properties = propertiesData?.data || [];

  useEffect(() => {
    if (propertyId) {
      setFormData((prev) => ({ ...prev, propertyId }));
    }
  }, [propertyId]);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const saveMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => {
      if (isEditMode && task) {
        // Omit propertyId for updates (can't change property after creation)
        const { propertyId, ...updateData } = data;
        return taskAPI.update(task.id, updateData);
      }
      return taskAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      }
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      if (Array.isArray(message)) {
        setErrorMessage(message.join(', '));
      } else if (typeof message === 'string') {
        setErrorMessage(message);
      } else {
        setErrorMessage(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Task' : 'Create Task'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property *
            </label>
            <select
              name="propertyId"
              required
              value={formData.propertyId}
              onChange={handleChange}
              disabled={!!propertyId || isEditMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a property</option>
              {properties?.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description * <span className="text-xs text-gray-500">(min 10 characters)</span>
            </label>
            <textarea
              name="description"
              required
              minLength={10}
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the task (at least 10 characters)..."
            />
            {formData.description.length > 0 && formData.description.length < 10 && (
              <p className="text-xs text-red-600 mt-1">
                {10 - formData.description.length} more character(s) required
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={TaskType.CLEANING}>Cleaning</option>
              <option value={TaskType.MAINTENANCE}>Maintenance</option>
              <option value={TaskType.INSPECTION}>Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To *
            </label>
            <input
              type="text"
              name="assignedTo"
              required
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              name="dueDate"
              required
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Task' : 'Create Task')
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

