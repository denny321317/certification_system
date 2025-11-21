package com.project.backend.service;

import com.project.backend.model.Todo;
import com.project.backend.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    // 新增 Todo
    public Todo createTodo(Todo todo) {
        return todoRepository.save(todo);
    }

    public long getTodoCount() {
        return todoRepository.count();
    }

    public Todo updateCompleted(Long id, boolean completed) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("找不到 ID 為 " + id + " 的待辦事項"));
        todo.setCompleted(completed);
        return todoRepository.save(todo);
    }
    // 刪除 Todo
    public void deleteTodo(Long id) {
        if (todoRepository.existsById(id)) {
            todoRepository.deleteById(id);
        } else {
            throw new RuntimeException("找不到 ID 為 " + id + " 的待辦事項");
        }
    }

    // 查全部 Todo
    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }
}
