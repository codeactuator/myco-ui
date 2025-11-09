import React from 'react';

const OtpInputs = ({ otp, handleOtpChange }) => (
  <div className="d-flex justify-content-center gap-2">
    {otp.map((digit, index) => (
      <input
        key={index}
        id={`otp-${index}`}
        type="text"
        className="form-control text-center"
        maxLength={1}
        value={digit}
        onChange={(e) => handleOtpChange(index, e.target.value)}
        style={{ width: '50px', fontSize: '1.5rem' }}
      />
    ))}
  </div>
);

export default OtpInputs;
