import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

const ResourceInventory = ({ resources, onUpdateResource }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const queryClient = useQueryClient();

  const getStatusColor = (quantity, threshold) => {
    if (quantity <= threshold * 0.2) return 'text-red-600';
    if (quantity <= threshold * 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleQuantityUpdate = (e) => {
    e.preventDefault();
    if (!selectedResource || updateQuantity === '') return;

    const newQuantity = parseInt(updateQuantity, 10);
    if (isNaN(newQuantity) || newQuantity < 0) return;

    onUpdateResource(
      { resourceId: selectedResource._id, quantity: newQuantity },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['resources']);
          setSelectedResource(null);
          setUpdateQuantity('');
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Resource List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {resources.map((resource) => (
          <div
            key={resource._id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedResource?._id === resource._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setSelectedResource(resource)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{resource.name}</h3>
              <span className={`font-medium ${getStatusColor(resource.quantity, resource.threshold)}`}>
                {resource.quantity} / {resource.threshold}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{resource.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Category: {resource.category}
              </span>
              <span className="text-gray-500">
                Last updated: {new Date(resource.lastUpdate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Update Form */}
      {selectedResource && (
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Update {selectedResource.name} Quantity
          </h3>
          <form onSubmit={handleQuantityUpdate} className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                New Quantity
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  value={updateQuantity}
                  onChange={(e) => setUpdateQuantity(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new quantity"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Current: {selectedResource.quantity} / {selectedResource.threshold}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResource(null);
                    setUpdateQuantity('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateQuantity === ''}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  Update
                </button>
              </div>
            </div>
          </form>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resource Details</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedResource.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(selectedResource.lastUpdate).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

ResourceInventory.propTypes = {
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      threshold: PropTypes.number.isRequired,
      lastUpdate: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdateResource: PropTypes.func.isRequired,
};

export default ResourceInventory;