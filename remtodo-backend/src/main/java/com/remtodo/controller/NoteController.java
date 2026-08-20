package com.remtodo.controller;

import com.remtodo.model.Note;
import com.remtodo.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    @Autowired
    private NoteRepository repository;

    @GetMapping("/user/{userId}")
    public List<Note> getUserNotes(@PathVariable Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping
    public Note createNote(@RequestBody Note item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note item) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(item.getTitle());
            existing.setContent(item.getContent());
            existing.setCategory(item.getCategory());
            existing.setPinned(item.isPinned());
            existing.setTags(item.getTags());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
