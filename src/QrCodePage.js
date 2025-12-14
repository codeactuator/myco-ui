import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { QRCodeSVG } from "qrcode.react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API_BASE_URL from "./config";
import UserLayout from "./UserLayout";

const QrCodePage = () => {
  const [qrOwnerId, setQrOwnerId] = useState(null);
  const navigate = useNavigate();
  const userId = "3172b0e7-a538-4085-8cf8-fe7fae1b07ce"; // replace with real user ID (from login context, token, etc.)

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/qr/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch QR owner ID");
        const id = await response.text(); // Get the ID from the response body
        setQrOwnerId(id); // Set the fetched ID
      } catch (err) {
        console.error(err);
        alert("Error fetching QR code");
      }
    };
 
    fetchQrCode();
  }, [userId]);
 
  const getQrCodeDataUrl = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return null;
 
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
 
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    });
  };
 
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
			${document.getElementById("qr-code-svg")?.outerHTML || ""}
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
	  const dataUrl = await getQrCodeDataUrl();
    if (!dataUrl || !navigator.share) {
      alert("Sharing is not supported or QR code is not available.");
      return;
    }

    try {
      await navigator.share({
        title: "My QR Code",
        text: "Scan this QR Code to get my profile.",
        url: dataUrl,
      });
    } catch (err) {
      alert("Sharing cancelled or failed.");
    }
	};
	
	const handleDownload = async () => {
	  const qrImage = await getQrCodeDataUrl();
    if (!qrImage) return;
 
	  const link = document.createElement('a');
	  link.href = qrImage;
	  link.download = 'my-qr-code.png'; // file name
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	};

  return (
    <UserLayout pageTitle="My QR Code">
      <div className="d-flex justify-content-end gap-2 mb-3">
        <button className="btn btn-secondary" onClick={handlePrint} title="Print QR">
          <i className="bi bi-printer fs-5"></i>
        </button>
        <button className="btn btn-secondary" onClick={handleShare} title="Share QR">
          <i className="bi bi-share-fill fs-5"></i>
        </button>
        <button className="btn btn-secondary" onClick={handleDownload} title="Download QR">
          <i className="bi bi-download fs-5"></i>
        </button>
      </div>
		{/* QR Code Display */}
		<div className="d-flex justify-content-center align-items-center p-4">
		  {qrOwnerId ? (
        <div className="shadow p-3 bg-white rounded">
          <QRCodeSVG
            id="qr-code-svg"
            value={`${window.location.origin}/scan?uid=${qrOwnerId}`}
            size={280}
          />
        </div>
		  ) : (
			<p>Loading QR code...</p>
		  )}
		</div>
    </UserLayout>
  );
};

export default QrCodePage;
