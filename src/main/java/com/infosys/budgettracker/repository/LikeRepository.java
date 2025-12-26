
package com.infosys.budgettracker.repository;

import com.infosys.budgettracker.model.LikeEntity;
import com.infosys.budgettracker.model.PostEntity;
import com.infosys.budgettracker.model.UserEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    Optional<LikeEntity> findByUserAndPost(UserEntity user, PostEntity post);
}
