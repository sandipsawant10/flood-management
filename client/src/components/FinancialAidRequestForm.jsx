import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { submitFinancialAidRequest } from '../services/financialAid';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const FinancialAidRequestForm = () => {
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: submitFinancialAidRequest,
    onSuccess: () => {
      toast.success('Financial aid request submitted successfully');
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Request Financial Aid</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Request
          </label>
          <textarea
            {...register('reason', { required: 'Reason is required' })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Please explain why you need financial assistance"
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Requested (PHP)
          </label>
          <input
            type="number"
            {...register('amountRequested', {
              required: 'Amount is required',
              min: {
                value: 1000,
                message: 'Minimum amount is PHP 1,000',
              },
              max: {
                value: 50000,
                message: 'Maximum amount is PHP 50,000',
              },
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
          {errors.amountRequested && (
            <p className="mt-1 text-sm text-red-600">
              {errors.amountRequested.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinancialAidRequestForm;