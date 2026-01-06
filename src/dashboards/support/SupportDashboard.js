import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL, { GOOGLE_MAPS_API_KEY } from '../../config';
import { useAuth } from '../../AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '350px',
};

const SupportDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [postComments, setPostComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [postContacts, setPostContacts] = useState({}); // Map of postId -> contacts array
  const [creators, setCreators] = useState({}); // Map of postId -> creator details

  const { user } = useAuth();
  const userId = user?.id || sessionStorage.getItem("userId");

  const stompClientRef = useRef(null);
  const subscribedPostIdsRef = useRef(new Set());

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

  useEffect(() => {
    if (expandedPostId) {
      const post = posts.find(p => p.id === expandedPostId);
      if (post) {
        const postedForId = post.postedFor?.id || (typeof post.postedFor === 'string' ? post.postedFor : null);
        if (postedForId && !postContacts[expandedPostId]) {
          fetchContacts(postedForId, expandedPostId);
        }
        if (!postComments[expandedPostId]) {
          fetchPostComments(expandedPostId);
        }

        // Fetch creator details if mobile number is not already available
        const postedById = post.postedBy?.id || (typeof post.postedBy === 'string' ? post.postedBy : null);
        const hasMobile = post.postedBy?.mobileNumber;
        if (postedById && !creators[expandedPostId] && !hasMobile) {
          fetchCreator(postedById, expandedPostId);
        }
      }
    }
  }, [expandedPostId, posts]);

  const connectWebSocket = (postIds) => {
    if (stompClientRef.current) return;

    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
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
      // Fetch ALL alerts for support view
      const res = await fetch(`${API_BASE_URL}/v1/posts/alerts/all`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();

      const postsWithImages = await Promise.all(data.map(async (post) => {
        const imagesRes = await fetch(`${API_BASE_URL}/v1/posts/${post.id}/files`);
        const images = await imagesRes.json();
        return { ...post, images };
      }));

      setPosts(postsWithImages);

      const postIds = postsWithImages.map(post => post.id);
      connectWebSocket(postIds);
    } catch (error) {
      setError('Error fetching emergency requests');
      console.error(error);
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

  const fetchContacts = async (targetUserId, postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/contacts/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setPostContacts(prev => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchCreator = async (targetUserId, postId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/users/id/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setCreators(prev => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error("Error fetching creator:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    if (!userId) {
      alert("User ID missing. Please log in.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/v1/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, commentedBy: userId, postId: postId }),
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPostComments(postId);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleSection = (postId, section) => {
    setVisibleSections((prev) => {
      const current = prev[postId] || {};
      const updated = { ...current, [section]: !current[section] };

      if (section === 'comments' && !current[section] && !postComments[postId]) {
        fetchPostComments(postId);
      }
      return { ...prev, [postId]: updated };
    });
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Emergency Requests</h4>
      </div>
      {loading && <p>Loading requests...</p>}
      {error && <p className="text-danger">{error}</p>}
      
      {!expandedPostId ? (
        <div className="list-group">
          {posts.map((post) => (
            <button 
              key={post.id} 
              className="list-group-item list-group-item-action" 
              onClick={() => setExpandedPostId(post.id)}
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">
                  {post.postedByName || 'Unknown User'}
                  {post.postedFor?.name && <span className="ms-1 text-muted" style={{ fontSize: '0.9em' }}>for {post.postedFor.name}</span>}
                </h5>
                <small>{new Date(post.createdAt).toLocaleString()}</small>
              </div>
              <p className="mb-1">{post.description || 'No description provided.'}</p>
              <small className="text-danger">Click to view details</small>
            </button>
          ))}
          {!loading && posts.length === 0 && <p>No emergency requests found.</p>}
        </div>
      ) : (
        <div className="row">
          {posts.filter(p => p.id === expandedPostId).map((post) => (
            <div key={post.id} className="col-12">
              <button className="btn btn-secondary mb-3" onClick={() => setExpandedPostId(null)}>
                <i className="bi bi-arrow-left me-2"></i> Back to List
              </button>
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center bg-danger text-white">
                   <span>
                     <strong>{post.postedByName || 'Unknown User'}</strong>
                     {(post.postedBy?.mobileNumber || creators[post.id]?.mobileNumber) && (
                       <span className="ms-2 text-light small">({post.postedBy?.mobileNumber || creators[post.id]?.mobileNumber})</span>
                     )}
                     <span> - Emergency {post.postedFor?.name && `for ${post.postedFor.name}`}</span>
                   </span>
                   <small>{new Date(post.createdAt).toLocaleString()}</small>
                </div>
                <div className="card-body">
                   <p className="card-text">{post.description || 'No description provided.'}</p>
                   <div className="row">
                      <div className="col-md-6 mb-3">
                          {post.images && post.images.length > 0 ? (
                              <img src={post.images[0].filePath.startsWith('http') ? post.images[0].filePath : `${API_BASE_URL}/v1/uploads/${post.images[0].filePath.split(/[/\\]/).pop()}`} alt="Evidence" className="img-fluid rounded" style={{ objectFit: 'cover', height: '350px', width: '100%' }} />
                          ) : <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '350px'}}>No Image</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                          {post.latitude && post.longitude && isLoaded ? (
                              <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) }} zoom={14}>
                                  <Marker 
                                    position={{ lat: parseFloat(post.latitude), lng: parseFloat(post.longitude) }} 
                                    title={`Emergency Location - ${post.postedByName || 'Unknown User'}`}
                                  />
                              </GoogleMap>
                          ) : <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '350px'}}>No Location</div>}
                      </div>
                   </div>
                   
                   <div className="row mt-4">
                       {/* Emergency Contacts - Left Side */}
                       <div className="col-md-5 border-end">
                           <h5 className="mb-3">Emergency Contacts</h5>
                           {postContacts[post.id] && postContacts[post.id].length > 0 ? (
                               <div className="table-responsive">
                                   <table className="table table-sm table-bordered table-hover">
                                       <thead className="table-light">
                                           <tr>
                                               <th>Name</th>
                                               <th>Relation</th>
                                               <th>Number</th>
                                               <th>Action</th>
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {postContacts[post.id].map(contact => (
                                               <tr key={contact.id}>
                                                   <td>{contact.contactName}</td>
                                                   <td>{contact.relation}</td>
                                                   <td>{contact.contactNumber}</td>
                                                   <td>
                                                       <a href={`tel:${contact.contactNumber}`} className="btn btn-sm btn-success text-white text-decoration-none">
                                                           <i className="bi bi-telephone-fill me-1"></i>
                                                       </a>
                                                   </td>
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                           ) : (
                               <p className="text-muted fst-italic">No emergency contacts found for this user.</p>
                           )}
                       </div>

                       {/* Chat Box - Right Side */}
                       <div className="col-md-7">
                           <h5 className="mb-3">Live Chat</h5>
                           <div className="border rounded p-2 mb-2" style={{maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f8f9fa', minHeight: '200px'}}>
                                {postComments[post.id]?.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {postComments[post.id].map((c, i) => (
                                            <li key={i} className="mb-2">
                                                <strong>{c.userName || c.commentedBy}:</strong> {c.text}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-muted small mb-0">No messages yet.</p>}
                           </div>
                           <div className="input-group">
                                <input type="text" className="form-control" placeholder="Type a message..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))} />
                                <button className="btn btn-primary" onClick={() => handleAddComment(post.id)}>Send</button>
                           </div>
                       </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;