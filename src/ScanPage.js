import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CaptureSection from './CaptureSection';
import EmergencyModal from './EmergencyModal';
import { base64ToBlob, resizeBase64Image } from './utils/imageUtils';
import API_BASE_URL from './config';

const ScanPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const ownerId = new URLSearchParams(location.search).get('ownerId');

	const fileInputRef = useRef(null);
	const [capturedImages, setCapturedImages] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [mobileNumber, setMobileNumber] = useState('');
	const [userId, setUserId] = useState(null);
	const [postId, setPostId] = useState(null);
	const [otpStarted, setOtpStarted] = useState(false);
	const [otp, setOtp] = useState(['', '', '', '']);
	const [resendTimer, setResendTimer] = useState(60);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);
	const [step, setStep] = useState('mobile');
	const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

	// ⬇️ Check sessionStorage for userId on load
	useEffect(() => {
		const storedUserId = sessionStorage.getItem("userId");
		if (storedUserId) {
			setUserId(storedUserId);
			setStep("capture");
		}
	}, []);

	useEffect(() => {
		if (otpStarted && resendTimer > 0) {
			const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [resendTimer, otpStarted]);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setCoordinates({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
			},
			(error) => {
				console.error("Error getting location:", error);
				alert("Could not get location. Make sure location is enabled.");
			}
		);
	}, []);

	const handleCapture = () => fileInputRef.current?.click();

	const checkUserVerification = async () => {
		if (!mobileNumber || mobileNumber.length < 10) {
			alert('Please enter a valid mobile number');
			return;
		}

		try {
			const res = await fetch(`${API_BASE_URL}/v1/users/verified`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mobileNumber: mobileNumber }),
			});

			const data = await res.json();
			console.log(data);

			if (res.ok && data.verified) {
				setUserId(data.id);
				sessionStorage.setItem("userId", data.id); // ✅ Store in session
				setOtpStarted(false);
				setStep("capture");
			} else {
				await sendOtpToMobile();
				setStep('otp');
				setShowModal(true);
			}
		} catch {
			alert('Error verifying user.');
		}
	};

	const handleUploadClick = async () => {
		if (!userId) {
			alert("❌ User not verified. Please verify OTP first.");
			return;
		}

		const success = await uploadCapturedImage();

		if (success) {
			alert("✅ Image uploaded successfully!");
			setIsUploaded(true);
		} else {
			alert("❌ Failed to upload image.");
		}
	};

	const handleRemoveImage = (indexToRemove) => {
		setCapturedImages((prevImages) =>
			prevImages.filter((_, index) => index !== indexToRemove)
		);
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				setCapturedImages((prev) => [...prev, reader.result]);
			};
			reader.readAsDataURL(file);
		});
	};

	const handleButtonClick = () => {
		setShowModal(true);
		setMobileNumber('');
		setOtpStarted(false);
		setOtp(['', '', '', '']);
		setResendTimer(60);
	};

	const handleOtpChange = (index, value) => {
		if (!/^\d?$/.test(value)) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);
		if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
	};

	const sendOtpToMobile = async () => {
		setIsSendingOtp(true);
		try {
			const res = await fetch(`${API_BASE_URL}/v1/otp/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mobileNumber }),
			});
			const data = await res.json();
			res.ok ? setOtpStarted(true) : alert(`❌ ${data.message}`);
		} catch {
			alert('Error sending OTP.');
		} finally {
			setIsSendingOtp(false);
		}
	};

	const verifyOtpWithApi = async () => {
		const code = otp.join('');
		if (code.length < 4 || mobileNumber.length < 10) return alert('Invalid input');
		setIsVerifying(true);
		try {
			const res = await fetch(`${API_BASE_URL}/v1/otp/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mobileNumber, otp: code }),
			});
			if (res.ok) {
				const data = await res.json();
				setUserId(data.id);
				sessionStorage.setItem("userId", data.id); // ✅ Store in session
				setStep('capture');
				setShowModal(false);
			} else {
				alert('❌ Invalid OTP');
				setOtp(['', '', '', '']);
				document.getElementById('otp-0')?.focus();
			}
		} catch {
			alert('Verification error');
		} finally {
			setIsVerifying(false);
		}
	};

	const makeCallToOwner = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/v1/call`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: ownerId, mobileNumber, capturedImages }),
			});
			if (res.ok && (await uploadCapturedImage())) {
				const data = await res.json();
				setShowSuccessDialog(true);
				navigate("/thank-you", { state: { userId, mobileNumber } });
			} else {
				const data = await res.json();
				alert(`❌ ${data.message}`);
			}
		} catch {
			alert('Call failed.');
		}
	};

	const uploadCapturedImage = async () => {
		if (capturedImages.length === 0) return false;

		for (let i = 0; i < capturedImages.length; i++) {
			const resized = await resizeBase64Image(capturedImages[i]);
			const imageBlob = base64ToBlob(resized);
			const formData = new FormData();
			formData.append('file', imageBlob, `captured-${i + 1}.jpg`);
			formData.append('title', 'Add Title');
			formData.append('postedBy', userId);
			formData.append('postedFor', ownerId);

			if (coordinates.latitude && coordinates.longitude) {
				formData.append('latitude', coordinates.latitude);
				formData.append('longitude', coordinates.longitude);
			}

			const res = await fetch(`${API_BASE_URL}/v1/posts`, {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) return false;
		}

		return true;
	};

	return (
		<div className="bg-light min-vh-100 d-flex flex-column">
			<div className="py-3 d-flex justify-content-between align-items-center border-bottom px-4 bg-primary text-white">
				<h1 className="mb-0">myco</h1>
				{step === 'capture' && (
					<div className="d-flex align-items-center gap-3">
						<CaptureSection {...{ handleCapture, fileInputRef, handleImageChange }} />
						<button
							className="btn btn-outline-light"
							title="Go Home"
							onClick={() => navigate('/home')}
						>
							<i className="bi bi-house-fill"></i>
						</button>
					</div>
				)}
			</div>

			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
				{step === 'mobile' && (
					<div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
						<h6 className="text-center mb-4">Login with your mobile number</h6>
						<input
							type="text"
							className="form-control mb-3"
							placeholder="Mobile Number"
							value={mobileNumber}
							onChange={(e) => setMobileNumber(e.target.value)}
						/>
						<button className="btn btn-primary w-100" onClick={checkUserVerification}>
							<i className="bi bi-arrow-right me-2"></i> Continue
						</button>
					</div>
				)}

				{step === 'capture' && (
					<div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
						<h6 className="text-success text-center mb-4">Capture Photo</h6>

						{capturedImages.length > 0 && (
							<div className="mb-3 text-center d-flex flex-wrap justify-content-center gap-2">
								{capturedImages.map((img, index) => (
									<div key={index} className="position-relative" style={{ display: 'inline-block' }}>
										<img
											src={img}
											alt={`Captured ${index + 1}`}
											className="img-thumbnail"
											style={{ width: '100px', height: '100px', objectFit: 'cover' }}
										/>
										<button
											onClick={() => handleRemoveImage(index)}
											className="btn btn-sm btn-danger position-absolute top-0 end-0"
											style={{ transform: 'translate(10%, -10%)', backgroundColor: 'rgba(220,53,69,0.9)' }}
										>
											&times;
										</button>
									</div>
								))}
							</div>
						)}

						<div className="d-grid gap-3">
							{capturedImages.length > 0 && !isUploaded && (
								<button className="btn btn-primary" onClick={handleUploadClick}>
									<i className="bi bi-upload me-2"></i> Upload Photo
								</button>
							)}

							{isUploaded && (
								<button className="btn btn-danger" onClick={handleButtonClick}>
									📞 Emergency Call
								</button>
							)}
						</div>
					</div>
				)}
			</div>

			{step === 'otp' && (
				<EmergencyModal
					{...{
						showModal: true,
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
					}}
				/>
			)}
		</div>
	);
};

export default ScanPage;
