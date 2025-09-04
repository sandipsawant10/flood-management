import toast from "react-hot-toast";

export const showToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    });
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || "Loading...",
        success: messages.success || "Success!",
        error: messages.error || "Something went wrong",
      },
      {
        duration: 4000,
        ...options,
      }
    );
  },

  custom: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      style: {
        background: "#F59E0B",
        color: "#fff",
      },
      ...options,
    });
  },

  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
