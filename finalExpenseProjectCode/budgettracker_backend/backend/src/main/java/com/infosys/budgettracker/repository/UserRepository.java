
package com.infosys.budgettracker.repository;

import com.infosys.budgettracker.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);

    // Return all users (including inactive) - bypass any global active constraint
    @Query("select u from UserEntity u")
    List<UserEntity> findAllIncludingInactive();

    // Return only banned/inactive users
    @Query("select u from UserEntity u where u.active = false")
    List<UserEntity> findBannedUsers();
}
