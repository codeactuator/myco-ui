import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CaptureSection from './CaptureSection';
import EmergencyModal from './EmergencyModal';
import { base64ToBlob, resizeBase64Image } from './utils/imageUtils';
import UserLayout from './UserLayout';
import { apiFetch } from './utils/api';

const ScanPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [uid, setUid] = useState(null);
	const [ownerId, setOwnerId] = useState(null);
	const [resolving, setResolving] = useState(true);

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

	useEffect(() => {
		const resolveUid = async () => {
			const params = new URLSearchParams(location.search);
			let rawUid = params.get('uid');

			if (!rawUid) {
				setResolving(false);
				return;
			}

			// Check if it's a UUID
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (uuidRegex.test(rawUid)) {
				setUid(rawUid);
				setResolving(false);
				return;
			}

			// Extract code if it's a short URL
			let shortCode = rawUid;
			if (rawUid.includes('/q/')) {
				const parts = rawUid.split('/q/');
				if (parts.length > 1) {
					shortCode = parts[1].split(/[?#]/)[0];
				}
			}

			// Resolve short code
			try {
				const data = await apiFetch(`/v1/short-links/${shortCode}`);
				setUid(data.uuid);
			} catch (error) {
				console.error("Error resolving short code", error);
			} finally {
				setResolving(false);
			}
		};
		resolveUid();
	}, [location.search]);

	// Fetch Owner ID when UID (Product ID) is resolved
	useEffect(() => {
		if (uid) {
			const fetchOwner = async () => {
				try {
					const data = await apiFetch(`/v1/products/owner/${uid}`);
					setOwnerId(data);
				} catch (error) {
					console.error("Error fetching product owner:", error);
				}
			};
			fetchOwner();
		}
	}, [uid]);

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
			const data = await apiFetch('/v1/users/verified', {
				method: 'POST',
				body: JSON.stringify({ mobileNumber: mobileNumber }),
			});

			if (data.verified) {
				setUserId(data.id);
				sessionStorage.setItem("userId", data.id); // ✅ Store in session
				sessionStorage.setItem("userName", data.name || "User");
				sessionStorage.setItem("userMobile", data.mobileNumber);
				setOtpStarted(false);
				setStep("capture");
			} else {
				await sendOtpToMobile();
				setStep('otp');
			}
		} catch {
			alert('Error verifying user.');
		}
	};

	const handleUploadClick = async () => {
		if (!userId) {
			alert('❌ User not verified. Please verify OTP first.');
			return;
		}

		const params = new URLSearchParams(location.search);
		const rawUid = params.get('uid');

		if (!rawUid) {
			alert('❌ Product ID not found in URL.');
			return;
		}

		let resolvedUid;
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (uuidRegex.test(rawUid)) {
			resolvedUid = rawUid;
		} else {
			let shortCode = rawUid;
			if (rawUid.includes('/q/')) {
				const parts = rawUid.split('/q/');
				if (parts.length > 1) {
					shortCode = parts[1].split(/[?#]/)[0];
				}
			}
			try {
				const data = await apiFetch(`/v1/short-links/${shortCode}`);
				resolvedUid = data.uuid;
			} catch (error) {
				console.error('Error resolving short code', error);
				alert('Error resolving product link.');
				return;
			}
		}

		if (!resolvedUid) {
			alert('Could not determine product ID.');
			return;
		}
		setUid(resolvedUid);

		let productOwnerId;
		try {
			productOwnerId = await apiFetch(`/v1/products/owner/${resolvedUid}`);
			setOwnerId(productOwnerId);
		} catch (error) {
			console.error('Error fetching product owner:', error);
			alert('An error occurred while fetching the product owner.');
			return;
		}

		if (!productOwnerId) {
			alert('Product owner could not be identified.');
			return;
		}

		const success = await uploadCapturedImage(productOwnerId);

		if (success) {
			alert('✅ Image uploaded successfully!');
			setIsUploaded(true);
		} else {
			alert('❌ Failed to upload image.');
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
			await apiFetch('/v1/otp/send', {
				method: 'POST',
				body: JSON.stringify({ mobileNumber }),
			});
			setOtpStarted(true);
		} catch (e) {
			alert(`❌ ${e.message}`);
		} finally {
			setIsSendingOtp(false);
		}
	};

	const verifyOtpWithApi = async () => {
		const code = otp.join('');
		if (code.length < 4 || mobileNumber.length < 10) return alert('Invalid input');
		setIsVerifying(true);
		try {
			const data = await apiFetch('/v1/otp/verify', {
				method: 'POST',
				body: JSON.stringify({ mobileNumber, otp: code }),
			});
			
			setUserId(data.id);
			sessionStorage.setItem("userId", data.id); // ✅ Store in session
			sessionStorage.setItem("userName", data.name || "User");
			sessionStorage.setItem("userMobile", data.mobileNumber);
			setStep('capture');
			setShowModal(false);
		} catch (e) {
			alert(`❌ ${e.message}`);
			setOtp(['', '', '', '']);
			document.getElementById('otp-0')?.focus();
		} finally {
			setIsVerifying(false);
		}
	};

	const makeCallToOwner = async () => {
		if (!ownerId) {
			alert("This product is not registered to any owner yet.");
			return;
		}

		try {
			await apiFetch('/v1/call', {
				method: 'POST',
				body: JSON.stringify({
				fromUserId: userId,
				toUserId: ownerId,
				mobileNumber,
				capturedImages }),
			});
			
			let uploadSuccess = await uploadCapturedImage(ownerId);

			if (uploadSuccess) {
				setShowSuccessDialog(true);
				navigate("/thank-you", { state: { userId, mobileNumber } });
			}
		} catch (e) {
			alert(`❌ ${e.message}`);
		}
	};

	const uploadCapturedImage = async (productOwnerId) => {
		if (capturedImages.length === 0) return false;

		if (!productOwnerId) {
			console.error("Cannot upload: Owner not found for this product.");
			return false;
		}

		// 1. Create Post with the first image
		const firstResized = await resizeBase64Image(capturedImages[0]);
		const firstBlob = base64ToBlob(firstResized);
		const formData = new FormData();
		formData.append('file', firstBlob, `captured-1.jpg`);
		formData.append('title', 'Emergency Alert');
		formData.append('postedBy', userId);
		formData.append('postedFor', productOwnerId);

		if (coordinates.latitude && coordinates.longitude) {
			formData.append('latitude', coordinates.latitude);
			formData.append('longitude', coordinates.longitude);
		}

		let postId;
		try {
			const data = await apiFetch('/v1/posts', { method: 'POST', body: formData });
			postId = data.id;
		} catch (e) {
			console.error("Error creating post", e);
			return false;
		}

		// 2. Upload remaining images to the same post
		for (let i = 1; i < capturedImages.length; i++) {
			const resized = await resizeBase64Image(capturedImages[i]);
			const blob = base64ToBlob(resized);
			const fd = new FormData();
			fd.append('file', blob, `captured-${i + 1}.jpg`);
			await apiFetch(`/v1/posts/${postId}/files`, { method: 'POST', body: fd });
		}

		return true;
	};

	if (resolving) {
		return (
			<UserLayout pageTitle="Scan" hideNav={true}>
				<div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
					<div className="spinner-border text-primary" role="status"></div>
				</div>
			</UserLayout>
		);
	}

	return (
		// Add key to force remount when userId changes (login happens), ensuring UserLayout reads new sessionStorage
		<UserLayout pageTitle="Scan" hideNav={step !== 'capture'} key={userId || 'guest'}>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-6">
						{step === 'mobile' && (
							<div className="card shadow p-4">
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
							<div className="card shadow p-4">
								<h4 className="text-center mb-4">Capture Photo</h4>
								
								<button 
									className="btn btn-lg btn-outline-primary w-100 mb-4 py-4 d-flex flex-column align-items-center justify-content-center"
									onClick={handleCapture}
									style={{ borderStyle: 'dashed', borderWidth: '2px', backgroundColor: '#f8f9fa' }}
								>
									<i className="bi bi-camera-fill fs-1 mb-2 text-primary"></i>
									<span className="fs-5 fw-bold text-dark">Tap to Take Photo</span>
								</button>

								<div style={{ display: 'none' }}>
									<CaptureSection {...{ handleCapture, fileInputRef, handleImageChange }} />
								</div>

								{capturedImages.length > 0 && (
									<div className="mb-4">
										{capturedImages.map((img, index) => (
											<div key={index} className="position-relative mb-3 text-center bg-light rounded p-2 border">
												<img src={img} alt={`Captured ${index + 1}`} className="img-fluid rounded" style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
												<button onClick={() => handleRemoveImage(index)} className="btn btn-danger position-absolute top-0 end-0 m-3 rounded-circle shadow-sm" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
													<i className="bi bi-trash-fill fs-5"></i>
												</button>
											</div>
										))}
									</div>
								)}

								<div className="d-grid gap-3">
									{capturedImages.length > 0 && !isUploaded && (
										<button className="btn btn-primary btn-lg py-3" onClick={handleUploadClick}>
											<i className="bi bi-cloud-upload-fill me-2"></i> Upload Photo
										</button>
									)}
									{isUploaded && (
										<button className="btn btn-danger btn-lg py-3" onClick={makeCallToOwner}>
											<i className="bi bi-telephone-fill me-2"></i> Emergency Call
										</button>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			{step === 'otp' && (
				<EmergencyModal
					{...{
						showModal: true,
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
		</UserLayout>
	);
};

export default ScanPage;
