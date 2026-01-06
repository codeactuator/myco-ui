import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL, { GOOGLE_MAPS_API_KEY } from './config';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import UserLayout from './UserLayout';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const userId = sessionStorage.getItem("userId");
  const stompClientRef = useRef(null);
  const [expandedMedia, setExpandedMedia] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
      fetchComments(postId);
      connectWebSocket(postId);
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
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

  const fetchComments = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/comments/post/${id}`);
      const data = await res.json();
      const commentsArray = Array.isArray(data) ? data : data.comments || [];
      setComments(commentsArray);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const connectWebSocket = (id) => {
    if (stompClientRef.current) return;

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/posts/${id}/comments`, (message) => {
          const comment = JSON.parse(message.body);
          setComments((prev) => [...prev, comment]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message'], frame.body);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, commentedBy: userId, postId: postId }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleExpandImage = (e, imageUrl) => {
    e.stopPropagation();
    setExpandedMedia({ type: 'image', data: imageUrl });
  };

  const handleExpandMap = (latitude, longitude) => {
    setExpandedMedia({ type: 'map', data: { lat: parseFloat(latitude), lng: parseFloat(longitude) } });
  };

  const closeExpandedMedia = () => setExpandedMedia(null);

  if (error) return <p className="text-danger text-center mt-4">{error}</p>;
  if (!post) return <p className="text-center mt-4">Loading post...</p>;

  return (
    <UserLayout pageTitle="Notification Details">
      {expandedMedia && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1055 }} onClick={closeExpandedMedia}>
          <div className="modal-dialog modal-fullscreen p-4">
            <div className="modal-content bg-transparent border-0 h-100 d-flex justify-content-center align-items-center">
                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-4" onClick={closeExpandedMedia}></button>
                {expandedMedia.type === 'image' && (
                  <img src={expandedMedia.data} alt="Expanded" className="img-fluid" style={{ maxHeight: '90vh', maxWidth: '90vw' }} />
                )}
                {expandedMedia.type === 'map' && (
                  <div style={{ width: '90vw', height: '90vh' }} onClick={(e) => e.stopPropagation()}>
                     <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={expandedMedia.data}
                        zoom={15}
                      >
                        <Marker position={expandedMedia.data} />
                      </GoogleMap>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="card shadow">
          <div className="card-body">
            <h4>{post.postedByName}</h4>
            <h6 className="text-muted">
              {new Date(post.createdAt).toLocaleString('en-GB')}
            </h6>
            <p>{post.description}</p>
          </div>

          {images.length > 0 ? (
            <div className="position-relative">
              <img
                src={images[0].filePath.startsWith('http') ? images[0].filePath : `${API_BASE_URL}/v1/uploads/${images[0].filePath.split(/[/\\]/).pop()}`}
                alt="Post visual"
                className="card-img-bottom"
                style={{ objectFit: 'cover', height: '300px' }}
              />
              <button 
                  className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 opacity-75"
                  onClick={(e) => handleExpandImage(e, images[0].filePath.startsWith('http') ? images[0].filePath : `${API_BASE_URL}/v1/uploads/${images[0].filePath.split(/[/\\]/).pop()}`)}
              >
                  <i className="bi bi-arrows-fullscreen"></i>
              </button>
            </div>
          ) : (
            <div
              className="bg-secondary d-flex align-items-center justify-content-center text-white"
              style={{ height: '300px' }}
            >
              No Image
            </div>
          )}

          {post.latitude && post.longitude && (
            <div className="p-3 position-relative">
              <button 
                  className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 shadow-sm"
                  style={{ zIndex: 10 }}
                  onClick={() => handleExpandMap(post.latitude, post.longitude)}
              >
                  <i className="bi bi-arrows-fullscreen"></i>
              </button>
              {loadError && <p>Error loading map</p>}
              {!isLoaded && <p>Loading map...</p>}
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{ lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) }}
                  zoom={13}
                >
                  <Marker
                    position={{ lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) }}
                    title={post.location || 'Post Location'}
                  />
                </GoogleMap>
              )}
            </div>
          )}

          <div className="card-footer bg-white">
            <h6>Comments</h6>
            <ul className="list-unstyled">
              {comments.map((comment, index) => (
                <li key={index} className="mb-2">
                  <p className="mb-0"><strong>{comment.userName || "Anonymous"}</strong>: {comment.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <textarea
                className="form-control mb-2"
                rows="3"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="btn btn-primary w-100"
                onClick={handleAddComment}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NotificationDetailsPage;
