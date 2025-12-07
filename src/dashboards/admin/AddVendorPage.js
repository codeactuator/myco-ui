import React from 'react';

const AddVendorPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would make an API call here to create the vendor.
    alert('New vendor created successfully! (This is a demo)');
    e.target.reset();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Add a New Vendor</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="vendorName" className="form-label">Vendor Name</label>
            <input type="text" className="form-control" id="vendorName" required />
          </div>
          <div className="mb-3">
            <label htmlFor="contactPerson" className="form-label">Contact Person</label>
            <input type="text" className="form-control" id="contactPerson" required />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="vendorEmail" className="form-label">Email Address</label>
              <input type="email" className="form-control" id="vendorEmail" required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="vendorPhone" className="form-label">Phone Number</label>
              <input type="tel" className="form-control" id="vendorPhone" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create Vendor</button>
        </form>
      </div>
    </div>
  );
};

export default AddVendorPage;