import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../services/api';
import { PropertyStatus, type CreatePropertyDto, type Property } from '../types';

interface PropertyFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  property?: Property; // For edit mode
}

const PropertyForm = ({ onClose, onSuccess, property }: PropertyFormProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!property;

  const [formData, setFormData] = useState<CreatePropertyDto>({
    name: property?.name || '',
    address: property?.address || '',
    ownerName: property?.ownerName || '',
    monthlyRent: property?.monthlyRent || 0,
    status: property?.status || PropertyStatus.VACANT,
  });

  const [errorMessage, setErrorMessage] = useState<string>('');

  const saveMutation = useMutation({
    mutationFn: (data: CreatePropertyDto) => {
      if (isEditMode && property) {
        return propertyAPI.update(property.id, data);
      }
      return propertyAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
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
        setErrorMessage(`Failed to ${isEditMode ? 'update' : 'create'} property. Please try again.`);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthlyRent' ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Property' : 'Create Property'}</h2>
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
              Property Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter property name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name *
            </label>
            <input
              type="text"
              name="ownerName"
              required
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter owner name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent ($) * <span className="text-xs text-gray-500">(max: 99,999,999.99)</span>
            </label>
            <input
              type="number"
              name="monthlyRent"
              required
              min="0"
              max="99999999.99"
              step="0.01"
              value={formData.monthlyRent}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter monthly rent"
            />
            {formData.monthlyRent > 99999999.99 && (
              <p className="text-xs text-red-600 mt-1">
                Rent must not exceed $99,999,999.99
              </p>
            )}
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
              <option value={PropertyStatus.VACANT}>Vacant</option>
              <option value={PropertyStatus.OCCUPIED}>Occupied</option>
              <option value={PropertyStatus.MAINTENANCE}>Maintenance</option>
            </select>
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
                : (isEditMode ? 'Update Property' : 'Create Property')
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

export default PropertyForm;

