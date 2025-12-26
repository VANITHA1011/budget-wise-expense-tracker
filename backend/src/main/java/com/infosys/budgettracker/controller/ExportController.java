
package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.UserRepository;
import com.infosys.budgettracker.service.ExportService;
import com.infosys.budgettracker.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    // Helper method to get authenticated user
    private UserEntity getAuthenticatedUser(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found: " + username));
    }

    @GetMapping("/csv")
    public ResponseEntity<InputStreamResource> exportCsv(@RequestHeader("Authorization") String authHeader) {
        try {
            UserEntity user = getAuthenticatedUser(authHeader);
            // UPDATED: Call the new comprehensive CSV method
            ByteArrayInputStream bis = exportService.exportFinancialDataToCsv(user); 

            HttpHeaders headers = new HttpHeaders();
            // UPDATED: Change filename to reflect comprehensive data
            headers.add("Content-Disposition", "attachment; filename=financial_data_report.csv");
            
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType("application/csv"))
                    .body(new InputStreamResource(bis));

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/pdf")
    public ResponseEntity<InputStreamResource> exportPdf(@RequestHeader("Authorization") String authHeader) {
        try {
            UserEntity user = getAuthenticatedUser(authHeader);
            ByteArrayInputStream bis = exportService.exportTransactionsToPdf(user);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=comprehensive_report.pdf");
            
            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(bis));

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}