import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * MSG91 SMS API integration for sending OTP messages.
 * Docs: https://docs.msg91.com/collection/msg91-api-integration/5/pages/14
 */
export async function sendOtpSms(mobileNumber, otp) {
  const authKey = env.msg91.authKey;

  // Log OTP locally when MSG91 is not configured (development / testing)
  if (!authKey) {
    console.log(`[DEV SMS] OTP for ${mobileNumber}: ${otp}`);
    return { success: true, dev: true };
  }

  const countryCode = '91'; // India — adjust if needed
  const mobile = mobileNumber.replace(/^\+?91/, '');

  const url = new URL('https://control.msg91.com/api/v5/otp');
  url.searchParams.set('otp', otp);
  url.searchParams.set('mobile', `${countryCode}${mobile}`);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: env.msg91.templateId,
      sender: env.msg91.senderId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('MSG91 error:', data);
    throw new AppError(
      data.message || 'Failed to send OTP via SMS',
      response.status >= 400 && response.status < 500 ? response.status : 502
    );
  }

  return { success: true, requestId: data.request_id };
}
