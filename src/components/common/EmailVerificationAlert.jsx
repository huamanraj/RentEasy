import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const EmailVerificationAlert = ({ message }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{message || "Please verify your email address to access this feature."}</p>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-yellow-800 hover:text-yellow-700 underline"
            >
              Go to Dashboard to Verify Email →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

EmailVerificationAlert.propTypes = {
  message: PropTypes.string
};

export default EmailVerificationAlert;
