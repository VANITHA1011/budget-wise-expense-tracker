
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Allow preflight requests through immediately
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                if (jwtUtil.validateToken(jwt)) {
                    username = jwtUtil.extractUsername(jwt);
                } else {
                    log.debug("JWT validation returned false for path {}", request.getRequestURI());
                }
            } catch (JwtException e) {
                log.debug("Invalid JWT: {}", e.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error validating JWT", e);
            }
        } else {
            // helpful debug log — frontend may not be sending Authorization header
            log.debug("No Authorization header for path {}", request.getRequestURI());
        }

        if (username != null && org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() == null) {
            // safest: attempt to extract role from token; default to USER if missing
            String roleFromToken = "USER";
            try {
                String tokenRole = jwtUtil.extractRole(jwt);
                if (tokenRole != null && !tokenRole.isBlank()) {
                    roleFromToken = tokenRole.toUpperCase();
                }
            } catch (Exception ex) {
                log.debug("Could not extract role from token: {}", ex.getMessage());
            }

            log.info("Authenticating user '{}' with role '{}' for path {}", username, roleFromToken, request.getRequestURI());

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleFromToken);
            List<SimpleGrantedAuthority> authorities = List.of(authority);

            UserEntity userEntity = userRepository.findByUsername(username).orElse(null);
            UserDetails userDetails;
            if (userEntity != null) {
                userDetails = new User(userEntity.getUsername(), userEntity.getPassword(), authorities);
            } else {
                userDetails = new User(username, "", authorities);
            }

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}

