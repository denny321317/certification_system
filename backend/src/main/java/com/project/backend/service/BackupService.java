package com.project.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.BufferedReader;
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
    private static final String RESTORE_DIR = "restores_temp";


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


        Process process = processBuilder.start();

        // --- START OF FIX: Consume the error stream separately ---
        final StringBuilder errorOutput = new StringBuilder();
        Thread errorGobbler = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // You can log the warnings/errors to the console if you want
                    System.err.println("mysqldump-warning: " + line);
                    errorOutput.append(line).append("\n");
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        errorGobbler.start();
        // --- END OF FIX ---

        int exitCode = process.waitFor();
        errorGobbler.join();

        if (exitCode == 0) {
            return backupFile.getAbsolutePath();
        } else {
            // In a real application, you would log the contents of the backupFile for error details
            throw new IOException("mysqldump process failed with exit code: " + exitCode + ". Check if 'mysqldump' is installed and in your system's PATH.");
        }
    }

    public String restoreBackup(MultipartFile file) throws IOException, InterruptedException {
        // 1. Save the uploaded file temporarily
        File restoreDir = new File(RESTORE_DIR);
        if (!restoreDir.exists()) {
            restoreDir.mkdirs();
        }
        Path tempFilePath = Paths.get(RESTORE_DIR, file.getOriginalFilename());
        Files.copy(file.getInputStream(), tempFilePath, StandardCopyOption.REPLACE_EXISTING);

        // 2. Define the new database name
        String originalDbName = getDatabaseNameFromUrl(dbUrl);
        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String newDbName = originalDbName + "_restored_" + timestamp;

        String host = getHostFromUrl(dbUrl);
        String port = getPortFromUrl(dbUrl);

        // 3. Create the new database
        // This requires the 'mysql' command-line tool.
        ProcessBuilder createDbProcessBuilder = new ProcessBuilder(
            "mysql",
            "--host=" + host,
            "--port=" + port,
            "--user=" + dbUsername,
            "--password=" + dbPassword,
            "-e", "CREATE DATABASE " + newDbName
        );
        Process createDbProcess = createDbProcessBuilder.start();
        if (createDbProcess.waitFor() != 0) {
            throw new IOException("Failed to create new database '" + newDbName + "'. Check permissions.");
        }

        // 4. Restore the backup into the new database
        ProcessBuilder restoreProcessBuilder = new ProcessBuilder(
            "mysql",
            "--host=" + host,
            "--port=" + port,
            "--user=" + dbUsername,
            "--password=" + dbPassword,
            newDbName
        );
        restoreProcessBuilder.redirectInput(tempFilePath.toFile());
        Process restoreProcess = restoreProcessBuilder.start();
        if (restoreProcess.waitFor() != 0) {
            throw new IOException("Failed to restore database to '" + newDbName + "'.");
        }

        // 5. Clean up the temporary file and return the new DB name
        Files.delete(tempFilePath);
        return newDbName;
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
