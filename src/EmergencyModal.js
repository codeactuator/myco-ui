import React from 'react';
import OtpInputs from './OtpInputs';

const EmergencyModal = ({
  showModal,
  setShowModal,
  otpStarted,
  mobileNumber,
  setMobileNumber,
  sendOtpToMobile,
  otp,
  handleOtpChange,
  verifyOtpWithApi,
  isSendingOtp,
  isVerifying,
  resendTimer,
}) => {
  if (!showModal) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Verify Mobile Number</h5>
            <button className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            {!otpStarted ? (
              <>
                <input
                  type="tel"
                  className="form-control mb-3"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
                <button
                  className="btn btn-primary w-100"
                  onClick={sendOtpToMobile}
                  disabled={isSendingOtp || mobileNumber.length < 10}
                >
                  {isSendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <label className="form-label text-center d-block">Enter 4-digit OTP</label>
                <OtpInputs otp={otp} handleOtpChange={handleOtpChange} />
                <button
                  className="btn btn-success w-100 my-3"
                  onClick={verifyOtpWithApi}
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  className="btn btn-link text-decoration-none"
                  disabled={resendTimer > 0}
                  onClick={sendOtpToMobile}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : '🔄 Resend OTP'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
