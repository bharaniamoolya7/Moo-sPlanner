package com.remtodo.controller;

import com.remtodo.model.StudySession;
import com.remtodo.repository.StudySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-sessions")
public class StudySessionController {
    @Autowired
    private StudySessionRepository repository;

    @GetMapping("/user/{userId}")
    public List<StudySession> getItems(@PathVariable Long userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }

    @PostMapping
    public StudySession createItem(@RequestBody StudySession item) { return repository.save(item); }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (repository.existsById(id)) { repository.deleteById(id); return ResponseEntity.ok().build(); }
        return ResponseEntity.notFound().build();
    }
}
