import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import API_BASE_URL from "./config";

const QrCodePage = () => {
  const [qrImage, setQrImage] = useState(null);
  const navigate = useNavigate();
  const userId = "3172b0e7-a538-4085-8cf8-fe7fae1b07ce"; // replace with real user ID (from login context, token, etc.)


  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/qr/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch QR code");
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setQrImage(imageUrl);
      } catch (err) {
        console.error(err);
        alert("Error fetching QR code");
      }
    };

    fetchQrCode();
  }, [userId]);
  
  
  
	const handlePrint = () => {
	  const printWindow = window.open('', '_blank');
	  printWindow.document.write(`
		<html>
		  <head>
			<title>Print QR Code</title>
			<style>
			  body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
			  img { max-width: 300px; }
			</style>
		  </head>
		  <body>
			<img src="${qrImage}" alt="QR Code" />
			<script>
			  window.onload = () => {
				window.print();
				window.onafterprint = () => window.close();
			  };
			</script>
		  </body>
		</html>
	  `);
	};

	const handleShare = async () => {
	  if (navigator.share) {
		try {
		  await navigator.share({
			title: 'My QR Code',
			text: 'Scan this QR Code to get my profile.',
			url: qrImage,
		  });
		} catch (err) {
		  alert('Sharing cancelled or failed.');
		}
	  } else {
		alert('Sharing is not supported in this browser.');
	  }
	};
	
	const handleDownload = () => {
	  if (!qrImage) return;

	  const link = document.createElement('a');
	  link.href = qrImage;
	  link.download = 'my-qr-code.png'; // file name
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	};




  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Header with Home Button */}
	  <header className="bg-primary text-white py-3 shadow-sm sticky-top">
		  <div className="container d-flex justify-content-between align-items-center">
			
			{/* Home Button on the Left */}
			<button
			  className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
			  onClick={() => navigate("/home")}
			  style={{ width: "40px", height: "40px" }}
			  aria-label="Home"
			>
			  <i className="bi bi-house-door-fill fs-5"></i>
			</button>

			<h4 className="mb-0">My QR Code</h4>

			{/* Icons on the Right: Print, Share, Download */}
			<div className="d-flex align-items-center gap-2">
			  <button
				className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
				onClick={handlePrint}
				style={{ width: "40px", height: "40px" }}
				aria-label="Print QR"
			  >
				<i className="bi bi-printer fs-5"></i>
			  </button>

			  <button
				className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
				onClick={handleShare}
				style={{ width: "40px", height: "40px" }}
				aria-label="Share QR"
			  >
				<i className="bi bi-share-fill fs-5"></i>
			  </button>

			  <button
				className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center"
				onClick={handleDownload}
				style={{ width: "40px", height: "40px" }}
				aria-label="Download QR"
			  >
				<i className="bi bi-download fs-5"></i>
			  </button>
			</div>
		  </div>
	</header>




		{/* QR Code Display */}
		<div className="flex-grow-1 d-flex justify-content-center align-items-center p-4">
		  {qrImage ? (
			<img
			  src={qrImage}
			  alt="User QR Code"
			  className="img-fluid shadow"
			  style={{ maxWidth: "300px" }}
			/>
		  ) : (
			<p>Loading QR code...</p>
		  )}
		</div>

    </div>
  );
};

export default QrCodePage;
