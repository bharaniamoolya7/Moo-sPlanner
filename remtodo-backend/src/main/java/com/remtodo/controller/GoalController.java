package com.remtodo.controller;

import com.remtodo.model.Goal;
import com.remtodo.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    @Autowired
    private GoalRepository repository;

    @GetMapping("/user/{userId}")
    public List<Goal> getItems(@PathVariable Long userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }

    @PostMapping
    public Goal createItem(@RequestBody Goal item) { return repository.save(item); }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateItem(@PathVariable Long id, @RequestBody Goal item) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(item.getTitle());
            existing.setDescription(item.getDescription());
            existing.setTarget(item.getTarget());
            existing.setCurrent(item.getCurrent());
            existing.setUnit(item.getUnit());
            existing.setDeadline(item.getDeadline());
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
