package com.pos.backend.service;

import com.pos.backend.entity.Brand;
import com.pos.backend.exception.ResourceNotFoundException;
import com.pos.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository repo;

    public List<Map<String,Object>> getAll() {
        return repo.findByActiveTrueOrderByNameAsc().stream().map(this::toMap).toList();
    }

    public Map<String,Object> getById(Long id) {
        return toMap(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand","id",id)));
    }

    @Transactional
    public Map<String,Object> create(Map<String,Object> req) {
        String name = (String) req.get("name");
        if (repo.existsByName(name)) throw new RuntimeException("Brand '" + name + "' already exists");
        Brand b = Brand.builder()
                .name(name)
                .description((String) req.get("description"))
                .build();
        return toMap(repo.save(b));
    }

    @Transactional
    public Map<String,Object> update(Long id, Map<String,Object> req) {
        Brand b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand","id",id));
        b.setName((String) req.get("name"));
        b.setDescription((String) req.get("description"));
        return toMap(repo.save(b));
    }

    @Transactional
    public void delete(Long id) {
        Brand b = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Brand","id",id));
        b.setActive(false);
        repo.save(b);
    }

    private Map<String,Object> toMap(Brand b) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", b.getId());
        m.put("name", b.getName());
        m.put("description", b.getDescription());
        m.put("active", b.getActive());
        m.put("createdAt", b.getCreatedAt());
        return m;
    }
}
