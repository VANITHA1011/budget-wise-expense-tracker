
// src/components/PostCard.jsx

import React, { useState, useEffect } from 'react';
import { fetchComments, createComment, likePost } from '../api';
import { MessageCircle, ThumbsUp } from 'lucide-react';

// --- HELPER FUNCTION FOR CONSISTENT AVATAR COLORS (UNCHANGED) ---
const getAvatarStyle = (userId) => {
    // Generate a consistent, professional color based on the userId
    const colors = ['bg-indigo-200', 'bg-pink-200', 'bg-green-200', 'bg-yellow-200', 'bg-red-200', 'bg-purple-200'];
    const textColors = ['text-indigo-800', 'text-pink-800', 'text-green-800', 'text-yellow-800', 'text-red-800', 'text-purple-800'];
    
    const index = userId % colors.length;
    return { 
        bgColor: colors[index], 
        textColor: textColors[index]
    };
};
// ------------------------------------------

const PostCard = ({ post }) => { 
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    
    // 💡 INITIAL STATE FIX: Assume not liked on first load. This is the only way 
    // without changing the backend's GET /posts DTO. The state will be corrected 
    // after the first click.
    const [isLiked, setIsLiked] = useState(false); 
    const [currentLikes, setCurrentLikes] = useState(post.likes);
    
    // Fetch the consistent style for this user
    const { bgColor, textColor } = getAvatarStyle(post.user.id); 

    const formatTimeAgo = (isoString) => {
        const date = new Date(isoString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "just now";
    };

    const handleFetchComments = async () => {
        if (!showComments) return; 

        setCommentsLoading(true);
        try {
            const fetchedComments = await fetchComments(post.id);
            setComments(fetchedComments);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        } finally {
            setCommentsLoading(false);
        }
    };

    useEffect(() => {
        if (showComments) {
            handleFetchComments();
        }
    }, [showComments, post.id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const addedComment = await createComment(post.id, newComment);
            setComments(prevComments => [...prevComments, addedComment]);
            setNewComment('');
        } catch (err) {
            console.error("Failed to submit comment:", err);
            alert("Failed to submit comment. Try logging in again.");
        }
    };

    // ✅ FIXED: Correctly handles the LIKE/UNLIKE toggle based on the server's 200 OK response
    const handleLike = async () => {
        const prevIsLiked = isLiked;
        const prevLikes = currentLikes;

        // 1. Optimistic Update
        setIsLiked(!prevIsLiked);
        setCurrentLikes(prevLikes + (prevIsLiked ? -1 : 1));

        try {
            // 2. Call API (Backend now returns 200 OK with the final post object)
            const updatedPost = await likePost(post.id);
            
            // 3. Synchronize state with definitive server data
            setCurrentLikes(updatedPost.likes); 
            
            // Re-check status based on what the server confirmed
            if (updatedPost.likes > prevLikes) {
                setIsLiked(true); // Server confirmed LIKE
            } else if (updatedPost.likes < prevLikes) {
                setIsLiked(false); // Server confirmed UNLIKE
            } 
            // If updatedPost.likes == prevLikes (i.e. server rejected the action/count didn't change), 
            // the state will be reverted in the catch block if needed, or remain stable here.

        } catch (err) {
            // 4. Revert state on actual failure (Network/Auth error)
            console.error("Failed to submit like/unlike:", err);
            setCurrentLikes(prevLikes);
            setIsLiked(prevIsLiked);
            alert("Action failed. Please ensure you are logged in.");
        }
    };

    return (
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-gray-100 transition hover:shadow-2xl">
            {/* Post Header */}
            <div className="flex items-center mb-4">
                {/* --- AVATAR --- */}
                <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center ${textColor} font-extrabold text-xl mr-3 shadow-md`}>
                    {post.user.username[0].toUpperCase()}
                </div>
                <div>
                    <span className="font-bold text-lg text-gray-900">{post.user.username}</span>
                    <span className="block text-sm text-gray-500">{formatTimeAgo(post.postedDate)}</span>
                </div>
            </div>

            {/* Post Content */}
            <p className="text-gray-800 text-base leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center space-x-6 border-t border-gray-100 pt-3">
                <button 
                    onClick={handleLike}
                    // 💡 CONDITIONAL STYLES: Highlight when liked
                    className={`flex items-center font-semibold transition duration-150 transform hover:scale-105 ${
                        isLiked ? 'text-blue-600 hover:text-blue-700' : 'text-gray-500 hover:text-blue-600'
                    }`}
                >
                    {/* 💡 CONDITIONAL ICON: Fill the icon when liked */}
                    <ThumbsUp size={18} className={`mr-1 ${isLiked ? 'fill-blue-600' : ''}`}/>
                    <span className="ml-1">{currentLikes} {currentLikes === 1 ? 'Like' : 'Likes'}</span>
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center text-gray-500 font-semibold hover:text-gray-700 transition duration-150"
                >
                    <MessageCircle size={18} className="mr-1"/>
                    <span className="ml-1">{comments.length > 0 ? comments.length : '0'} Comments</span>
                </button>
            </div>

            {/* Comment Section */}
            {showComments && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                    <h5 className="font-bold mb-4 text-lg text-gray-800">Discussion</h5>
                    
                    {/* New Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-4 flex space-x-2">
                        <input
                            type="text"
                            className="flex-grow p-3 border border-gray-300 rounded-xl text-base focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add your comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                        />
                        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md">
                            Reply
                        </button>
                    </form>
                    
                    {commentsLoading && <p className="text-sm text-center text-gray-500">Loading comments...</p>}

                    {/* Existing Comments List */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {comments.length === 0 && !commentsLoading && <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first!</p>}
                        
                        {comments.map(comment => (
                            <div key={comment.id} className="text-sm p-3 bg-gray-50 border-l-4 border-blue-100 rounded-lg shadow-sm">
                                <div className="flex items-center mb-1">
                                    <span className="font-bold text-sm text-gray-900">{comment.user.username}</span>
                                    <span className="text-xs text-gray-500 ml-3">· {formatTimeAgo(comment.postedDate)}</span>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
