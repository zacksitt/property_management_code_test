import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import type { Task } from '../types';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await propertyAPI.getOne(id!);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading property details.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VACANT':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'CLEANING':
        return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'INSPECTION':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Back to Properties
      </Link>

      {/* Property Details Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.name}
            </h1>
            <p className="text-gray-600">📍 {property.address}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              property.status
            )}`}
          >
            {property.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500 mb-1">Owner</p>
            <p className="text-lg font-medium text-gray-900">{property.ownerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
            <p className="text-lg font-medium text-gray-900">
              ${parseFloat(property.monthlyRent.toString()).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tasks ({property.tasks?.length || 0})
        </h2>

        {property.tasks && property.tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks for this property.
          </p>
        ) : (
          <div className="space-y-4">
            {property.tasks?.map((task: Task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-2">
                      {task.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(
                          task.type
                        )}`}
                      >
                        {task.type}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium text-gray-900">
                      {task.assignedTo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;

