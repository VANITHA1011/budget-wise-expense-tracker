
import React, { useState } from 'react';
import { createPost } from '../api'; 

const NewPostForm = ({ onPostSuccess }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newPost = await createPost(content);
            
            setContent('');
            onPostSuccess(newPost);

        } catch (err) {
            setError('Failed to create post. Please ensure you are logged in.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-5 bg-white shadow-2xl rounded-xl border border-gray-200 mb-8">
            <h4 className="font-bold mb-3 text-lg text-gray-800">What's on your mind?</h4>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 resize-none transition duration-200"
                    rows="4"
                    placeholder="Share your budget breakthrough, ask for advice, or post a valuable resource..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <div className="flex justify-end items-center mt-3">
                    {error && <p className="text-sm text-red-500 mr-auto font-medium">{error}</p>}
                    <button
                        type="submit"
                        className={`px-6 py-2 text-white font-bold rounded-xl transition duration-300 shadow-md ${
                            isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Publishing...' : 'Post to Community'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPostForm;
