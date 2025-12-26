
package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.CommentEntity;
import com.infosys.budgettracker.model.PostEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.UserRepository;
import com.infosys.budgettracker.service.ForumService;
import com.infosys.budgettracker.service.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumService forumService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    // Get logged-in user (UNCHANGED)
    private UserEntity getAuthenticatedUser(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found: " + username));
    }

    // Get all posts (UNCHANGED)
    @GetMapping("/posts")
    public ResponseEntity<List<PostEntity>> getAllPosts() {
        List<PostEntity> posts = forumService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    // Create post (UNCHANGED)
    @PostMapping("/posts")
    public ResponseEntity<PostEntity> createPost(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {

        try {
            UserEntity user = getAuthenticatedUser(authHeader);
            String content = payload.get("content");

            if (content == null || content.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            PostEntity newPost = forumService.createPost(user, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(newPost);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get comments (UNCHANGED)
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentEntity>> getComments(@PathVariable Long postId) {
        List<CommentEntity> comments = forumService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    // Add comment (UNCHANGED)
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentEntity> createComment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long postId,
            @RequestBody Map<String, String> payload) {

        try {
            UserEntity user = getAuthenticatedUser(authHeader);
            String content = payload.get("content");

            if (content == null || content.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            CommentEntity newComment = forumService.createComment(user, postId, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(newComment);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ✅ FIXED Like Post (Now returns 200 OK for both LIKE and UNLIKE)
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<PostEntity> likePost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long postId) {

        try {
            UserEntity user = getAuthenticatedUser(authHeader);
            // Service returns the final, updated post
            PostEntity updatedPost = forumService.likePost(postId, user); 
            // Return the updated post with a 200 OK status
            return ResponseEntity.ok(updatedPost); 

        } catch (Exception e) {
            // Catch authentication or post not found errors
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}