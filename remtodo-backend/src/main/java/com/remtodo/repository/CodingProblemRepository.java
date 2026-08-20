package com.remtodo.repository;

import com.remtodo.model.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    List<CodingProblem> findByUserIdOrderByCreatedAtDesc(Long userId);
}
