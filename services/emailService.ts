// emailService.ts
// Sends TOTP codes via EmailJS (browser SDK — no backend needed).
//


declare const emailjs: {
  init: (config: { publicKey: string }) => void;
  send: (
    serviceId: string,
    templateId: string,
    params: Record<string, string>,
    options?: { publicKey: string }
  ) => Promise<{ status: number; text: string }>;
};


const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined;

export interface SendTOTPResult {
  success: boolean;
  error?: string;
}

export const sendTOTPEmail = async (
  toEmail: string,
  totpCode: string
): Promise<SendTOTPResult> => {
  try {
        const emailjsClient = (window as any).emailjs;
        if (!emailjsClient) {
          throw new Error('EmailJS SDK not loaded');
    }
    if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
      throw new Error('EmailJS not configured');
    }

    const toName = toEmail.split('@')[0];

    // Log what we're sending so it's easy to debug template mismatches
    console.log('[emailService] Sending OTP to:', toEmail, '| Params:', {
      to_email: toEmail,
      to_name:  toName,
      otp:      totpCode,
    });

    // Pass publicKey in the send call directly (no separate init needed)
    const response = await emailjsClient.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,   // used in template "To Email" field as {{to_email}}
        to_name:  toName,    // {{to_name}} in template body
        otp:      totpCode,  // {{otp}} in template body
      },
      { publicKey: PUBLIC_KEY }
    );

    console.log('[emailService] Response:', response.status, response.text);

    if (response.status === 200) {
      return { success: true };
    }
    return {
      success: false,
      error: `Status ${response.status}: ${response.text}`,
    };

  } catch (err: unknown) {
    // Stringify properly — EmailJS errors are often objects
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null) {
      message = JSON.stringify(err);
    } else {
      message = String(err);
    }
    console.error('[emailService] Failed to send OTP:', message);
    return { success: false, error: message };
  }
};

export const isEmailServiceConfigured = (): boolean => {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
};
