import React from 'react';

const PromotionsPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('New promotion created! (This is a demo)');
    e.target.reset();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Create a New Promotion</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">Product Name / SKU</label>
            <input type="text" className="form-control" id="productName" required />
          </div>
          <div className="mb-3">
            <label htmlFor="offerDetails" className="form-label">Offer Details</label>
            <textarea className="form-control" id="offerDetails" rows="3" placeholder="e.g., '20% off for all registered users'" required></textarea>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input type="date" className="form-control" id="startDate" required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input type="date" className="form-control" id="endDate" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Launch Promotion</button>
        </form>
      </div>
    </div>
  );
};

export default PromotionsPage;