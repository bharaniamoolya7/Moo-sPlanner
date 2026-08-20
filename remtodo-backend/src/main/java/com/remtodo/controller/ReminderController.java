package com.remtodo.controller;

import com.remtodo.model.Reminder;
import com.remtodo.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {
    @Autowired
    private ReminderRepository repository;

    @GetMapping("/user/{userId}")
    public List<Reminder> getItems(@PathVariable Long userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }

    @GetMapping("/user/{userId}/upcoming")
    public List<Reminder> getUpcoming(@PathVariable Long userId) { return repository.findByUserIdAndCompletedFalseOrderByCreatedAtDesc(userId); }

    @PostMapping
    public Reminder createItem(@RequestBody Reminder item) { return repository.save(item); }

    @PutMapping("/{id}")
    public ResponseEntity<Reminder> updateItem(@PathVariable Long id, @RequestBody Reminder item) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(item.getTitle());
            existing.setDescription(item.getDescription());
            existing.setDueDate(item.getDueDate());
            existing.setDueTime(item.getDueTime());
            existing.setRepeatSchedule(item.getRepeatSchedule());
            existing.setCompleted(item.isCompleted());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (repository.existsById(id)) { repository.deleteById(id); return ResponseEntity.ok().build(); }
        return ResponseEntity.notFound().build();
    }
}
