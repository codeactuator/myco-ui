import React from 'react';

const CaptureSection = ({ handleCapture, fileInputRef, handleImageChange }) => (
  <>
    <button
	  className="btn btn-outline-light"
	  onClick={handleCapture}
	  title="Capture Photo"
	>
	  <i className="bi bi-camera-fill me-2"></i> Capture Photo
	</button>

    <input
      type="file"
      accept="image/*"
      capture="environment"
	  multiple
      ref={fileInputRef}
      onChange={handleImageChange}
      style={{ display: 'none' }}
    />
  </>
);

export default CaptureSection;
