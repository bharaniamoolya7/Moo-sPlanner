package com.remtodo.repository;

import com.remtodo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndCompletedFalseOrderByCreatedAtDesc(Long userId);
}
