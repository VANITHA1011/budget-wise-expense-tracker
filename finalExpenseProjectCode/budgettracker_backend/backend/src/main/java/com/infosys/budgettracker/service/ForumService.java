
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.CommentEntity;
import com.infosys.budgettracker.model.LikeEntity;
import com.infosys.budgettracker.model.PostEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.CommentRepository;
import com.infosys.budgettracker.repository.LikeRepository;
import com.infosys.budgettracker.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ForumService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private LikeRepository likeRepository;

    // ⭐ NEW HELPER METHOD: Required for the Controller to fetch the post after UNLIKE (UNCHANGED)
    public PostEntity getPostById(Long postId) throws Exception {
        return postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));
    }

    // Get all posts (UNCHANGED)
    public List<PostEntity> getAllPosts() {
        return postRepository.findAllByOrderByPostedDateDesc();
    }

    // Get comments of a post (UNCHANGED)
    public List<CommentEntity> getCommentsByPost(Long postId) {
        Optional<PostEntity> post = postRepository.findById(postId);
        if (post.isEmpty()) {
            return Collections.emptyList();
        }
        return commentRepository.findByPostOrderByPostedDateAsc(post.get());
    }

    // Create Post (UNCHANGED)
    public PostEntity createPost(UserEntity user, String content) {
        PostEntity newPost = new PostEntity();
        newPost.setUser(user);
        newPost.setContent(content);
        return postRepository.save(newPost);
    }

    // Create Comment (UNCHANGED)
    public CommentEntity createComment(UserEntity user, Long postId, String content) throws Exception {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));

        CommentEntity newComment = new CommentEntity();
        newComment.setUser(user);
        newComment.setPost(post);
        newComment.setContent(content);
        return commentRepository.save(newComment);
    }

    // ✅ FULLY CORRECTED Like Logic: Implements LIKE/UNLIKE Toggle
    // Now always returns the updated PostEntity for both LIKE and UNLIKE.
    @Transactional
    public PostEntity likePost(Long postId, UserEntity user) throws Exception {
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));

        // Check if user already liked
        Optional<LikeEntity> existing = likeRepository.findByUserAndPost(user, post);
        
        if (existing.isPresent()) {
            // --- UNLIKE ACTION ---
            likeRepository.delete(existing.get());      // 1. Delete the like entry
            post.setLikes(post.getLikes() - 1);         // 2. Decrement count
            // ❌ REMOVED: throw new Exception("Post unliked");
        } else {
            // --- LIKE ACTION ---
            LikeEntity like = new LikeEntity();
            like.setUser(user);
            like.setPost(post);
            likeRepository.save(like);

            post.setLikes(post.getLikes() + 1); // Increase like count
        }

        // Return the final updated post object, which is sent back to the frontend with 200 OK.
        return postRepository.save(post);
    }
}