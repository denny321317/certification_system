mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: certification_system
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `backup_settings`
--

DROP TABLE IF EXISTS `backup_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auto_backup_interval` int NOT NULL,
  `days_before_delete` int NOT NULL,
  `last_backup_time` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_settings`
--

LOCK TABLES `backup_settings` WRITE;
/*!40000 ALTER TABLE `backup_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certification_templates`
--

DROP TABLE IF EXISTS `certification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certification_templates` (
  `id` varchar(255) NOT NULL,
  `description` text,
  `display_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certification_templates`
--

LOCK TABLES `certification_templates` WRITE;
/*!40000 ALTER TABLE `certification_templates` DISABLE KEYS */;
INSERT INTO `certification_templates` VALUES ('SMETA 4 Pillar','範例的 SMETA 4 認證','SMETA 4 Pillar'),('測試模板','用來測試加入模板','測試模板');
/*!40000 ALTER TABLE `certification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_tags`
--

DROP TABLE IF EXISTS `document_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_tags` (
  `document_id` bigint NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  KEY `FKc99c5qjulwx9gru07yrhicgd2` (`document_id`),
  CONSTRAINT `FKc99c5qjulwx9gru07yrhicgd2` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_tags`
--

LOCK TABLES `document_tags` WRITE;
/*!40000 ALTER TABLE `document_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url_to_file` varchar(255) DEFAULT NULL,
  `uploader_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpevi92qn6kuotawa7dy2gpu39` (`uploader_id`),
  CONSTRAINT `FKpevi92qn6kuotawa7dy2gpu39` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `size_in_bytes` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `upload_time` datetime(6) DEFAULT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1b63qab88c2fchx7iw6r1vh0l` (`project_id`),
  CONSTRAINT `FK1b63qab88c2fchx7iw6r1vh0l` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (1,'plan','','pdf','plan/89746614-1e1a-410d-b97b-6bb2178da1a5.pdf','115台大資管.pdf',195701,'pending','2025-09-16 15:15:53.552440','admin',2),(2,'plan','測試用','pdf','plan/45c605ef-280d-41d5-8735-2d032fea1ef9.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:26:02.823168','admin',3),(3,'plan','測試用','pdf','plan/8e71ae21-76c4-4da1-a96b-f3136b239b61.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:26:10.951065','admin',3),(4,'plan','測試用','pdf','plan/a8492247-7df2-402e-a0ce-8f2a90b2f3bd.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:27:07.509943','admin',3),(5,'plan','測試用','pdf','plan/2f7eea74-c77e-4bb6-a38c-1e3975de648c.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:27:24.585343','admin',3),(6,'plan','測試用','pdf','plan/9b5af1ef-e78e-40ec-9c45-da2b105dd8c9.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:36:16.013451','admin',3),(7,'plan','測試用','pdf','plan/3a83fe34-0fc6-45b2-a5eb-fc89c7068ddd.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:36:22.080858','admin',3),(8,'plan','測試用','pdf','plan/ad761e3b-2900-4f2f-ba79-d8f508c4d544.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:38:05.079853','admin',3),(9,'plan','','pdf','plan/02dad1a9-dea1-483a-af00-895dadef78e1.pdf','115台大資管.pdf',195701,'pending','2025-09-16 20:40:59.509161','admin',3),(10,'audit','test','pdf','audit/81a8b5a7-6c06-4503-afe2-db5ea5e4644d.pdf','1141_政大學費繳費單.pdf',124781,'pending','2025-09-28 23:11:10.631304','admin',1),(11,'plan','','pdf','plan/f418f9b7-0015-4269-909f-3f8c13fc6eff.pdf','Letter_of_Admission_English_German_FSS26_.pdf',126438,'pending','2025-09-28 23:44:14.758999','admin',1);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_settings`
--

DROP TABLE IF EXISTS `general_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_settings` (
  `id` bigint NOT NULL,
  `date_format` varchar(255) DEFAULT NULL,
  `system_language` varchar(255) DEFAULT NULL,
  `system_name` varchar(255) DEFAULT NULL,
  `timezone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_settings`
--

LOCK TABLES `general_settings` WRITE;
/*!40000 ALTER TABLE `general_settings` DISABLE KEYS */;
INSERT INTO `general_settings` VALUES (1,'DD/MM/YYYY','繁體中文','企業認證資料系統','Asia/Taipei');
/*!40000 ALTER TABLE `general_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(1000) NOT NULL,
  `sender_id` bigint NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `topic` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,'New document uploaded: \'1141_政大學費繳費單.pdf\' in project \'Test Project\'.',-1,'2025-09-28 23:11:10.660359','Project Update'),(2,'Test',-1,'2025-09-28 23:20:25.677460','Test'),(3,'Document deleted: \'1141_政大學費繳費單.pdf\' from project \'Test Project\'.',-1,'2025-09-28 23:44:01.412547','Project Update'),(4,'New document uploaded: \'Letter_of_Admission_English_German_FSS26_.pdf\' in project \'Test Project\'.',-1,'2025-09-28 23:44:14.766886','Project Update'),(5,'您被加入到Test Project中',-1,'2025-09-28 23:56:59.324788','專案加入通知'),(6,'Document deleted: \'Letter_of_Admission_English_German_FSS26_.pdf\' from project \'Test Project\'.',-1,'2025-09-29 00:01:05.721244','Project Update'),(7,'Document deleted: \'1141_政大學費繳費單.pdf\' from project \'Test Project\'.',-1,'2025-09-29 00:01:09.862509','Project Update'),(8,'測試群發通知',1,'2025-09-29 08:35:26.246296','測試群發'),(9,'文件刪除: \'Letter_of_Admission_English_German_FSS26_.pdf\' 被從 \'Test Project\'中刪除',-1,'2025-09-29 09:02:46.962767','Project Update'),(10,'文件刪除: \'1141_政大學費繳費單.pdf\' 被從 \'Test Project\'中刪除',-1,'2025-09-29 09:02:53.177948','Project Update'),(11,'測試傳送通知',1,'2025-09-29 09:08:59.147508','測試傳送通知'),(12,'系統將在 ... ... 關閉',1,'2025-09-30 22:06:35.468648','系統維護'),(15,'test',1,'2025-10-14 17:11:57.294358','test'),(16,'test',1,'2025-10-14 17:14:02.185083','test'),(17,'fesf',1,'2025-10-14 17:14:07.884476','fesf'),(18,'fesf',1,'2025-10-14 17:14:12.850140','fesf'),(19,'53w53',1,'2025-10-14 17:24:21.910543','53w53w'),(20,'fdsfdsf',1,'2025-10-14 17:24:26.206059','fdsfdsf'),(21,'5325325',1,'2025-10-14 17:24:32.687103','532523'),(22,'fds',1,'2025-10-14 20:44:00.337282','fds');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_read+status`
--

DROP TABLE IF EXISTS `notification_read+status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_read+status` (
  `notification_id` bigint NOT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`notification_id`,`user_id`),
  CONSTRAINT `FKg2blcebx5f6jpwndcwxre8n9c` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_read+status`
--

LOCK TABLES `notification_read+status` WRITE;
/*!40000 ALTER TABLE `notification_read+status` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_read+status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_read_status`
--

DROP TABLE IF EXISTS `notification_read_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_read_status` (
  `notification_id` bigint NOT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `read_status` bit(1) DEFAULT NULL,
  PRIMARY KEY (`notification_id`,`user_id`),
  CONSTRAINT `FK2psxpunfyuatkpjuip9sd40ya` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_read_status`
--

LOCK TABLES `notification_read_status` WRITE;
/*!40000 ALTER TABLE `notification_read_status` DISABLE KEYS */;
INSERT INTO `notification_read_status` VALUES (1,NULL,2,_binary ''),(2,NULL,2,_binary ''),(3,NULL,2,_binary ''),(4,NULL,2,_binary ''),(5,NULL,1,_binary ''),(6,NULL,1,_binary ''),(6,NULL,2,_binary ''),(7,NULL,1,_binary ''),(7,NULL,2,_binary ''),(8,NULL,1,_binary ''),(8,NULL,2,_binary ''),(9,NULL,1,_binary ''),(9,NULL,2,_binary ''),(10,NULL,1,_binary ''),(10,NULL,2,_binary ''),(11,NULL,2,_binary ''),(12,NULL,1,_binary ''),(12,NULL,2,_binary ''),(15,NULL,1,_binary ''),(15,NULL,3,_binary '\0'),(15,NULL,4,_binary '\0'),(15,NULL,6,_binary '\0'),(15,NULL,7,_binary '\0'),(15,NULL,8,_binary '\0'),(15,NULL,9,_binary '\0'),(15,NULL,10,_binary '\0'),(15,NULL,11,_binary '\0'),(15,NULL,12,_binary '\0'),(15,NULL,13,_binary '\0'),(15,NULL,20,_binary '\0'),(15,NULL,22,_binary '\0'),(16,NULL,1,_binary ''),(17,NULL,1,_binary ''),(18,NULL,1,_binary ''),(19,NULL,1,_binary ''),(19,NULL,2,_binary ''),(19,NULL,3,_binary '\0'),(19,NULL,4,_binary '\0'),(19,NULL,6,_binary '\0'),(19,NULL,7,_binary '\0'),(19,NULL,8,_binary '\0'),(19,NULL,9,_binary '\0'),(19,NULL,10,_binary '\0'),(19,NULL,11,_binary '\0'),(19,NULL,12,_binary '\0'),(19,NULL,13,_binary '\0'),(19,NULL,20,_binary '\0'),(19,NULL,22,_binary '\0'),(20,NULL,1,_binary ''),(20,NULL,2,_binary ''),(20,NULL,3,_binary '\0'),(20,NULL,4,_binary '\0'),(20,NULL,6,_binary '\0'),(20,NULL,7,_binary '\0'),(20,NULL,8,_binary '\0'),(20,NULL,9,_binary '\0'),(20,NULL,10,_binary '\0'),(20,NULL,11,_binary '\0'),(20,NULL,12,_binary '\0'),(20,NULL,13,_binary '\0'),(20,NULL,20,_binary '\0'),(20,NULL,22,_binary '\0'),(21,NULL,1,_binary ''),(21,NULL,2,_binary ''),(21,NULL,3,_binary '\0'),(21,NULL,4,_binary '\0'),(21,NULL,6,_binary '\0'),(21,NULL,7,_binary '\0'),(21,NULL,8,_binary '\0'),(21,NULL,9,_binary '\0'),(21,NULL,10,_binary '\0'),(21,NULL,11,_binary '\0'),(21,NULL,12,_binary '\0'),(21,NULL,13,_binary '\0'),(21,NULL,20,_binary '\0'),(21,NULL,22,_binary '\0'),(22,NULL,1,_binary ''),(22,NULL,3,_binary '\0'),(22,NULL,11,_binary '\0');
/*!40000 ALTER TABLE `notification_read_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `certification_expire_notice` bit(1) NOT NULL,
  `comment_and_reply_notice` bit(1) NOT NULL,
  `days_before_expirary_send_notice` int NOT NULL,
  `document_update_notice` bit(1) NOT NULL,
  `mission_assignment_notice` bit(1) NOT NULL,
  `new_project_notice` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
INSERT INTO `notification_settings` VALUES (1,_binary '',_binary '',75,_binary '',_binary '',_binary '');
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_user_ids`
--

DROP TABLE IF EXISTS `notification_user_ids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_user_ids` (
  `notification_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  KEY `FKc9229cusq2htn1ecl96uofpux` (`notification_id`),
  CONSTRAINT `FKc9229cusq2htn1ecl96uofpux` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_user_ids`
--

LOCK TABLES `notification_user_ids` WRITE;
/*!40000 ALTER TABLE `notification_user_ids` DISABLE KEYS */;
INSERT INTO `notification_user_ids` VALUES (1,3),(1,2),(3,3),(3,2),(4,3),(4,2),(5,1),(6,3),(6,2),(6,1),(7,3),(7,2),(7,1),(8,1),(8,2),(8,3),(8,4),(8,6),(8,7),(8,8),(8,9),(8,10),(8,11),(8,12),(8,13),(8,20),(8,22),(9,3),(9,2),(9,1),(10,3),(10,2),(10,1),(11,2),(12,1),(12,2),(12,3),(12,4),(12,6),(12,7),(12,8),(12,9),(12,10),(12,11),(12,12),(12,13),(12,20),(12,22),(2,2),(15,1),(15,3),(15,4),(15,6),(15,7),(15,8),(15,9),(15,10),(15,11),(15,12),(15,13),(15,20),(15,22),(16,1),(17,1),(18,1),(19,1),(19,2),(19,3),(19,4),(19,6),(19,7),(19,8),(19,9),(19,10),(19,11),(19,12),(19,13),(19,20),(19,22),(20,1),(20,2),(20,3),(20,4),(20,6),(20,7),(20,8),(20,9),(20,10),(20,11),(20,12),(20,13),(20,20),(20,22),(21,1),(21,2),(21,3),(21,4),(21,6),(21,7),(21,8),(21,9),(21,10),(21,11),(21,12),(21,13),(21,20),(21,22),(22,11),(22,3),(22,1);
/*!40000 ALTER TABLE `notification_user_ids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operation_history`
--

DROP TABLE IF EXISTS `operation_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operation_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `details` varchar(512) DEFAULT NULL,
  `operation_time` datetime(6) NOT NULL,
  `operation_type` varchar(255) NOT NULL,
  `operator` varchar(255) NOT NULL,
  `project_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operation_history`
--

LOCK TABLES `operation_history` WRITE;
/*!40000 ALTER TABLE `operation_history` DISABLE KEYS */;
INSERT INTO `operation_history` VALUES (1,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 15:15:53.572983','UPLOAD_DOCUMENT','admin',2),(2,'刪除了文件 \'115台大資管.pdf\'','2025-09-16 15:18:15.767562','DELETE_DOCUMENT','admin',2),(3,'建立了新專案 \'功能測試用專案1\'','2025-09-16 19:57:36.875707','CREATE_PROJECT','admin',3),(4,'建立了新專案 \'fdsfs\'','2025-09-16 19:59:50.348220','CREATE_PROJECT','admin',4),(5,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 20:26:02.854776','UPLOAD_DOCUMENT','admin',3),(6,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 20:26:10.958653','UPLOAD_DOCUMENT','admin',3),(7,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 20:27:07.518207','UPLOAD_DOCUMENT','admin',3),(8,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 20:27:24.614840','UPLOAD_DOCUMENT','admin',3),(9,'刪除了文件 \'115台大資管.pdf\'','2025-09-16 20:27:34.039196','DELETE_DOCUMENT','admin',3),(10,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 20:38:05.113190','UPLOAD_DOCUMENT','admin',3),(11,'刪除了文件 \'115台大資管.pdf\'','2025-09-16 20:40:48.879271','DELETE_DOCUMENT','admin',3),(12,'上傳了文件 \'115台大資管.pdf\' 到類別 \'plan\'','2025-09-16 20:40:59.537215','UPLOAD_DOCUMENT','admin',3),(13,'管理部 提交了 \'internal\' 的審核意見，決定為 \'rejected\'。','2025-09-16 21:43:40.035988','SUBMIT_REVIEW','王經理',3),(14,'管理部 提交了 \'internal\' 的審核意見，決定為 \'approved\'。','2025-09-16 21:45:19.356322','SUBMIT_REVIEW','王經理',3),(15,'管理部 提交了 \'internal\' 的審核意見，決定為 \'approved\'。','2025-09-16 21:50:18.614558','SUBMIT_REVIEW','王經理',3),(16,'管理部 提交了 \'internal\' 的審核意見，決定為 \'approved\'。','2025-09-16 21:50:52.176511','SUBMIT_REVIEW','王經理',3),(17,'管理部 提交了 \'internal\' 的審核意見，決定為 \'approved\'。','2025-09-16 22:11:15.086368','SUBMIT_REVIEW','王經理',4),(18,'上傳了文件 \'1141_政大學費繳費單.pdf\' 到類別 \'audit\'','2025-09-28 23:11:10.663940','UPLOAD_DOCUMENT','admin',1),(19,'刪除了文件 \'1141_政大學費繳費單.pdf\'','2025-09-28 23:44:01.380625','DELETE_DOCUMENT','admin',1),(20,'上傳了文件 \'Letter_of_Admission_English_German_FSS26_.pdf\' 到類別 \'plan\'','2025-09-28 23:44:14.768686','UPLOAD_DOCUMENT','admin',1),(21,'刪除了文件 \'Letter_of_Admission_English_German_FSS26_.pdf\'','2025-09-29 00:01:05.709176','DELETE_DOCUMENT','admin',1),(22,'刪除了文件 \'1141_政大學費繳費單.pdf\'','2025-09-29 00:01:09.857668','DELETE_DOCUMENT','admin',1),(23,'刪除了文件 \'Letter_of_Admission_English_German_FSS26_.pdf\'','2025-09-29 09:02:46.954519','DELETE_DOCUMENT','admin',1),(24,'刪除了文件 \'1141_政大學費繳費單.pdf\'','2025-09-29 09:02:53.172027','DELETE_DOCUMENT','admin',1);
/*!40000 ALTER TABLE `operation_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agency` varchar(255) DEFAULT NULL,
  `cert_type` varchar(255) DEFAULT NULL,
  `description` text,
  `end_date` date DEFAULT NULL,
  `external_review_date` date DEFAULT NULL,
  `internal_review_date` date DEFAULT NULL,
  `manager_id` bigint DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `progress` int DEFAULT NULL,
  `progress_color` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `checklist_state` text,
  `progress_calculation_mode` enum('AUTOMATIC','MANUAL') DEFAULT NULL,
  `selected_template_id` varchar(255) DEFAULT NULL,
  `template_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkl75dxaobj7y74g4euti2xxie` (`template_id`),
  CONSTRAINT `FKkl75dxaobj7y74g4euti2xxie` FOREIGN KEY (`template_id`) REFERENCES `certification_templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'test',NULL,NULL,'2025-12-31','2025-12-30','2025-12-29',NULL,'Test Project',0,'Green','2025-06-01','test','{\"templateId\":\"測試模板\",\"requirements\":[{\"id\":1,\"text\":\"指標一\",\"completed\":false,\"documents\":[{\"id\":101,\"text\":\"文件一\",\"completed\":false},{\"id\":102,\"text\":\"文件二\",\"completed\":false}]}]}',NULL,'測試模板',NULL),(2,'其他機構','other','測試','2025-08-20','2025-08-05','2025-07-29',NULL,'系統開發',0,'progress-preparing','2025-07-01','preparing','{\"templateId\":\"測試模板\",\"requirements\":[{\"id\":1,\"text\":\"指標一\",\"completed\":false,\"documents\":[{\"id\":101,\"text\":\"文件一\",\"completed\":false},{\"id\":102,\"text\":\"文件二\",\"completed\":false}]}]}',NULL,'測試模板',NULL),(3,'其他機構','other','','2025-10-09','2025-09-30','2025-09-18',6,'功能測試用專案1',0,'progress-preparing','2025-09-15','preparing','{\"templateId\":\"測試模板\",\"requirements\":[{\"id\":1,\"text\":\"指標一\",\"completed\":false,\"documents\":[{\"id\":101,\"text\":\"文件一\",\"completed\":false},{\"id\":102,\"text\":\"文件二\",\"completed\":false}]}]}','MANUAL','測試模板',NULL),(4,'其他機構','other','fds','2025-09-19','2025-09-19','2025-09-15',1,'fdsfs',10,'progress-preparing','2025-09-08','preparing',NULL,'MANUAL',NULL,NULL);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_requirement_status`
--

DROP TABLE IF EXISTS `project_requirement_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_requirement_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_completed` bit(1) NOT NULL,
  `notes` text,
  `project_id` bigint NOT NULL,
  `template_requirement_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5e6vmog9c1txenqugj96b36x4` (`project_id`),
  KEY `FKjvprq8bx19vqx0md682veiu2b` (`template_requirement_id`),
  CONSTRAINT `FK5e6vmog9c1txenqugj96b36x4` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKjvprq8bx19vqx0md682veiu2b` FOREIGN KEY (`template_requirement_id`) REFERENCES `template_requirements` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_requirement_status`
--

LOCK TABLES `project_requirement_status` WRITE;
/*!40000 ALTER TABLE `project_requirement_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_requirement_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_supplier`
--

DROP TABLE IF EXISTS `project_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_supplier` (
  `supplier_id` bigint NOT NULL,
  `project_id` bigint NOT NULL,
  KEY `FKf7sf23m9acdxwpxtnixnfkj7a` (`project_id`),
  KEY `FK3kc2ah3pugcfrrdio556cea49` (`supplier_id`),
  CONSTRAINT `FK3kc2ah3pugcfrrdio556cea49` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  CONSTRAINT `FKf7sf23m9acdxwpxtnixnfkj7a` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_supplier`
--

LOCK TABLES `project_supplier` WRITE;
/*!40000 ALTER TABLE `project_supplier` DISABLE KEYS */;
INSERT INTO `project_supplier` VALUES (3,1);
/*!40000 ALTER TABLE `project_supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_team`
--

DROP TABLE IF EXISTS `project_team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_team` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role` varchar(255) DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `permission` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5fb0uivx2rshuy6386ppp6m8f` (`project_id`),
  KEY `FKjqicm0e23l85u61xrvg1xjnpk` (`user_id`),
  CONSTRAINT `FK5fb0uivx2rshuy6386ppp6m8f` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `FKjqicm0e23l85u61xrvg1xjnpk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_team`
--

LOCK TABLES `project_team` WRITE;
/*!40000 ALTER TABLE `project_team` DISABLE KEYS */;
INSERT INTO `project_team` VALUES (1,'經理',1,3,NULL),(3,'認證審核員',1,2,NULL),(5,'',3,1,'edit'),(6,'',3,22,'edit'),(7,'',2,1,'edit'),(8,'',4,1,'edit'),(10,'',1,1,'view');
/*!40000 ALTER TABLE `project_team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_team_duties`
--

DROP TABLE IF EXISTS `project_team_duties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_team_duties` (
  `project_team_id` bigint NOT NULL,
  `duties` varchar(255) DEFAULT NULL,
  KEY `FKg1kkx4764qsc0f7vdy1x03rjk` (`project_team_id`),
  CONSTRAINT `FKg1kkx4764qsc0f7vdy1x03rjk` FOREIGN KEY (`project_team_id`) REFERENCES `project_team` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_team_duties`
--

LOCK TABLES `project_team_duties` WRITE;
/*!40000 ALTER TABLE `project_team_duties` DISABLE KEYS */;
INSERT INTO `project_team_duties` VALUES (6,'專案開發');
/*!40000 ALTER TABLE `project_team_duties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_issues`
--

DROP TABLE IF EXISTS `review_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_issues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `deadline` datetime(6) DEFAULT NULL,
  `severity` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `review_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4ym8c73hahr091250wxb0xb3i` (`review_id`),
  CONSTRAINT `FK4ym8c73hahr091250wxb0xb3i` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_issues`
--

LOCK TABLES `review_issues` WRITE;
/*!40000 ALTER TABLE `review_issues` DISABLE KEYS */;
INSERT INTO `review_issues` VALUES (1,'2025-09-16 21:43:40.025476','2025-09-23 17:00:00.000000','medium','open','小問題',1);
/*!40000 ALTER TABLE `review_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `decision` varchar(20) DEFAULT NULL,
  `review_date` datetime(6) NOT NULL,
  `review_type` varchar(20) NOT NULL,
  `reviewer_department` varchar(100) DEFAULT NULL,
  `reviewer_name` varchar(100) NOT NULL,
  `project_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKih75j8y8lgql5f5bu6900l9nq` (`project_id`),
  CONSTRAINT `FKih75j8y8lgql5f5bu6900l9nq` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'測試加入審核意見','2025-09-16 21:43:40.013102','rejected','2025-09-16 21:43:40.013129','internal','管理部','王經理',3),(2,'fdsf','2025-09-16 21:45:19.352781','approved','2025-09-16 21:45:19.352797','internal','管理部','王經理',3),(3,'測試通知','2025-09-16 21:50:18.586594','approved','2025-09-16 21:50:18.586634','internal','管理部','王經理',3),(4,'測試通知','2025-09-16 21:50:52.152327','approved','2025-09-16 21:50:52.152354','internal','管理部','王經理',3),(5,'fdsfsdf','2025-09-16 22:11:15.082363','approved','2025-09-16 22:11:15.082389','internal','管理部','王經理',4);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `allow_read_certification_projects` bit(1) NOT NULL,
  `allow_read_dashboard` bit(1) NOT NULL,
  `allow_read_document_managment` bit(1) NOT NULL,
  `allow_read_report_managment` bit(1) NOT NULL,
  `allow_read_supplier_management` bit(1) NOT NULL,
  `allow_read_system_settings` bit(1) NOT NULL,
  `allow_read_template_center` bit(1) NOT NULL,
  `allow_read_user_managment` bit(1) NOT NULL,
  `allow_write_certification_projects` bit(1) NOT NULL,
  `allow_write_dashboard` bit(1) NOT NULL,
  `allow_write_document_managment` bit(1) NOT NULL,
  `allow_write_report_managment` bit(1) NOT NULL,
  `allow_write_supplier_management` bit(1) NOT NULL,
  `allow_write_system_settings` bit(1) NOT NULL,
  `allow_write_template_center` bit(1) NOT NULL,
  `allow_write_user_managment` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'系統管理員',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary ''),(2,'部門經理',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '\0',_binary '\0'),(3,'一般使用者',_binary '',_binary '',_binary '',_binary '',_binary '\0',_binary '',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '\0',_binary '\0',_binary '',_binary '\0',_binary '\0'),(4,'訪客',_binary '\0',_binary '',_binary '\0',_binary '',_binary '\0',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(5,'認證審核員',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(11,'測試新增角色',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(12,'新增角色2',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_settings`
--

DROP TABLE IF EXISTS `security_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `enable_two_factor` bit(1) NOT NULL,
  `max_login_attempts` int NOT NULL,
  `min_length` int NOT NULL,
  `require_min_length` bit(1) NOT NULL,
  `require_number` bit(1) NOT NULL,
  `require_special_char` bit(1) NOT NULL,
  `require_upper_lower_case` bit(1) NOT NULL,
  `session_timeout_minutes` int NOT NULL,
  `max_login_lock_minutes` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_settings`
--

LOCK TABLES `security_settings` WRITE;
/*!40000 ALTER TABLE `security_settings` DISABLE KEYS */;
INSERT INTO `security_settings` VALUES (1,_binary '\0',3,10,_binary '',_binary '',_binary '',_binary '\0',34,1),(25,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(26,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(27,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(28,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(29,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(30,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(31,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(32,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(33,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(34,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(35,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(36,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(37,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(38,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(39,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(40,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(41,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(42,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0),(43,_binary '\0',0,8,_binary '',_binary '\0',_binary '\0',_binary '\0',0,0);
/*!40000 ALTER TABLE `security_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `certificate_status` enum('CERTIFICATED','NOT_CERTIFICATED','UNDER_CERTIFICATION') DEFAULT NULL,
  `collab_start` datetime(6) DEFAULT NULL,
  `country` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `product` varchar(255) DEFAULT NULL,
  `risk_profile` enum('HIGH','LOW','MEDIUM') DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'台北市信義路100號','CERTIFICATED','2023-01-15 08:00:00.000000','TW','contact@taiwan-materials.com','台灣原料股份有限公司','塑膠製品','LOW','02-12345678','MANUFACTURER'),(3,'新北市某路某號','CERTIFICATED','2023-01-15 08:00:00.000000','TW','contact@top-electronics.com','頂尖電子有限公司','塑膠製品','LOW','02-12345678','原材料供應商');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKt48xdq560gs3gap9g7jg36kgc` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (5,'Audit'),(8,'Certification'),(2,'Compliance'),(7,'Document'),(1,'Quality'),(10,'Report'),(3,'Safety'),(6,'Supplier'),(9,'Template'),(4,'Training');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_documents`
--

DROP TABLE IF EXISTS `template_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text,
  `name` varchar(255) NOT NULL,
  `requirement_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4j8xi5gca4l517wg48y62dpn0` (`requirement_id`),
  CONSTRAINT `FK4j8xi5gca4l517wg48y62dpn0` FOREIGN KEY (`requirement_id`) REFERENCES `template_requirements` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_documents`
--

LOCK TABLES `template_documents` WRITE;
/*!40000 ALTER TABLE `template_documents` DISABLE KEYS */;
INSERT INTO `template_documents` VALUES (3,'測試','文件一',2),(4,'測試','文件二',2),(5,'','員工相關資料',3);
/*!40000 ALTER TABLE `template_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `template_requirements`
--

DROP TABLE IF EXISTS `template_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_requirements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `template_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKssby1bked8r8pjasdlbl9vjp6` (`template_id`),
  CONSTRAINT `FKssby1bked8r8pjasdlbl9vjp6` FOREIGN KEY (`template_id`) REFERENCES `certification_templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `template_requirements`
--

LOCK TABLES `template_requirements` WRITE;
/*!40000 ALTER TABLE `template_requirements` DISABLE KEYS */;
INSERT INTO `template_requirements` VALUES (2,'指標一','測試模板'),(3,'員工福利','SMETA 4 Pillar');
/*!40000 ALTER TABLE `template_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `todos`
--

DROP TABLE IF EXISTS `todos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `todos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `completed` bit(1) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `due_date` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `urgency` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `todos`
--

LOCK TABLES `todos` WRITE;
/*!40000 ALTER TABLE `todos` DISABLE KEYS */;
INSERT INTO `todos` VALUES (1,'',_binary '\0','','2025-09-23','test','low');
/*!40000 ALTER TABLE `todos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `user_id` bigint NOT NULL,
  `notifications` varchar(255) DEFAULT NULL,
  KEY `FK9f86wonnl11hos1cuf5fibutl` (`user_id`),
  CONSTRAINT `FK9f86wonnl11hos1cuf5fibutl` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES (22,'New document uploaded: \'115台大資管.pdf\' in project \'功能測試用專案1\'.'),(22,'New review added to project: \'功能測試用專案1\'.'),(1,'New document uploaded: \'115台大資管.pdf\' in project \'功能測試用專案1\'.'),(1,'You have been added to project: \'系統開發\'.'),(1,'New review added to project: \'功能測試用專案1\'.'),(1,'You have been added to project: \'fdsfs\'.'),(1,'New review added to project: \'fdsfs\'.'),(1,'You have been added to project: \'Test Project\'.');
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `last_time_login` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `online` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','AUDITOR','GUEST','ORDINARY_USER') NOT NULL,
  `role_id` bigint NOT NULL,
  `department` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `suspended` bit(1) NOT NULL,
  `account_locked_until` datetime(6) DEFAULT NULL,
  `failed_login_attempts` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKp56c1712k691lhsyewcssf40f` (`role_id`),
  CONSTRAINT `FKp56c1712k691lhsyewcssf40f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin1@example.com','2025-10-16 21:35:58.568713','管理員一號',_binary '','passwordd1!','ADMIN',1,'IT',NULL,'token1',NULL,_binary '\0',NULL,0),(2,'admin2@example.com','2025-10-14 17:24:50.449710','Admin User 2',_binary '\0','Password1!','ADMIN',5,'default',NULL,NULL,NULL,_binary '\0',NULL,0),(3,'manager1@example.com','2025-07-15 20:39:15.139394','Manager User 1',_binary '\0','password','ADMIN',2,'default',NULL,NULL,NULL,_binary '\0','2025-08-12 20:59:09.601159',0),(4,'manager2@example.com','2025-04-28 20:30:15.393420','Manager User 2',_binary '\0','password','ADMIN',2,'default',NULL,NULL,NULL,_binary '\0','2025-08-12 20:51:05.982557',0),(6,'user2@example.com','2025-09-30 22:07:36.819943','Regular User 2',_binary '\0','password1!','ADMIN',3,'default',NULL,NULL,NULL,_binary '\0',NULL,0),(7,'user3@example.com','2025-04-28 20:30:15.393609','Regular User 3',_binary '\0','password','ADMIN',3,'default',NULL,NULL,NULL,_binary '\0','2025-08-12 20:42:10.053388',0),(8,'guest1@example.com','2025-04-28 20:30:15.393614','Guest User 1',_binary '\0','password','ADMIN',4,'default',NULL,NULL,NULL,_binary '\0',NULL,0),(9,'guest2@example.com','2025-04-28 20:30:15.393619','Guest User 2',_binary '\0','password','ADMIN',4,'default',NULL,NULL,NULL,_binary '\0',NULL,0),(10,'guest3@example.com','2025-04-28 20:30:15.393623','Guest User 3',_binary '\0','password','ADMIN',4,'default',NULL,NULL,NULL,_binary '\0',NULL,0),(11,'testadduser@example.com','2025-05-13 13:49:29.490480','Test_add_user',_binary '\0','password','ADMIN',1,'IT',NULL,NULL,NULL,_binary '\0',NULL,0),(12,'testfrontendadd@example.com','2025-06-17 21:13:04.465585','test frontend add',_binary '\0','password','ADMIN',3,'IT',NULL,NULL,NULL,_binary '\0',NULL,0),(13,'testaddmanager@example.com','2025-05-26 22:53:42.568329','test add manager',_binary '\0','password','ADMIN',2,'IT',NULL,NULL,NULL,_binary '\0',NULL,0),(20,'testest@example.com','2025-08-26 11:09:50.312814','testest',_binary '\0','test','ADMIN',3,'it',NULL,NULL,'test',_binary '\0',NULL,2),(22,'111306095@g.nccu.edu.tw','2025-09-16 20:05:06.429905','任善研',_binary '\0','password','ADMIN',1,'系統開發人員',NULL,NULL,NULL,_binary '\0',NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 23:29:21
