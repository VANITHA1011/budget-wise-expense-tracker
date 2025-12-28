
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.BudgetEntity;
import com.infosys.budgettracker.model.SavingsGoalEntity;
import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.TransactionRepository;
import com.infosys.budgettracker.repository.BudgetRepository;
import com.infosys.budgettracker.repository.SavingsGoalRepository;

// Explicit imports for OpenPDF/lowagie
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Element;
import com.lowagie.text.Table;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.awt.Color; 

@Service
public class ExportService {

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    /**
     * Creates a single CSV file containing three sections: Transactions, Budgets, and Savings Goals.
     */
    public ByteArrayInputStream exportFinancialDataToCsv(UserEntity user) {
        
        // 1. Fetch all data
        List<TransactionEntity> transactions = transactionRepository.findByUser(user);
        List<BudgetEntity> budgets = budgetRepository.findByUser(user);
        List<SavingsGoalEntity> goals = savingsGoalRepository.findByUser(user);
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(out)) {

            // ==========================================================
            // SECTION 1: TRANSACTION HISTORY
            // ==========================================================
            writer.println("--- TRANSACTION_HISTORY ---");
            String[] TXN_HEADERS = { "ID", "Date", "Description", "Amount", "Category", "Type" };
            writer.println(String.join(",", TXN_HEADERS));

            if (transactions.isEmpty()) {
                writer.println("No transactions found.");
            } else {
                for (TransactionEntity transaction : transactions) {
                    String line = String.format("%d,%s,\"%s\",%.2f,%s,%s",
                        transaction.getId(),
                        transaction.getDate().toString(),
                        // Clean up description for CSV safety
                        transaction.getDescription().replace(",", ";"), 
                        transaction.getAmount(),
                        transaction.getCategory(),
                        transaction.getType().toString());
                    writer.println(line);
                }
            }
            writer.println(); // Add empty line separation


            // ==========================================================
            // SECTION 2: BUDGET SUMMARY
            // ==========================================================
            writer.println("--- BUDGET_SUMMARY ---");
            String[] BUDGET_HEADERS = { "Category", "BudgetAmount", "SpentAmount", "Remaining", "Progress(%)" };
            writer.println(String.join(",", BUDGET_HEADERS));

            if (budgets.isEmpty()) {
                writer.println("No budgets currently set.");
            } else {
                for (BudgetEntity budget : budgets) {
                    double remaining = budget.getBudgetAmount() - budget.getSpentAmount();
                    double percent = budget.getBudgetAmount() == 0 ? 0 : (budget.getSpentAmount() / budget.getBudgetAmount()) * 100;

                    String line = String.format("%s,%.2f,%.2f,%.2f,%.0f",
                        budget.getCategory(),
                        budget.getBudgetAmount(),
                        budget.getSpentAmount(),
                        remaining,
                        Math.min(percent, 100)); // Cap progress at 100% for report clarity
                    writer.println(line);
                }
            }
            writer.println(); // Add empty line separation


            // ==========================================================
            // SECTION 3: SAVINGS GOALS
            // ==========================================================
            writer.println("--- SAVINGS_GOALS ---");
            String[] GOAL_HEADERS = { "GoalName", "TargetAmount", "SavedAmount", "TargetDate", "Progress(%)" };
            writer.println(String.join(",", GOAL_HEADERS));

            if (goals.isEmpty()) {
                writer.println("No savings goals currently set.");
            } else {
                for (SavingsGoalEntity goal : goals) {
                    double percent = goal.getTargetAmount() == 0 ? 0 : (goal.getSavedAmount() / goal.getTargetAmount()) * 100;
                    
                    String line = String.format("\"%s\",%.2f,%.2f,%s,%.0f",
                        goal.getGoalName(),
                        goal.getTargetAmount(),
                        goal.getSavedAmount(),
                        goal.getTargetDate() != null ? goal.getTargetDate().toString() : "N/A",
                        Math.min(percent, 100));
                    writer.println(line);
                }
            }


            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate comprehensive CSV file: " + e.getMessage());
        }
    }


    /**
     * Creates a comprehensive PDF file with Budget, Savings, and Transactions. (UNCHANGED)
     */
    public ByteArrayInputStream exportTransactionsToPdf(UserEntity user) {
        List<TransactionEntity> transactions = transactionRepository.findByUser(user);
        List<BudgetEntity> budgets = budgetRepository.findByUser(user);
        List<SavingsGoalEntity> goals = savingsGoalRepository.findByUser(user);

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(31, 41, 55)); 
            Paragraph title = new Paragraph("Comprehensive Financial Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            addSectionTitle(document, "Current Budget Summary", new Color(52, 152, 219), 16);
            addBudgetSummary(document, budgets);

            addSectionTitle(document, "Savings Goals Overview", new Color(46, 204, 113), 16);
            addSavingsGoals(document, goals);
            
            addSectionTitle(document, "Transaction History", new Color(31, 41, 55), 16);
            addTransactionHistory(document, transactions); 
            
            document.close();

            return new ByteArrayInputStream(out.toByteArray());
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF file: " + e.getMessage());
        }
    }

    // --- Helper Methods (UNCHANGED) ---

    private void addSectionTitle(Document document, String titleText, Color color, int size) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, size, color);
        Paragraph title = new Paragraph(titleText, font);
        title.setAlignment(Element.ALIGN_LEFT);
        title.setSpacingBefore(30); 
        title.setSpacingAfter(10);
        document.add(title);
    }

    private void addBudgetSummary(Document document, List<BudgetEntity> budgets) throws DocumentException {
        if (budgets.isEmpty()) {
            document.add(new Paragraph("No budgets currently set.", FontFactory.getFont(FontFactory.HELVETICA)));
            return;
        }
        
        Table table = new Table(5);
        table.setWidth(100);
        table.setPadding(3);

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        table.addCell(new Phrase("Category", headerFont));
        table.addCell(new Phrase("Budget Amt", headerFont));
        table.addCell(new Phrase("Spent Amt", headerFont));
        table.addCell(new Phrase("Remaining", headerFont));
        table.addCell(new Phrase("Progress (%)", headerFont));

        for (BudgetEntity budget : budgets) {
            double remaining = budget.getBudgetAmount() - budget.getSpentAmount();
            double percent = budget.getBudgetAmount() == 0 ? 0 : (budget.getSpentAmount() / budget.getBudgetAmount()) * 100;
            
            table.addCell(budget.getCategory());
            table.addCell(String.format("$%.2f", budget.getBudgetAmount()));
            table.addCell(String.format("$%.2f", budget.getSpentAmount()));
            table.addCell(String.format("$%.2f", Math.max(remaining, 0))); 
            table.addCell(new Phrase(String.format("%.0f%%", Math.min(percent, 100)), getBudgetProgressFont(percent)));
        }
        document.add(table);
    }

    private void addSavingsGoals(Document document, List<SavingsGoalEntity> goals) throws DocumentException {
        if (goals.isEmpty()) {
            document.add(new Paragraph("No savings goals currently set.", FontFactory.getFont(FontFactory.HELVETICA)));
            return;
        }

        Table table = new Table(4);
        table.setWidth(100);
        table.setPadding(3);
        
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        table.addCell(new Phrase("Goal Name", headerFont));
        table.addCell(new Phrase("Target Amount", headerFont));
        table.addCell(new Phrase("Saved Amount", headerFont));
        table.addCell(new Phrase("Target Date", headerFont));

        for (SavingsGoalEntity goal : goals) {
            table.addCell(goal.getGoalName());
            table.addCell(String.format("$%.2f", goal.getTargetAmount()));
            table.addCell(String.format("$%.2f", goal.getSavedAmount()));
            table.addCell(goal.getTargetDate() != null ? goal.getTargetDate().toString() : "N/A");
        }
        document.add(table);
    }
    
    private void addTransactionHistory(Document document, List<TransactionEntity> transactions) throws DocumentException {
        if (transactions.isEmpty()) {
            document.add(new Paragraph("No transactions found.", FontFactory.getFont(FontFactory.HELVETICA)));
            return;
        }
        
        Table table = new Table(5); 
        table.setWidth(100);
        table.setPadding(3);
        
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        table.addCell(new Phrase("Date", headerFont));
        table.addCell(new Phrase("Description", headerFont));
        table.addCell(new Phrase("Amount", headerFont));
        table.addCell(new Phrase("Category", headerFont));
        table.addCell(new Phrase("Type", headerFont));

        for (TransactionEntity transaction : transactions) {
            table.addCell(transaction.getDate().toString());
            table.addCell(transaction.getDescription());
            table.addCell(String.format("$%.2f", transaction.getAmount()));
            table.addCell(transaction.getCategory());
            table.addCell(transaction.getType().toString());
        }

        document.add(table); 
    }

    private Font getBudgetProgressFont(double percentage) {
        if (percentage > 100) {
            return FontFactory.getFont(FontFactory.HELVETICA, 10, Font.BOLD, Color.RED);
        } else if (percentage >= 90) {
            return FontFactory.getFont(FontFactory.HELVETICA, 10, Font.BOLD, Color.ORANGE);
        } else {
            return FontFactory.getFont(FontFactory.HELVETICA, 10, Font.BOLD, new Color(46, 204, 113)); // Green
        }
    }
}