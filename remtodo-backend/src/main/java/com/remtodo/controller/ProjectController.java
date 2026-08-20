package com.remtodo.controller;

import com.remtodo.model.Project;
import com.remtodo.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    @Autowired
    private ProjectRepository repository;

    @GetMapping("/user/{userId}")
    public List<Project> getItems(@PathVariable Long userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }

    @PostMapping
    public Project createItem(@RequestBody Project item) { return repository.save(item); }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateItem(@PathVariable Long id, @RequestBody Project item) {
        return repository.findById(id).map(existing -> {
            existing.setName(item.getName());
            existing.setDescription(item.getDescription());
            existing.setTechnologies(item.getTechnologies());
            existing.setDeadline(item.getDeadline());
            existing.setStatus(item.getStatus());
            existing.setProgress(item.getProgress());
            existing.setNotes(item.getNotes());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (repository.existsById(id)) { repository.deleteById(id); return ResponseEntity.ok().build(); }
        return ResponseEntity.notFound().build();
    }
}
