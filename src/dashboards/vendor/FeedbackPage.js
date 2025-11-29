import React from 'react';

const FeedbackPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Feedback request sent! (This is a demo)');
    e.target.reset();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h4 className="card-title mb-4">Request Customer Feedback</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="feedbackProduct" className="form-label">Select Product</label>
            <select className="form-select" id="feedbackProduct" required>
              <option value="">Choose a product...</option>
              <option value="wallet-v1">Premium Leather Wallet</option>
              <option value="backpack-v3">City Explorer Backpack</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Send Rating Request</button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;