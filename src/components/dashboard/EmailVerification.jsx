import React, { useState } from 'react';
import { account } from '../../utils/appwriteConfig';
import { toast } from 'react-hot-toast';

const EmailVerification = ({ email, onVerificationComplete }) => {
  const [sending, setSending] = useState(false);

  const sendVerificationEmail = async () => {
    try {
      setSending(true);
      const promise = await account.createVerification(
        'http://localhost:5173/dashboard'
      );
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
      console.error('Verification email error:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Please verify your email address ({email}) to access all features.
          </p>
          <div className="mt-4">
            <button
              onClick={sendVerificationEmail}
              disabled={sending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {sending ? 'Sending...' : 'Send Verification Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
