import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react';
import API_BASE_URL from '../../config';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({ vendorId: '', productId: '', quantity: 100 });
  const [vendors, setVendors] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [qrConfigs, setQrConfigs] = useState({
    default: { size: 128, fgColor: '#000000', bgColor: '#FFFFFF', rounded: false },
    products: {}
  });

  useEffect(() => {
    fetchVendors();
    fetchQrConfigs();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (newOrder.vendorId) {
      fetchProducts(newOrder.vendorId);
    }
    setAvailableProducts([]);
    setNewOrder(prev => ({ ...prev, productId: '' }));
  }, [newOrder.vendorId]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/vendors`);
      if (res.ok) setVendors(await res.json());
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchProducts = async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/products/vendor/${vendorId}`);
      if (res.ok) setAvailableProducts(await res.json());
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchQrConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/qr-configs`);
      if (res.ok) setQrConfigs(await res.json());
    } catch (error) {
      console.error("Error fetching QR configs:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/orders`);
      if (res.ok) {
        const data = await res.json();
        const mappedOrders = data.map(order => ({
          ...order,
          vendorName: order.vendor?.name || 'Unknown',
          productName: order.product?.name || 'Unknown',
          productId: order.product?.id,
          createdAt: new Date(order.createdAt)
        }));
        // Sort by date descending
        mappedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.vendorId || !newOrder.productId || newOrder.quantity <= 0) {
      toast.error('Please fill out all fields correctly.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/v1/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor: { id: newOrder.vendorId },
          product: { id: newOrder.productId },
          quantity: parseInt(newOrder.quantity)
        })
      });

      if (res.ok) {
        toast.success('Order created successfully!');
        setShowOrderForm(false);
        setNewOrder({ vendorId: '', productId: '', quantity: 100 });
        fetchOrders();
      } else {
        toast.error('Failed to create order.');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error('Error creating order.');
    }
  };

  const handlePrintAndDownload = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes for Order ${order.id}</title>
          <style>
            body { font-family: sans-serif; margin: 1rem; }
            @page { size: A4; margin: 20mm; }
            h1 { font-size: 1.5rem; text-align: center; }
            .header-info { margin-bottom: 1rem; border-bottom: 1px solid #ccc; padding-bottom: 1rem; }
            .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 1rem; }
            .qr-item { text-align: center; page-break-inside: avoid; padding: 5px; border: 1px solid #ccc; }
            .qr-item canvas { width: 100% !important; height: auto !important; }
            .qr-item img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1>QR Codes for Order ${order.id}</h1>
          <div class="header-info">
            <p><strong>Vendor:</strong> ${order.vendorName}</p>
            <p><strong>Product:</strong> ${order.productName}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
          </div>
          <div class="qr-grid" id="qr-container">
            ${order.qrcodes.map((qr, index) => {
              const canvas = document.getElementById(`qr-${order.id}-${index}`);
              if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                const config = qrConfigs.products[order.productId] || qrConfigs.default;
                return `<div class="qr-item" style="border-radius: ${config.rounded ? '8px' : '0'};"><img src="${dataUrl}" alt="QR Code for ${qr}" style="border-radius: ${config.rounded ? '6px' : '0'};" /></div>`;
              }
              return '';
            }).join('')}
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadAsImages = (order) => {
    order.qrcodes.forEach((qr, index) => {
      const canvas = document.getElementById(`qr-${order.id}-${index}`);
      if (canvas) {
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${order.id}-${index + 1}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    });
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Vendor Orders</h4>
        {!showOrderForm && <button className="btn btn-primary" onClick={() => setShowOrderForm(true)}><i className="bi bi-plus-lg me-2"></i>Create New Order</button>}
      </div>

      {showOrderForm && (
        <div className="card-body border-bottom">
          <h5>Create Order</h5>
          <form onSubmit={handleGenerateOrder}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Vendor</label>
                <select name="vendorId" value={newOrder.vendorId} onChange={handleInputChange} className="form-select" required>
                  <option value="">Select a vendor</option>
                  {vendors.map(vendor => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Product</label>
                <select name="productId" value={newOrder.productId} onChange={handleInputChange} className="form-select" required disabled={!newOrder.vendorId}>
                  <option value="">{newOrder.vendorId ? 'Select a product' : 'Select vendor first'}</option>
                  {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Quantity</label>
                <input type="number" name="quantity" value={newOrder.quantity} onChange={handleInputChange} className="form-control" min="1" required />
              </div>
            </div>
            <button type="submit" className="btn btn-success me-2">Generate Order</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
            <tr><th>Order ID</th><th>Vendor</th><th>Product</th><th>Quantity</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan="6" className="text-center p-4">No orders created yet.</td></tr>}
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  <td>{order.id}</td><td>{order.vendorName}</td><td>{order.productName}</td><td>{order.quantity}</td><td>{order.createdAt.toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-info" 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <i className={`bi me-1 ${expandedOrderId === order.id ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                      {expandedOrderId === order.id ? 'Hide' : 'View'} Codes
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan="6" className="p-3 bg-light">
                      <h6 className="mb-2">Generated UUIDs for Order {order.id}</h6>
                      <div 
                        className="d-flex flex-wrap gap-3 p-2"
                        style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '0.25rem', background: '#fff' }}
                      >
                        {order.qrcodes.map((qr, index) => {
                          const config = qrConfigs.products[order.productId] || qrConfigs.default;
                          return (
                            <div 
                              key={index} 
                              className="text-center p-1"
                              style={{ border: '1px solid #ddd', borderRadius: config.rounded ? '8px' : '0' }}
                            >
                              <QRCodeCanvas 
                                id={`qr-${order.id}-${index}`} 
                                value={`${window.location.origin}/scan?uid=${qr}`} 
                                size={config.size} 
                                fgColor={config.fgColor} 
                                bgColor={config.bgColor} 
                                level="M" 
                                style={{ borderRadius: config.rounded ? '6px' : '0' }} 
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3">
                        <button className="btn btn-sm btn-secondary me-2" onClick={() => handleDownloadAsImages(order)}>
                          <i className="bi bi-download me-1"></i> Download All
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handlePrintAndDownload(order)} title="Open a print-friendly page to print or save as PDF">
                          <i className="bi bi-printer me-1"></i> Print / Save as PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrders;