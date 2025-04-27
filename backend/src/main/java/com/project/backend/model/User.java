package com.project.backend.model;


import jakarta.persistence.*;
import java.time.LocalDateTime;



@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;


    public enum Role {
        ADMIN,
        DEPARTMENT_MANAGER,
        AUDITOR,
        ORDINARY_USER,
        GUEST
    }
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private boolean online = false;

    @Column(nullable = false)
    private LocalDateTime lastTimeLogin;

    @Column(nullable = false)
    private String password = "password";


    public User(String name, Role role, String email){
        this.name = name;
        this.role = role;
        this.email = email;
    }


    /*
     * Getters and Setters below
     */

    public String getPassword(){
        return password;
    }

    public void setPassword(String password){
        this.password = password;
    }
    

    public long getId() {
        return id;
    }
    
    public void setId(long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public boolean isOnline() {
        return online;
    }
    
    public void setOnline(boolean online) {
        this.online = online;
    }
    
    public LocalDateTime getLastTimeLogin() {
        return lastTimeLogin;
    }
    
    public void setLastTimeLogin(LocalDateTime lastTimeLogin) {
        this.lastTimeLogin = lastTimeLogin;
    }




    
}