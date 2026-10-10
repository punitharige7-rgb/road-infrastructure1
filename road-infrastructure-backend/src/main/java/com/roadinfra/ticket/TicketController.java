package com.roadinfra.ticket;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketRepository repository;
    public TicketController(TicketRepository repository) { this.repository = repository; }

    @GetMapping public Iterable<Ticket> all() { return repository.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket create(@RequestBody Ticket ticket) {
        if (blank(ticket.getTitle()) || blank(ticket.getDescription()) || blank(ticket.getCategory()) ||
            blank(ticket.getLocation()) || blank(ticket.getReporterName()) || blank(ticket.getReporterEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please fill all required fields.");
        }
        ticket.setId(null);
        ticket.setStatus("OPEN");
        if (blank(ticket.getPriority())) ticket.setPriority("MEDIUM");
        return repository.save(ticket);
    }

    @PatchMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Ticket ticket = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        String status = body.get("status");
        if (!java.util.Set.of("OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        ticket.setStatus(status);
        if (body.containsKey("assignedTo")) ticket.setAssignedTo(body.get("assignedTo"));
        return repository.save(ticket);
    }

    @PatchMapping("/{id}/priority")
    public Ticket updatePriority(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Ticket ticket = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        String priority = body.get("priority");
        if (!java.util.Set.of("LOW", "MEDIUM", "HIGH", "URGENT").contains(priority)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority");
        ticket.setPriority(priority);
        return repository.save(ticket);
    }
    private boolean blank(String value) { return value == null || value.trim().isEmpty(); }
}
