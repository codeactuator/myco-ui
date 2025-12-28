import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const ShortUrlHandler = () => {
    const { shortId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const resolveShortLink = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/v1/short-links/${shortId}`);
                if (response.ok) {
                    const data = await response.json();
                    navigate(`/scan?uid=${data.uuid}`, { replace: true });
                } else {
                    navigate('/scan');
                }
            } catch (error) {
                console.error("Failed to resolve short link", error);
                navigate('/scan');
            }
        };

        if (shortId) {
            resolveShortLink();
        }
    }, [shortId, navigate]);

    return null;
};

export default ShortUrlHandler;