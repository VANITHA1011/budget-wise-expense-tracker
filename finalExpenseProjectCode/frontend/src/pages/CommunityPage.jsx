

import React, { useState, useEffect } from 'react';
// ⭐ CRITICAL IMPORTS ADDED: exportToPdf, exportToCsv, FileSearch
import { fetchPosts, exportToPdf, exportToCsv } from '../api'; 
import PostCard from '../components/PostCard.jsx';
import NewPostForm from '../components/NewPostForm.jsx';
import { Users, FileText, FileSearch } from 'lucide-react'; 

const CommunityPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // ⭐ NEW STATE: To manage the loading state of the export buttons
    const [exporting, setExporting] = useState(false); 

    const loadPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedPosts = await fetchPosts();
            setPosts(fetchedPosts);
        } catch (err) {
            setError('Failed to fetch community posts. Check your backend server and ensure all users are returned.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };
    
    // ⭐ CRITICAL FUNCTION: Handles fetching the file blob and triggering the browser download
    const handleExport = async (format) => {
        setExporting(true);
        setError(null);
        try {
            let fileBlob;
            let fileName;

            if (format === 'pdf') {
                // 1. Call the API function from api.js
                fileBlob = await exportToPdf();
                fileName = 'budgetwise_transactions.pdf';
            } else if (format === 'csv') {
                // 1. Call the API function from api.js
                fileBlob = await exportToCsv();
                fileName = 'budgetwise_transactions.csv';
            } else {
                return;
            }

            // 2. Create a URL for the binary blob
            const url = window.URL.createObjectURL(new Blob([fileBlob]));
            // 3. Create a temporary anchor tag and click it to start download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            
            // 4. Clean up
            link.remove();
            window.URL.revokeObjectURL(url); 
            
        } catch (err) {
            setError(`Failed to export data to ${format.toUpperCase()}. Please ensure you are logged in.`);
            console.error(`Export to ${format} failed:`, err);
        } finally {
            setExporting(false);
        }
    };


    return (
        <div className="container mx-auto p-8 max-w-4xl bg-white shadow-inner min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 border-b pb-1">
                <Users className="w-8 h-8 mr-3 inline text-teal-600"/> Community Hub
            </h1>
            <p className="text-gray-500 mb-8">Discuss financial strategies and manage your data exports.</p>
            
            {/* --- Data Export Section (NOW FUNCTIONAL) --- */}
            <div className="mb-10 p-6 bg-blue-50 shadow-lg rounded-xl border border-blue-300">
                <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                    <FileText className="w-5 h-5 mr-2"/> Secure Data Export
                </h2>
                <p className="text-gray-600 mb-4">Export your full transaction history for deep analysis or tax purposes.</p>
                
                {/* Export Status/Loading */}
                {exporting && (
                     <div className="flex items-center text-sm text-blue-600 mb-3">
                        <FileSearch className="w-4 h-4 mr-2 animate-pulse"/>
                        Preparing your file...
                    </div>
                )}
                {/* Export Error */}
                {error && <p className="text-sm text-red-600 mb-3 font-semibold">{error}</p>}

                {/* Export Buttons - NOW WIRED UP */}
                <div className="flex space-x-4">
                    <button 
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition shadow-lg disabled:bg-indigo-400"
                    >
                        Export to PDF
                    </button>
                    <button 
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        className="flex items-center space-x-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition shadow-lg disabled:bg-green-400"
                    >
                        Export to CSV
                    </button>
                </div>
            </div>

            {/* --- Community Forum Section --- */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-teal-600"/> Latest Discussions
            </h2>
            
            <NewPostForm onPostSuccess={handleNewPost} />
            
            {/* Post Feed */}
            <div className="space-y-8 mt-8">
                {loading && <p className="text-center py-10 text-xl text-teal-500 animate-pulse">Loading posts...</p>}
                {error && <div className="p-4 mt-6 bg-red-100 border border-red-400 text-red-700 rounded-lg font-bold">{error}</div>}
                
                {!loading && posts.length === 0 && !error ? (
                    <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 p-10 rounded-xl">
                        No posts yet. Start the conversation!
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} /> 
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
