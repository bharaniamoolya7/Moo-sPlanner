package com.remtodo.controller;

import com.remtodo.model.CodingProblem;
import com.remtodo.repository.CodingProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding-problems")
public class CodingProblemController {
    @Autowired
    private CodingProblemRepository repository;

    @GetMapping("/user/{userId}")
    public List<CodingProblem> getItems(@PathVariable Long userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }

    @PostMapping
    public CodingProblem createItem(@RequestBody CodingProblem item) { return repository.save(item); }

    @PutMapping("/{id}")
    public ResponseEntity<CodingProblem> updateItem(@PathVariable Long id, @RequestBody CodingProblem item) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(item.getTitle());
            existing.setDescription(item.getDescription());
            existing.setDifficulty(item.getDifficulty());
            existing.setTopic(item.getTopic());
            existing.setLanguage(item.getLanguage());
            existing.setCode(item.getCode());
            existing.setNotes(item.getNotes());
            existing.setSolved(item.isSolved());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (repository.existsById(id)) { repository.deleteById(id); return ResponseEntity.ok().build(); }
        return ResponseEntity.notFound().build();
    }
}
