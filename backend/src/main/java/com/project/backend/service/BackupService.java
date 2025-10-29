package com.project.backend.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.File;
import java.text.SimpleDateFormat;

import org.springframework.beans.factory.annotation.Value;

import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class BackupService {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private static final String BACKUP_DIR = "backups";

    public String createBackup() throws IOException, InterruptedException {
        String dbName = getDatabaseNameFromUrl(dbUrl);
        if (dbName == null) {
            throw new IOException("Could not parse database name from JDBC URL.");
        }

        String host = getHostFromUrl(dbUrl);
        String port = getPortFromUrl(dbUrl);

        File backupDir = new File(BACKUP_DIR);
        if (!backupDir.exists()) {
            backupDir.mkdirs();
        }

        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        String backupFileName = String.format("backup-%s-%s.sql", dbName, timestamp);
        File backupFile = new File(backupDir, backupFileName);

        // Ensure mysqldump is in the system's PATH or provide a full path to it.
        ProcessBuilder processBuilder = new ProcessBuilder(
                "mysqldump",
                "--host=" + host,
                "--port=" + port,
                "--user=" + dbUsername,
                "--password=" + dbPassword,
                "--no-tablespaces",
                "--set-gtid-purged=OFF",
                "--column-statistics=0",
                dbName);

        processBuilder.redirectOutput(backupFile);
        processBuilder.redirectErrorStream(true); // Redirect errors to the output stream for logging

        Process process = processBuilder.start();
        int exitCode = process.waitFor();

        if (exitCode == 0) {
            return backupFile.getAbsolutePath();
        } else {
            // In a real application, you would log the contents of the backupFile for error details
            throw new IOException("mysqldump process failed with exit code: " + exitCode + ". Check if 'mysqldump' is installed and in your system's PATH.");
        }
    }

    // Helper Methods

    private String getDatabaseNameFromUrl(String url) {
        // Extracts database name from a JDBC URL like "jdbc:mysql://localhost:3306/db_name?..."
        Pattern pattern = Pattern.compile("://[^/]+/(.*?)(?:\\?|$)");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private String getHostFromUrl(String url) {
        // Extracts hostname from a JDBC URL
        Pattern pattern = Pattern.compile("://(?:.*@)?([^:/]+)");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private String getPortFromUrl(String url) {
        // Extracts port from a JDBC URL
        Pattern pattern = Pattern.compile(":([0-9]+)/");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "3306"; // Default MySQL port if not found
    }





}
