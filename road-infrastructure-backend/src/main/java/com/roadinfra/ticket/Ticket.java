package com.roadinfra.ticket;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(nullable = false, length = 3000) private String description;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String location;
    @Column(nullable = false) private String reporterName;
    @Column(nullable = false) private String reporterEmail;
    private String reporterPhone;
    @Column(nullable = false) private String priority = "MEDIUM";
    @Column(nullable = false) private String status = "OPEN";
    private String assignedTo;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate public void preUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getTitle(){return title;} public void setTitle(String v){this.title=v;}
    public String getDescription(){return description;} public void setDescription(String v){this.description=v;}
    public String getCategory(){return category;} public void setCategory(String v){this.category=v;}
    public String getLocation(){return location;} public void setLocation(String v){this.location=v;}
    public String getReporterName(){return reporterName;} public void setReporterName(String v){this.reporterName=v;}
    public String getReporterEmail(){return reporterEmail;} public void setReporterEmail(String v){this.reporterEmail=v;}
    public String getReporterPhone(){return reporterPhone;} public void setReporterPhone(String v){this.reporterPhone=v;}
    public String getPriority(){return priority;} public void setPriority(String v){this.priority=v;}
    public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
    public String getAssignedTo(){return assignedTo;} public void setAssignedTo(String v){this.assignedTo=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){this.createdAt=v;}
    public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){this.updatedAt=v;}
}
