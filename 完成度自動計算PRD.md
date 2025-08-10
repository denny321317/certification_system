# 「完成度自動計算」功能產品需求文件 (PRD)

這是一個非常棒的想法！您的思路完全可行，而且是朝著系統化、自動化管理認證專案的正確方向前進。這個功能不僅能讓進度追蹤更加客觀，也能大大提升專案管理的效率。

我將基於您的想法，提供一個更詳細的實施規劃藍圖，涵蓋前端、後端到資料庫的設計。在我們開始修改任何程式碼之前，這份藍圖可以幫助我們確保所有環節都考慮周全。

---

### **目標實現藍圖**

這個功能的核心是：**將抽象的「專案進度」轉化為具體的「範本項目完成度」。**

#### **1. 資料庫層面的設計 (Database Schema)**

為了支援這個功能，我們需要在後端資料庫中做一些調整：

1.  **專案 (`Project`) 與範本 (`CertificationTemplate`) 的關聯**：
    *   在 `Project` 資料表中，新增一個欄位，例如 `template_id`，用來儲存該專案所套用的範本 ID。這是一個外鍵（Foreign Key），指向 `CertificationTemplate` 表。
2.  **進度計算模式**：
    *   在 `Project` 資料表中，再新增一個欄位，例如 `progress_calculation_mode` (類型可以是字串或枚舉)，用來區分進度是「自動計算」(`AUTOMATIC`) 還是「手動設定」(`MANUAL`)。預設值可以設為 `MANUAL`，以確保舊專案不受影響。
3.  **專案需求完成狀態追蹤表 (`ProjectRequirementStatus`)**：
    *   這是最重要的部分。我們需要一張**新的資料表**來追蹤**每一個專案中，每一個範本需求的完成情況**。
    *   這個新表可以命名為 `ProjectRequirementStatus`，包含以下欄位：
        *   `id`: 主鍵。
        *   `project_id`: 外鍵，關聯到 `Project` 表，表示這是哪個專案的狀態。
        *   `template_requirement_id`: 外鍵，關聯到範本中的具體需求項目。
        *   `is_completed`: 布林值 (Boolean)，`true` 表示已完成，`false` 表示未完成。
        *   `notes` (可選): 用於記錄備註。
        *   `file_id` (可選): 如果某個項目需要上傳文件，可以關聯到 `FileEntity` 表。

#### **2. 後端 API 的修改與新增 (Backend API)**

後端需要提供對應的 API 接口給前端調用：

1.  **套用範本至專案**:
    *   `PUT /api/projects/{projectId}/template`
    *   當使用者為專案選擇一個範本時，後端會接收到請求。
    *   **核心邏輯**: 後端會根據傳入的 `template_id`，查詢該範本所有的需求項目，然後在 `ProjectRequirementStatus` 表中為這個專案生成一整套對應的、狀態皆為「未完成」的紀錄。
2.  **更新需求項目狀態**:
    *   `PATCH /api/projects/{projectId}/requirements/{requirementId}`
    *   當使用者在前端勾選或取消勾選某個項目時，前端會呼叫此 API。
    *   **核心邏輯**: 後端更新 `ProjectRequirementStatus` 表中對應項目的 `is_completed` 狀態。**更新後，如果專案模式為 `AUTOMATIC`，則立即重新計算完成度** (`(已完成項目數 / 總項目數) * 100`)，並將結果更新回 `Project` 表的 `completion_percentage` 欄位。
3.  **切換進度計算模式**:
    *   `PATCH /api/projects/{projectId}/settings`
    *   前端提供 UI 讓使用者在「自動」和「手動」模式間切換。
    *   **核心邏輯**: 後端僅需更新 `Project` 表中的 `progress_calculation_mode` 欄位即可。如果從「手動」切換到「自動」，可以觸發一次進度重新計算。

#### **3. 前端介面的開發 (Frontend UI)**

前端需要配合後端 API 進行以下頁面的修改：

1.  **專案建立/設定頁面**:
    *   增加一個下拉選單或彈出視窗，讓使用者可以從「範本中心」(`TemplateCenter`) 的列表中選擇一個範本套用至目前專案。
2.  **專案詳情頁 (`CertificationProjectDetail.js`)**:
    *   這是使用者互動的主要場所。此頁面需要顯示一個**「認證項目檢查清單 (Checklist)」**。
    *   這個清單的內容就是從後端獲取的、該專案對應的所有 `ProjectRequirementStatus` 項目。
    *   每一項前面都有一個核取方塊 (Checkbox)。使用者勾選或取消時，即時呼叫後端 API 更新狀態。
    *   頁面上的「完成度」進度條或數字，會根據後端回傳的最新百分比自動更新。
3.  **進度管理/專案設定頁**:
    *   增加一個開關 (Toggle Switch) 或選項按鈕 (Radio Button)，允許使用者在「自動計算」和「手動調整」之間切換。
    *   **當處於「自動計算」模式時**：完成度的輸入框應設為**唯讀 (read-only)**，只顯示系統計算出的結果。
    *   **當切換到「手動調整」模式時**：輸入框恢復為可編輯狀態，讓使用者可以像現在一樣自由填寫完成度。

### **總結工作流程**

1.  **使用者**在建立或編輯一個認證專案時，從範本中心選擇並套用一個認證範本。
2.  **系統**自動為該專案生成一份包含所有範本需求的檢查清單。
3.  在專案進行中，**使用者**進入專案詳情頁，根據實際完成情況，逐一勾選清單上的項目（例如「已上傳供應商資料」、「已完成初步審核」等）。
4.  **系統**在背景（如果設定為自動模式）即時計算已勾選項目的比例，並更新專案的總體完成度。
5.  如果專案經理認為自動計算的進度不符合實際情況，他可以隨時切換到「手動模式」，直接輸入一個他認為更準確的數值。

这个方案完整地结合了您提出的想法，并保留了原有的弹性。

---

### **開發實施步驟 (Development Implementation Steps)**

為了實現上述功能，我們將開發過程分為三個主要階段：後端開發、前端開發和整合測試。

#### **階段一：後端開發 (Backend Development)**

**第一部分：資料模型與資料庫 (Data Model & Database)**

1.  **建立 `ProgressCalculationMode` 枚舉**:
    *   在 `com.project.backend.model` 包下建立一個新的 `enum` 檔案 `ProgressCalculationMode.java`。
    *   定義兩個值：`MANUAL` 和 `AUTOMATIC`。

2.  **修改 `Project` 實體**:
    *   在 `Project.java` 中，新增以下欄位：
        *   `@Enumerated(EnumType.STRING)`
          `private ProgressCalculationMode progressCalculationMode;` (設定預設值為 `MANUAL`)
        *   `@ManyToOne(fetch = FetchType.LAZY)`
          `@JoinColumn(name = "template_id")`
          `private CertificationTemplate certificationTemplate;`

3.  **建立 `ProjectRequirementStatus` 實體**:
    *   在 `com.project.backend.model` 包下建立新的實體類 `ProjectRequirementStatus.java`。
    *   定義欄位：`id`, `project` (ManyToOne), `templateRequirement` (ManyToOne), `isCompleted` (boolean), `notes` (String)。

4.  **建立 `ProjectRequirementStatusRepository`**:
    *   在 `com.project.backend.repository` 包下建立對應的 JPA Repository 介面。

5.  **更新資料庫結構**:
    *   啟動應用程式，讓 Hibernate/JPA 自動更新資料庫。檢查 `project` 表是否新增了 `progress_calculation_mode` 和 `template_id` 欄位，以及是否成功建立了 `project_requirement_status` 新表。

**第二部分：服務層與 API (Service Layer & API)**

1.  **擴充 `ProjectService`**:
    *   **`applyTemplateToProject(Long projectId, String templateId)`**: 實現套用範本的邏輯。此方法應清除舊的狀態（如果存在），然後為專案產生一組全新的 `ProjectRequirementStatus` 紀錄。
    *   **`updateRequirementStatus(Long projectId, Long requirementId, boolean isCompleted)`**: 實現更新單一需求項目狀態的邏輯。
    *   **`calculateProjectProgress(Long projectId)`**: 內部方法，用於根據 `ProjectRequirementStatus` 列表計算完成百分比並更新 `Project` 的 `progress` 欄位。
    *   **`setProgressCalculationMode(Long projectId, ProgressCalculationMode mode)`**: 實現切換計算模式的邏輯。
    *   在 `updateRequirementStatus` 和 `setProgressCalculationMode` 中，如果模式為 `AUTOMATIC`，則需調用 `calculateProjectProgress`。

2.  **新增與修改 `ProjectController`**:
    *   **`PUT /api/projects/{projectId}/template`**: 建立新的端點，用於套用範本。
    *   **`PATCH /api/projects/{projectId}/requirements/{requirementId}`**: 建立新的端點，用於更新需求狀態。
    *   **`PATCH /api/projects/{projectId}/settings`**: 建立或修改端點，用於切換計算模式。

3.  **更新 DTOs**:
    *   修改 `ProjectDetailDTO` 以包含 `progressCalculationMode` 和一個 `ProjectRequirementStatusDTO` 的列表。
    *   建立 `ProjectRequirementStatusDTO` 以便在 API 中傳輸需求狀態數據。

#### **階段二：前端開發 (Frontend Development)**

1.  **更新前端服務**:
    *   在 `src/services` 中建立或修改 `projectService.js`。
    *   新增函數以調用後端的新 API 端點 (套用範本、更新需求狀態、切換模式)。

2.  **專案設定頁面**:
    *   從後端獲取所有可用範本，並呈現在一個下拉選單或彈出視窗中。
    *   新增一個 UI 開關，讓使用者可以在 `AUTOMATIC` 和 `MANUAL` 模式之間切換。
    *   當使用者操作時，調用對應的前端服務函數。

3.  **專案詳情頁 (`CertificationProjectDetail.js`)**:
    *   獲取專案詳情時，同時取得 `ProjectRequirementStatus` 列表。
    *   將此列表渲染成一個「認證項目檢查清單 (Checklist)」。
    *   每個清單項目都應包含一個核取方塊 (Checkbox)。
    *   根據 `progressCalculationMode` 的值，將「完成度」的進度條/輸入框設為唯讀或可編輯。
    *   當使用者點擊核取方塊時，調用 API 更新狀態，並在成功後刷新專案數據以顯示最新的完成度。

#### **階段三：整合與測試 (Integration & Testing)**

1.  **後端單元測試**:
    *   使用 JUnit 和 Mockito 為 `ProjectService` 中的新業務邏輯編寫單元測試。

2.  **前端組件測試**:
    *   為新增的 UI 組件（如範本選擇器、檢查清單）編寫測試。

3.  **端到端手動測試**:
    *   **場景一**: 建立一個新專案，成功套用一個範本，並驗證檢查清單是否正確顯示。
    *   **場景二**: 在自動模式下，勾選/取消勾選檢查清單中的項目，驗證完成度百分比是否自動更新且輸入框為唯讀。
    *   **場景三**: 將模式切換為手動，驗證完成度輸入框變為可編輯狀態。
    *   **場景四**: 再次切換回自動模式，驗證完成度是否重新計算並恢復為正確的百分比。
    *   **場景五**: 為一個已套用範本的專案更換另一個範本，驗證檢查清單是否被完全替換為新範本的內容。
