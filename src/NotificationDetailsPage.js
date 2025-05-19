import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const NotificationDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAzCNCNbdAejKSgQrUgkshTJ_gapr6aioc',
  });

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
    }
  }, [postId]);

  const fetchPostDetails = async (id) => {
    try {
      const postRes = await fetch(`${API_BASE_URL}/v1/posts/${id}`);
      const postData = await postRes.json();

      const filesRes = await fetch(`${API_BASE_URL}/v1/posts/${id}/files`);
      const filesData = await filesRes.json();

      setPost(postData);
      setImages(filesData);
    } catch (err) {
      setError('Failed to load post details');
      console.error(err);
    }
  };

  if (error) return <p className="text-danger text-center mt-4">{error}</p>;
  if (!post) return <p className="text-center mt-4">Loading post...</p>;

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body">
          <h4>{post.postedByName}</h4>
          <h6 className="text-muted">
            {new Date(post.createdAt).toLocaleString('en-GB')}
          </h6>
          <p>{post.description}</p>
        </div>

        {images.length > 0 ? (
          <img
            src={images[0].filePath}
            alt="Post visual"
            className="card-img-bottom"
            style={{ objectFit: 'cover', height: '300px' }}
          />
        ) : (
          <div
            className="bg-secondary d-flex align-items-center justify-content-center text-white"
            style={{ height: '300px' }}
          >
            No Image
          </div>
        )}

        {post.latitude && post.longitude && (
          <div className="p-3">
            {loadError && <p>Error loading map</p>}
            {!isLoaded && <p>Loading map...</p>}
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: post.latitude, lng: post.longitude }}
                zoom={13}
              >
                <Marker
                  position={{ lat: post.latitude, lng: post.longitude }}
                  title={post.location || 'Post Location'}
                />
              </GoogleMap>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDetailsPage;
