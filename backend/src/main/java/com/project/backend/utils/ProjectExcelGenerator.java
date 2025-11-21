package com.project.backend.utils;

import com.project.backend.dto.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ProjectExcelGenerator {

    public static byte[] generateProjectExcel(ProjectDetailDTO project,
                                              List<ReviewDTO> reviews,
                                              ExportSettingsDTO settings) throws Exception {

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("專案報告");
        int rowIdx = 0;

        CellStyle boldStyle = workbook.createCellStyle();
        Font boldFont = workbook.createFont();
        boldFont.setBold(true);
        boldStyle.setFont(boldFont);

        // ----------- 基本資料 -----------
        if (settings.isIncludeBasicInfo()) {
            rowIdx = writeTitle(sheet, rowIdx, "專案基本資訊", boldStyle);
            rowIdx = writeKeyValue(sheet, rowIdx, "專案名稱", project.getName());
            rowIdx = writeKeyValue(sheet, rowIdx, "狀態", project.getStatus());
            rowIdx = writeKeyValue(sheet, rowIdx, "證照類型", project.getCertType());
            rowIdx = writeKeyValue(sheet, rowIdx, "起始日期", project.getStartDate());
            rowIdx = writeKeyValue(sheet, rowIdx, "結束日期", project.getEndDate());
            rowIdx = writeKeyValue(sheet, rowIdx, "內部審查", project.getInternalReviewDate());
            rowIdx = writeKeyValue(sheet, rowIdx, "外部審查", project.getExternalReviewDate());
            rowIdx = writeKeyValue(sheet, rowIdx, "負責人", project.getManagerId());
            rowIdx = writeKeyValue(sheet, rowIdx, "機構", project.getAgency());
            rowIdx = writeKeyValue(sheet, rowIdx, "進度", project.getProgress() + "%");
            rowIdx = writeKeyValue(sheet, rowIdx, "說明", project.getDescription());
            rowIdx++;
        }

        // ----------- 團隊成員 -----------
        if (settings.isIncludeTeamInfo()) {
            rowIdx = writeTitle(sheet, rowIdx, "團隊成員", boldStyle);
            Row teamHeader = sheet.createRow(rowIdx++);
            String[] teamCols = {"姓名", "職稱", "Email", "是否負責人", "權限", "職責"};
            for (int i = 0; i < teamCols.length; i++) {
                Cell cell = teamHeader.createCell(i);
                cell.setCellValue(teamCols[i]);
                cell.setCellStyle(boldStyle);
            }

            for (TeamMemberDTO member : project.getTeam()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(member.getName());
                row.createCell(1).setCellValue(member.getPosition());
                row.createCell(2).setCellValue(member.getEmail());
                row.createCell(3).setCellValue(member.isManager() ? "是" : "否");
                row.createCell(4).setCellValue(member.getPermission());
                row.createCell(5).setCellValue(String.join(", ", member.getDuties()));
            }
            rowIdx++;
        }

        // ----------- 上傳文件 -----------
        if (settings.isIncludeDocuments()) {
            rowIdx = writeTitle(sheet, rowIdx, "上傳文件", boldStyle);
            Row docHeader = sheet.createRow(rowIdx++);
            String[] docCols = {"檔名", "類別", "檔案類型", "上傳時間", "上傳者", "描述"};
            for (int i = 0; i < docCols.length; i++) {
                Cell cell = docHeader.createCell(i);
                cell.setCellValue(docCols[i]);
                cell.setCellStyle(boldStyle);
            }

            for (DocumentDTO doc : project.getDocuments()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(doc.getName());
                row.createCell(1).setCellValue(doc.getCategory());
                row.createCell(2).setCellValue(doc.getType());
                row.createCell(3).setCellValue(doc.getUploadDate());
                row.createCell(4).setCellValue(doc.getUploadedBy());
                row.createCell(5).setCellValue(doc.getDescription());
            }
            rowIdx++;
        }

        // ----------- 稽核紀錄與議題 -----------
        if (settings.isIncludeReviews()) {
            rowIdx = writeTitle(sheet, rowIdx, "審查紀錄", boldStyle);
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (ReviewDTO review : reviews) {
                Row reviewRow = sheet.createRow(rowIdx++);
                reviewRow.createCell(0).setCellValue("審查人");
                reviewRow.createCell(1).setCellValue(review.getReviewer());

                Row deptRow = sheet.createRow(rowIdx++);
                deptRow.createCell(0).setCellValue("部門");
                deptRow.createCell(1).setCellValue(review.getReviewerDepartment());

                Row dateRow = sheet.createRow(rowIdx++);
                dateRow.createCell(0).setCellValue("審查日期");
                dateRow.createCell(1).setCellValue(review.getDate().format(dtf));

                Row statusRow = sheet.createRow(rowIdx++);
                statusRow.createCell(0).setCellValue("狀態");
                statusRow.createCell(1).setCellValue(review.getStatus());

                Row commentRow = sheet.createRow(rowIdx++);
                commentRow.createCell(0).setCellValue("評論");
                commentRow.createCell(1).setCellValue(review.getComment());

                if (review.getIssues() != null && !review.getIssues().isEmpty()) {
                    Row issueHeader = sheet.createRow(rowIdx++);
                    String[] issueCols = {"議題", "嚴重程度", "狀態", "截止日"};
                    for (int i = 0; i < issueCols.length; i++) {
                        Cell cell = issueHeader.createCell(i);
                        cell.setCellValue(issueCols[i]);
                        cell.setCellStyle(boldStyle);
                    }
                    for (ReviewIssueDTO issue : review.getIssues()) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(issue.getTitle());
                        row.createCell(1).setCellValue(issue.getSeverity());
                        row.createCell(2).setCellValue(issue.getStatus());
                        row.createCell(3).setCellValue(issue.getDeadline().toLocalDate().toString());
                    }
                }
                rowIdx++;
            }
        }

        // ----------- 操作歷史 / 圖表（保留空間） -----------
        if (settings.isIncludeHistory()) {
            rowIdx = writeTitle(sheet, rowIdx, "操作歷史", boldStyle);
            // 這裡可根據 OperationHistoryDTO 實作輸出
            rowIdx = writeKeyValue(sheet, rowIdx, "(尚未實作)", "此處可列出操作紀錄...");
        }

        if (settings.isIncludeCharts()) {
            rowIdx = writeTitle(sheet, rowIdx, "圖表分析", boldStyle);
            rowIdx = writeKeyValue(sheet, rowIdx, "(尚未實作)", "圖表、趨勢統計等可放於此");
        }

        // ----------- 附加備註 -----------
        if (settings.getNotes() != null && !settings.getNotes().isBlank()) {
            rowIdx = writeTitle(sheet, rowIdx, "附加說明", boldStyle);
            rowIdx = writeKeyValue(sheet, rowIdx, "備註", settings.getNotes());
        }

        // 自動調整欄寬
        for (int i = 0; i < 10; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }

    private static int writeTitle(Sheet sheet, int rowIdx, String title, CellStyle style) {
        Row row = sheet.createRow(rowIdx++);
        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        cell.setCellStyle(style);
        return rowIdx;
    }

    private static int writeKeyValue(Sheet sheet, int rowIdx, String key, String value) {
        Row row = sheet.createRow(rowIdx++);
        row.createCell(0).setCellValue(key);
        row.createCell(1).setCellValue(value != null ? value : "");
        return rowIdx;
    }
}
