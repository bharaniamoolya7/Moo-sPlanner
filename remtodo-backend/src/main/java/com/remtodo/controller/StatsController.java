package com.remtodo.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @GetMapping("/user/{userId}")
    public Map<String, Object> getUserStats(@PathVariable Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("studyTime", "1h 45m");
        stats.put("codingTime", "2h 15m");
        stats.put("completedTasks", 0);
        stats.put("totalTasks", 0);
        return stats;
    }
}
