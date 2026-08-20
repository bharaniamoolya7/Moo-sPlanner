package com.remtodo.repository;

import com.remtodo.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Reminder> findByUserIdAndCompletedFalseOrderByCreatedAtDesc(Long userId);
}
