package com.project.backend.service;

import org.springframework.stereotype.Service;

import com.project.backend.repository.UserRepository;
import com.project.backend.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService{
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
            return new org.springframework.security.core.userdetails.User(
                user.getEmail(), 
                user.getPassword(), 
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getName()))
            );
    }

}
