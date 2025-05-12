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

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private boolean online = false;

    @Column(nullable = false)
    private LocalDateTime lastTimeLogin;

    @Column(nullable = false)
    private String password = "password";

    @Column(nullable = false)
    private String department = "default department";

    // default constructor for JPA
    public User(){}


    public User(String name, Role role, String email, String department){
        this.name = name;
        this.role = role;
        this.email = email;
        this.lastTimeLogin = LocalDateTime.now();
        this.department = department;
        this.password = "password"; // default Password
    }


    /*
     * Getters and Setters below
     */

    public String getDepartment(){
        return department;
    }

    public void setDepartment(String department){
        this.department = department;
    }

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