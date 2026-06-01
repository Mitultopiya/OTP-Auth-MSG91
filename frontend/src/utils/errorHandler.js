import toast from 'react-hot-toast';

/**
 * Extracts user-friendly message from API error response.
 */
export function getErrorMessage(error) {
  const data = error.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(', ');
  }
  return data?.message || error.message || 'Something went wrong';
}

export function showError(error) {
  toast.error(getErrorMessage(error));
}

export function showSuccess(message) {
  toast.success(message);
}
