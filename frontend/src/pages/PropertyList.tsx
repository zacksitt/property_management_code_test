import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import PropertyForm from '../components/PropertyForm';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Property } from '../types';

const PropertyList = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', page, limit],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      const response = await propertyAPI.getAll(params);
      return response.data;
    },
  });

  const properties = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setDeletingProperty(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading properties. Please try again later.
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Properties</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: {total} properties
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            + Create Property
          </button>
        </div>
      </div>

      {showCreateForm && (
        <PropertyForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}

      {editingProperty && (
        <PropertyForm
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSuccess={() => setEditingProperty(null)}
        />
      )}

      {deletingProperty && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Property"
          message={`Are you sure you want to delete "${deletingProperty.name}"? This will also delete all associated tasks. This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deletingProperty.id)}
          onCancel={() => setDeletingProperty(null)}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />
      )}

      {/* Items per page selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Items per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset to first page when changing limit
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {properties.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} properties
        </div>
      </div>

      {properties && properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No properties found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties?.map((property: Property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition">
                        {property.name}
                      </h3>
                    </Link>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3 text-sm">
                    📍 {property.address}
                  </p>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Owner:</span> {property.ownerName}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Rent:</span> $
                      {parseFloat(property.monthlyRent.toString()).toLocaleString()}/month
                    </p>
                  </div>

                  {property.tasks && property.tasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        📋 {property.tasks.length} task(s)
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingProperty(property);
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeletingProperty(property);
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyList;

