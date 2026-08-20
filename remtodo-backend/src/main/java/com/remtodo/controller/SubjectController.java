package com.remtodo.controller;

import com.remtodo.model.Subject;
import com.remtodo.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    @Autowired
    private SubjectRepository repository;

    @GetMapping("/user/{userId}")
    public List<Subject> getItems(@PathVariable Long userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }

    @PostMapping
    public Subject createItem(@RequestBody Subject item) { return repository.save(item); }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateItem(@PathVariable Long id, @RequestBody Subject item) {
        return repository.findById(id).map(existing -> {
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setTopics(item.getTopics());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (repository.existsById(id)) { repository.deleteById(id); return ResponseEntity.ok().build(); }
        return ResponseEntity.notFound().build();
    }
}
