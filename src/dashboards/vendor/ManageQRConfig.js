import React, { useState } from 'react';

const ManageQRConfig = ({ vendorId }) => {
  const [qrColor, setQrColor] = useState('#000000');
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert(`Configuration Saved!\nColor: ${qrColor}\nLogo: ${logo ? logo.name : 'No logo uploaded'}`);
  };

  return (
    <div className="container-fluid">
      <h3>QR Configuration</h3>
      <p className="text-muted">Configure QR code settings for your products here.</p>
      
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title mb-4">Appearance</h5>
          
          <div className="mb-3">
             <label className="form-label">QR Color</label>
             <input 
               type="color" 
               className="form-control form-control-color" 
               value={qrColor} 
               onChange={(e) => setQrColor(e.target.value)}
               title="Choose your color" 
             />
          </div>

          <div className="mb-3">
            <label className="form-label">Center Logo (Optional)</label>
            <input type="file" className="form-control" accept="image/*" onChange={handleLogoChange} />
            <div className="form-text">Upload a square image (PNG/JPG) to appear in the center of the QR code.</div>
          </div>

          {preview && (
            <div className="mb-3">
              <label className="form-label d-block">Logo Preview</label>
              <img src={preview} alt="Logo Preview" className="img-thumbnail" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            </div>
          )}

          <button className="btn btn-primary mt-3" onClick={handleSave}>Save Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default ManageQRConfig;
