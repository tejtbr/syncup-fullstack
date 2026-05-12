package com.syncup.presence.repository;

import com.syncup.presence.model.OfficeLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OfficeLocationRepository extends JpaRepository<OfficeLocation, UUID> {
}
