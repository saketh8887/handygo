package com.handyconnect.team;

import com.handyconnect.handyman.Skill;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "skill_id"})
})
public class TeamSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private ServiceTeam team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TeamSkill() {}

    public TeamSkill(ServiceTeam team, Skill skill) {
        this.team = team;
        this.skill = skill;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ServiceTeam getTeam() {
        return team;
    }

    public void setTeam(ServiceTeam team) {
        this.team = team;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
