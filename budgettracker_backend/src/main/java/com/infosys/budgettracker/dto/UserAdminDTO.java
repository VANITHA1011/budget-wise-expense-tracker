
package com.infosys.budgettracker.dto;

public class UserAdminDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean active;
    // explicit flag frontend should use for banned logic
    private boolean banned;

    public UserAdminDTO(Long id, String username, String email, String role, boolean active, boolean banned) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.active = active;
        this.banned = banned;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isBanned() { return banned; }
    public void setBanned(boolean banned) { this.banned = banned; }
}
