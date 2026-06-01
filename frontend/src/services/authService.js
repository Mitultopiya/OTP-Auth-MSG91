import api from './api';

/**
 * Auth API service — all authentication endpoints.
 */
const authService = {
  sendRegisterOtp: (mobileNumber) =>
    api.post('/auth/register/send-otp', { mobileNumber }),

  register: (payload) => api.post('/auth/register', payload),

  loginPassword: (mobileNumber, password) =>
    api.post('/auth/login/password', { mobileNumber, password }),

  sendLoginOtp: (mobileNumber) => api.post('/auth/login/otp/send', { mobileNumber }),

  loginOtp: (mobileNumber, otp) => api.post('/auth/login/otp/verify', { mobileNumber, otp }),

  sendForgotPasswordOtp: (mobileNumber) =>
    api.post('/auth/forgot-password/send-otp', { mobileNumber }),

  resetPassword: (payload) => api.post('/auth/forgot-password/reset', payload),

  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  getProfile: () => api.get('/auth/profile'),
};

export default authService;
