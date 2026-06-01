import * as authService from '../services/authService.js';

/**
 * Auth controller — maps HTTP requests to auth service layer.
 */
const AuthController = {
  async sendRegisterOtp(req, res) {
    const { mobileNumber } = req.body;
    const result = await authService.sendRegisterOtp(mobileNumber, req);
    res.status(200).json({ success: true, message: 'OTP sent successfully', data: result });
  },

  async register(req, res) {
    const { fullName, mobileNumber, password, otp } = req.body;
    const result = await authService.registerUser(
      { fullName, mobileNumber, password, otp },
      req
    );
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  },

  async loginPassword(req, res) {
    const { mobileNumber, password } = req.body;
    const result = await authService.loginWithPassword(mobileNumber, password, req);
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  },

  async sendLoginOtp(req, res) {
    const { mobileNumber } = req.body;
    const result = await authService.sendLoginOtp(mobileNumber, req);
    res.status(200).json({ success: true, message: 'OTP sent successfully', data: result });
  },

  async loginOtp(req, res) {
    const { mobileNumber, otp } = req.body;
    const result = await authService.loginWithOtp(mobileNumber, otp, req);
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  },

  async sendForgotPasswordOtp(req, res) {
    const { mobileNumber } = req.body;
    const result = await authService.sendForgotPasswordOtp(mobileNumber, req);
    res.status(200).json({ success: true, message: 'OTP sent successfully', data: result });
  },

  async resetPassword(req, res) {
    const { mobileNumber, otp, newPassword } = req.body;
    const result = await authService.resetPassword(
      { mobileNumber, otp, newPassword },
      req
    );
    res.status(200).json({ success: true, ...result });
  },

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken, req);
    res.status(200).json({ success: true, data: result });
  },

  async logout(req, res) {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken, req);
    res.status(200).json({ success: true, ...result });
  },

  async getProfile(req, res) {
    const result = await authService.getProfile(req.user.id, req);
    res.status(200).json({ success: true, data: result });
  },
};

export default AuthController;
