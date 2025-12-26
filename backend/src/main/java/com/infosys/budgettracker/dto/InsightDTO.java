
package com.infosys.budgettracker.dto;

import java.util.List;
import java.util.Collections; // Added for robustness

// Data Transfer Object for AI insights
public class InsightDTO {
    private List<String> savingTips;
    private List<String> savingAlerts;

    // Constructors
    public InsightDTO() {
        this.savingTips = Collections.emptyList();
        this.savingAlerts = Collections.emptyList();
    }

    public InsightDTO(List<String> savingTips, List<String> savingAlerts) {
        this.savingTips = savingTips;
        this.savingAlerts = savingAlerts;
    }

    // Getters (Required for JSON serialization)
    public List<String> getSavingTips() {
        return savingTips;
    }

    public List<String> getSavingAlerts() {
        return savingAlerts;
    }

    // Setters (Optional but good practice)
    public void setSavingTips(List<String> savingTips) {
        this.savingTips = savingTips;
    }

    public void setSavingAlerts(List<String> savingAlerts) {
        this.savingAlerts = savingAlerts;
    }
}