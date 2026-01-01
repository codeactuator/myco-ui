import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL, { GOOGLE_MAPS_API_KEY } from './config';
import UserLayout from './UserLayout';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '200px',
};

const NotificationPage = () => {
  const [posts, setPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const [expandedMedia, setExpandedMedia] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");

  const stompClientRef = useRef(null);
  const subscribedPostIdsRef = useRef(new Set());

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchPosts();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const connectWebSocket = (postIds) => {
    if (stompClientRef.current) return;

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");

        postIds.forEach(postId => {
          if (!subscribedPostIdsRef.current.has(postId)) {
            stompClient.subscribe(`/topic/posts/${postId}/comments`, (message) => {
              const comment = JSON.parse(message.body);
              setPostComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), comment]
              }));
            });
            subscribedPostIdsRef.current.add(postId);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message'], frame.body);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/posts/alerts/user/${userId}`);
      const data = await res.json();
	  console.log(data);

      const postsWithImages = await Promise.all(data.map(async (post) => {
        const imagesRes = await fetch(`${API_BASE_URL}/v1/posts/${post.id}/files`);
        const images = await imagesRes.json();
        return { ...post, images };
      }));

      setPosts(postsWithImages);

      const postIds = postsWithImages.map(post => post.id);
      connectWebSocket(postIds);
    } catch (error) {
      setError('Error fetching posts or images');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostComments = async (postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/comments/post/${postId}`);
      const data = await res.json();
      const commentsArray = Array.isArray(data) ? data : data.comments || [];
      setPostComments((prev) => ({ ...prev, [postId]: commentsArray }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, commentedBy: userId, postId: postId }),
      });
      if (res.ok) {
        setNewComment('');
        fetchPostComments(postId);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleSection = (postId, section) => {
    setVisibleSections((prev) => {
      const current = prev[postId] || {};
      const updated = {
        ...current,
        [section]: !current[section],
      };

      if (section === 'comments' && !current[section] && !postComments[postId]) {
        fetchPostComments(postId);
      }

      return { ...prev, [postId]: updated };
    });
  };

  const handleExpandImage = (e, imageUrl) => {
    e.stopPropagation();
    setExpandedMedia({ type: 'image', data: imageUrl });
  };

  const handleExpandMap = (latitude, longitude) => {
    setExpandedMedia({ type: 'map', data: { lat: parseFloat(latitude), lng: parseFloat(longitude) } });
  };

  const closeExpandedMedia = () => setExpandedMedia(null);

  return (
    <UserLayout pageTitle="Notifications">
      {loading && <p className="text-center mt-4">Loading posts...</p>}
      {error && <p className="text-danger text-center mt-4">{error}</p>}

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

      <div className="container py-4">
        <div className="row g-4">
          {posts.map((post) => (
            <div key={post.id} className="col-12 col-md-6 mb-4">
              <div className="card w-100 shadow-sm">
                <div className="card-body border-bottom">
                  <h4 className="card-title mb-1">{post.postedByName}</h4>
                  <h6 className="card-title mb-1 text-muted">
                    {new Date(post.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </h6>
                  <p className="card-text text-muted mb-2">{post.description}</p>

                </div>

                <div className="position-relative">
                  {post.images && post.images.length > 0 ? (
                    <>
                      <img
                        src={`${API_BASE_URL}/v1/uploads/${post.images[0].filePath.split(/[/\\]/).pop()}`}
                        alt="Post"
                        className="card-img-top"
                        style={{ objectFit: 'cover', height: '200px' }}
                        loading="lazy"
                        onClick={() => navigate(`/notification-details/${post.id}`)}
                      />
                      <button 
                          className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 opacity-75"
                          onClick={(e) => handleExpandImage(e, `${API_BASE_URL}/v1/uploads/${post.images[0].filePath.split(/[/\\]/).pop()}`)}
                      >
                          <i className="bi bi-arrows-fullscreen"></i>
                      </button>
                    </>
                  ) : (
                    <div className="bg-secondary d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                      <span className="text-white">No Image</span>
                    </div>
                  )}

                  <div className="position-absolute bottom-0 start-0 mb-3 ms-3">
                    <button
                      className="btn btn-light me-2"
                      onClick={() => toggleSection(post.id, 'comments')}
                    >
                      <i className="bi bi-chat-left-dots"></i>
                    </button>
                    <button
                      className="btn btn-light"
                      onClick={() => toggleSection(post.id, 'map')}
                    >
                      <i className="bi bi-map"></i>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {visibleSections[post.id]?.map && post.latitude && post.longitude && (
                    <div style={{ height: '200px' }} className="mb-3 position-relative">
                      <button 
                          className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 shadow-sm"
                          style={{ zIndex: 10 }}
                          onClick={() => handleExpandMap(post.latitude, post.longitude)}
                      >
                          <i className="bi bi-arrows-fullscreen"></i>
                      </button>
                      {!isLoaded ? (
                        <p>Loading map...</p>
                      ) : loadError ? (
                        <p>Error loading map</p>
                      ) : (
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={{ lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) }}
                          zoom={13}
                        >
                          <Marker
                            position={{ lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) }}
                            title={post.location || 'Location'}
                          />
                        </GoogleMap>
                      )}
                    </div>
                  )}

                  {visibleSections[post.id]?.comments && (
                    <div className="mb-3">
                      <h6>Comments</h6>
                      <ul className="list-unstyled">
                        {Array.isArray(postComments[post.id]) &&
                          postComments[post.id].map((comment, index) => (
                            <li key={index} className="mb-2">
                              <p><strong>{comment.userName || "Anonymous"}</strong>: {comment.text}</p>
                            </li>
                          ))}
                      </ul>
                      <div>
                        <textarea
                          className="form-control mb-2"
                          rows="3"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleAddComment(post.id)}
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default NotificationPage;
