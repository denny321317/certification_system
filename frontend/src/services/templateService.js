/**
 * 模板服務
 * 
 * 此服務提供模板中心的數據管理功能，包含：
 * 1. 認證模板數據的獲取
 * 2. 模板的創建、編輯和刪除
 * 3. 為其他組件提供模板數據的統一接口
 * 
 * 使用方式：
 * ```javascript
 * import { getTemplates, getTemplateById } from '../services/templateService';
 * ```
 */

// 認證模板資料（重構為一對多巢狀需求-文件結構）
let certificationTemplates = [
  {
    id: 'smeta',
    displayName: 'SMETA 4支柱認證模板',
    description: 'SMETA（Sedex會員道德貿易審核）是一套國際公認的社會責任審核標準，涵蓋勞工、健康安全、環境與商業道德四大支柱。',
    requirements: [
      {
        text: '完成自我評估問卷',
        documents: [
          { name: '自我評估問卷', description: '依SMETA標準填寫的自我評估表格' }
        ]
      },
      {
        text: '準備勞工權益、健康安全、環境管理、商業道德等相關文件',
        documents: [
          { name: '勞工權益政策', description: '公司對勞工權益的承諾與政策文件' },
          { name: '健康安全管理程序', description: '現場作業安全與健康管理相關文件' },
          { name: '環境管理計劃', description: '企業環境保護與管理措施說明' },
          { name: '商業道德聲明', description: '反貪腐、誠信經營等政策文件' }
        ]
      },
      {
        text: '接受現場審核與文件審查',
        documents: []
      }
    ]
  },
  {
    id: 'iso9001',
    displayName: 'ISO 9001 品質管理系統模板',
    description: 'ISO 9001 是國際標準化組織制定的品質管理體系標準，強調持續改善與顧客滿意。',
    requirements: [
      {
        text: '建立品質管理手冊',
        documents: [
          { name: '品質管理手冊', description: '公司品質政策、組織架構與管理流程' }
        ]
      },
      {
        text: '明確組織職責與流程',
        documents: [
          { name: '程序文件', description: '各部門作業流程與標準作業程序(SOP)' }
        ]
      },
      {
        text: '持續監控與改善品質指標',
        documents: [
          { name: '內部稽核報告', description: '品質管理體系的自我檢查與改善報告' },
          { name: '顧客滿意度調查', description: '顧客意見回饋與滿意度調查紀錄' }
        ]
      }
    ]
  },
  {
    id: 'iso14001',
    displayName: 'ISO 14001 環境管理系統模板',
    description: 'ISO 14001 是國際標準化組織制定的環境管理體系標準，強調環境保護與持續改善。',
    requirements: [
      {
        text: '建立環境管理政策',
        documents: [
          { name: '環境政策聲明', description: '公司對環境保護的承諾與政策' }
        ]
      },
      {
        text: '進行環境影響評估',
        documents: [
          { name: '環境影響評估報告', description: '企業營運對環境影響的評估分析' }
        ]
      },
      {
        text: '建立環境監測與改善計劃',
        documents: [
          { name: '環境監測報告', description: '定期環境監測數據與分析' },
          { name: '環境改善計劃', description: '環境績效改善的具體行動計劃' }
        ]
      }
    ]
  },
  {
    id: 'iso45001',
    displayName: 'ISO 45001 職業安全衛生模板',
    description: 'ISO 45001 是國際職業安全衛生管理系統標準，強調預防工作場所的傷害和疾病。',
    requirements: [
      {
        text: '建立職業安全衛生政策',
        documents: [
          { name: '職安衛政策', description: '公司對職業安全衛生的政策與承諾' }
        ]
      },
      {
        text: '進行風險評估與危害識別',
        documents: [
          { name: '風險評估報告', description: '工作場所危害識別與風險評估' }
        ]
      },
      {
        text: '建立安全管理程序',
        documents: [
          { name: '安全作業程序', description: '各項作業的安全操作程序' },
          { name: '事故應變計劃', description: '緊急事故的應變處理程序' }
        ]
      }
    ]
  },
  {
    id: 'sa8000',
    displayName: 'SA8000 社會責任認證模板',
    description: 'SA8000 是國際社會責任標準，強調勞工權益、工作條件和社會責任。',
    requirements: [
      {
        text: '建立社會責任政策',
        documents: [
          { name: '社會責任政策', description: '公司對社會責任的承諾與政策' }
        ]
      },
      {
        text: '確保勞工權益保護',
        documents: [
          { name: '勞工權益保護措施', description: '保護員工權益的具體措施與程序' }
        ]
      },
      {
        text: '建立申訴機制',
        documents: [
          { name: '員工申訴程序', description: '員工意見反映與申訴處理程序' }
        ]
      }
    ]
  },
  {
    id: 'bsci',
    displayName: 'BSCI 商業社會責任認證模板',
    description: 'BSCI（商業社會責任倡議）是歐洲對外貿易協會推動的供應鏈社會責任標準。',
    requirements: [
      {
        text: '建立社會責任管理系統',
        documents: [
          { name: 'BSCI管理手冊', description: 'BSCI標準的管理系統文件' }
        ]
      },
      {
        text: '進行供應商評估',
        documents: [
          { name: '供應商評估報告', description: '對供應商社會責任的評估結果' }
        ]
      }
    ]
  },
  {
    id: 'fsc',
    displayName: 'FSC 森林管理委員會認證模板',
    description: 'FSC（森林管理委員會）認證確保森林資源的可持續管理和利用。',
    requirements: [
      {
        text: '建立森林管理計劃',
        documents: [
          { name: '森林管理計劃', description: '可持續森林管理的具體計劃' }
        ]
      },
      {
        text: '建立監管鏈管理',
        documents: [
          { name: '監管鏈文件', description: '產品從森林到消費者的追蹤管理' }
        ]
      }
    ]
  },
  {
    id: 'ctpat',
    displayName: 'C-TPAT 海關-商貿反恐夥伴計畫模板',
    description: 'C-TPAT（海關-商貿反恐夥伴計畫）是美國海關推動的供應鏈安全認證，強調貨物運輸安全與反恐措施。',
    requirements: [
      {
        text: '建立供應鏈安全政策',
        documents: [
          { name: '供應鏈安全政策', description: '公司針對供應鏈安全的政策文件' }
        ]
      },
      {
        text: '落實人員背景查核與培訓',
        documents: [
          { name: '人員背景查核紀錄', description: '員工背景調查與查核紀錄' },
          { name: '安全培訓記錄', description: '針對反恐與安全的教育訓練紀錄' }
        ]
      },
      {
        text: '完善貨物運輸與倉儲安全措施',
        documents: [
          { name: '貨物運輸安全計劃', description: '貨物運輸過程的安全管理措施說明' }
        ]
      }
    ]
  }
];

/**
 * 獲取所有認證模板
 * @returns {Array} 所有認證模板列表
 */
export const getTemplates = () => {
  return [...certificationTemplates];
};

/**
 * 根據ID獲取特定模板
 * @param {string} id - 模板ID
 * @returns {Object|null} 找到的模板對象，如果未找到則返回null
 */
export const getTemplateById = (id) => {
  return certificationTemplates.find(template => template.id === id) || null;
};

/**
 * 獲取模板選項列表（用於下拉選單）
 * @returns {Array<{id: string, name: string}>} 格式化的模板選項列表
 */
export const getTemplateOptions = () => {
  return certificationTemplates.map(template => ({
    id: template.id,
    name: template.displayName
  }));
};

/**
 * 創建新模板
 * @param {Object} templateData - 新模板數據
 * @returns {boolean} 創建成功返回true
 */
export const createTemplate = (templateData) => {
  try {
    const newTemplate = {
      id: templateData.certId,
      displayName: templateData.displayName || templateData.certId,
      description: templateData.description || '',
      requirements: templateData.requirements || []
    };
    
    certificationTemplates.push(newTemplate);
    return true;
  } catch (error) {
    console.error('創建模板時發生錯誤:', error);
    return false;
  }
};

/**
 * 更新模板
 * @param {string} id - 模板ID
 * @param {Object} templateData - 更新的模板數據
 * @returns {boolean} 更新成功返回true
 */
export const updateTemplate = (id, templateData) => {
  try {
    const index = certificationTemplates.findIndex(template => template.id === id);
    if (index !== -1) {
      certificationTemplates[index] = {
        ...certificationTemplates[index],
        ...templateData
      };
      return true;
    }
    return false;
  } catch (error) {
    console.error('更新模板時發生錯誤:', error);
    return false;
  }
};

/**
 * 刪除模板
 * @param {string} id - 模板ID
 * @returns {boolean} 刪除成功返回true
 */
export const deleteTemplate = (id) => {
  try {
    const index = certificationTemplates.findIndex(template => template.id === id);
    if (index !== -1) {
      certificationTemplates.splice(index, 1);
      return true;
    }
    return false;
  } catch (error) {
    console.error('刪除模板時發生錯誤:', error);
    return false;
  }
};

