import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileUpload,
  faFileSignature,
  faClipboardList,
  faTable,
  faImage,
  faCalendar,
  faGripVertical,
  faTrash,
  faCog,
  faSave,
  faInfoCircle,
  faExclamationTriangle,
  faTimes,
  faGear
} from '@fortawesome/free-solid-svg-icons';
import './TemplateEditor.css';

/**
 * 模板編輯器組件
 * 
 * 此組件提供認證文件模板的可視化編輯功能，包含：
 * 1. 拖放式組件管理
 * 2. 組件屬性編輯
 * 3. 模板基本信息設置
 * 4. 即時預覽
 * 
 * 特點：
 * - 支持多種認證組件（文件上傳、表單、清單等）
 * - 提供組件的拖放排序
 * - 支持組件屬性的動態配置
 * - 即時預覽模板效果
 * 
 * 使用方式：
 * ```jsx
 * <TemplateEditor onClose={handleClose} />
 * ```
 */

/**
 * 可用的組件類型定義
 * @type {Object.<string, {
 *   type: string,       // 組件類型標識
 *   icon: IconDefinition, // 組件圖標
 *   label: string,      // 組件顯示名稱
 *   defaultProps: Object // 組件默認屬性
 * }>}
 */
const componentTypes = {
  documentUpload: {
    type: 'documentUpload',
    icon: faFileUpload,
    label: '文件上傳',
    defaultProps: { 
      title: '請上傳文件',
      description: '請描述所需文件',
      required: true,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSize: 10, // MB
      requirements: []
    }
  },
  certificationForm: {
    type: 'certificationForm',
    icon: faFileSignature,
    label: '認證表單',
    defaultProps: {
      title: '認證表單標題',
      fields: [
        { type: 'text', label: '公司名稱', required: true },
        { type: 'text', label: '聯絡人', required: true },
        { type: 'email', label: '電子郵件', required: true }
      ]
    }
  },
  checkList: {
    type: 'checkList',
    icon: faClipboardList,
    label: '檢查清單',
    defaultProps: {
      title: '合規檢查清單',
      items: [
        { text: '檢查項目 1', required: true },
        { text: '檢查項目 2', required: true }
      ]
    }
  },
  complianceTable: {
    type: 'complianceTable',
    icon: faTable,
    label: '合規對照表',
    defaultProps: {
      title: '合規要求對照表',
      headers: ['認證要求', '符合狀態', '證明文件', '備註'],
      rows: [['', '符合/不符合/部分符合', '', '']]
    }
  },
  evidenceUpload: {
    type: 'evidenceUpload',
    icon: faImage,
    label: '證明文件',
    defaultProps: {
      title: '證明文件上傳',
      description: '請上傳相關證明文件',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'png'],
      maxSize: 5,
      examples: []
    }
  },
  deadline: {
    type: 'deadline',
    icon: faCalendar,
    label: '時程管理',
    defaultProps: {
      title: '時程節點',
      dueDate: '',
      reminder: 7, // 提前提醒天數
      priority: 'medium'
    }
  }
};

/**
 * 模板編輯器組件
 * @param {Object} props - 組件屬性
 * @param {Function} props.onClose - 關閉編輯器的回調函數
 * @returns {JSX.Element} 模板編輯器介面
 */
const TemplateEditor = ({ onClose }) => {
  /**
   * 模板組件列表狀態
   * @type {[Array<Object>, Function]} [組件列表, 設置組件列表的函數]
   */
  const [components, setComponents] = useState([]);

  /**
   * 當前選中的組件狀態
   * @type {[Object|null, Function]} [當前選中的組件, 設置選中組件的函數]
   */
  const [selectedComponent, setSelectedComponent] = useState(null);

  /**
   * 模板基本信息狀態
   * @type {[Object, Function]} [模板信息, 設置模板信息的函數]
   */
  const [templateInfo, setTemplateInfo] = useState({
    name: '',
    category: '',
    description: '',
    certificationStandard: '',
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  
  /**
   * 處理組件拖放結束事件
   * @param {Object} result - 拖放結果對象
   */
  const handleDragEnd = (result) => {
    // 拖曳取消或無目標位置時，不進行操作
    if (!result.destination) return;

    // 同一位置拖曳時，不進行操作
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }

    // 複製組件列表，避免直接修改狀態
    const newComponents = Array.from(components);
    // 移除源位置的組件
    const [movedItem] = newComponents.splice(result.source.index, 1);
    // 插入到目標位置
    newComponents.splice(result.destination.index, 0, movedItem);
    
    // 更新組件列表狀態
    setComponents(newComponents);
  };

  /**
   * 添加新組件到模板
   * @param {string} componentType - 要添加的組件類型
   */
  const handleAddComponent = (componentType) => {
    const newComponent = {
      id: `component-${Date.now()}`,
      ...componentTypes[componentType],
      props: { ...componentTypes[componentType].defaultProps }
    };
    setComponents([...components, newComponent]);
  };

  /**
   * 從模板中刪除組件
   * @param {number} index - 要刪除的組件索引
   */
  const handleDeleteComponent = (index) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
    setSelectedComponent(null);
  };

  /**
   * 選中組件進行編輯
   * @param {Object} component - 要編輯的組件對象
   */
  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

  /**
   * 更新組件屬性
   * @param {string} property - 要更新的屬性名
   * @param {any} value - 新的屬性值
   */
  const handlePropertyChange = (property, value) => {
    if (!selectedComponent) return;

    const updatedComponents = components.map(comp => {
      if (comp.id === selectedComponent.id) {
        return {
          ...comp,
          props: {
            ...comp.props,
            [property]: value
          }
        };
      }
      return comp;
    });

    setComponents(updatedComponents);
    setSelectedComponent({
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        [property]: value
      }
    });
  };

  /**
   * 渲染組件預覽
   * @param {Object} component - 要渲染的組件對象
   * @returns {JSX.Element|null} 組件預覽元素
   */
  const renderComponent = (component) => {
    switch (component.type) {
      case 'documentUpload':
        return (
          <div className="document-upload-preview">
            <h6>{component.props.title}</h6>
            <p className="text-muted">{component.props.description}</p>
            <div className="requirements-list">
              {component.props.requirements.map((req, index) => (
                <div key={index} className="requirement-item">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  {req}
                </div>
              ))}
            </div>
            <div className="upload-info">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              允許格式: {component.props.acceptedFormats.join(', ')}
              <br />
              最大檔案大小: {component.props.maxSize}MB
            </div>
          </div>
        );
      case 'certificationForm':
        return (
          <div className="certification-form-preview">
            <h6>{component.props.title}</h6>
            <div className="form-fields">
              {component.props.fields.map((field, index) => (
                <div key={index} className="form-field-preview">
                  <label>{field.label}</label>
                  <input type={field.type} placeholder={`請輸入${field.label}`} disabled />
                  {field.required && <span className="required-badge">必填</span>}
                </div>
              ))}
            </div>
          </div>
        );
      case 'checkList':
        return (
          <div className="checklist-preview">
            <h6>{component.props.title}</h6>
            <div className="checklist-items">
              {component.props.items.map((item, index) => (
                <div key={index} className="checklist-item">
                  <input type="checkbox" disabled />
                  <span>{item.text}</span>
                  {item.required && <span className="required-badge">必填</span>}
                </div>
              ))}
            </div>
          </div>
        );
      case 'complianceTable':
        return (
          <div className="compliance-table-preview">
            <h6>{component.props.title}</h6>
            <table className="table">
              <thead>
                <tr>
                  {component.props.headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {component.props.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * 處理拖放錯誤
   * @param {Error} error - 錯誤對象
   */
  const handleDragError = (error) => {
    console.error('拖放操作出現錯誤:', error);
    // 可以在這裡實現錯誤處理邏輯，如顯示錯誤提示等
  };

  return (
    <div className="template-editor">
      {/* 頂部標題欄 */}
      <div className="editor-title-bar">
        <div className="editor-title">
          <FontAwesomeIcon icon={faGear} className="title-icon" />
          <span>{templateInfo.name || '組件認證名模板'}</span>
          <span className="template-version">v{templateInfo.version}</span>
        </div>
        <div className="editor-meta">
          <span>最後更新：{templateInfo.lastUpdated}</span>
          <span className="divider">|</span>
          <span>認證標準：{templateInfo.certificationStandard || '未設定'}</span>
        </div>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* 主要內容區域 */}
      <div className="editor-main">
        {/* 左側：模板資訊和組件工具箱 */}
        <div className="template-sidebar">
          <div className="template-info-section">
            <h6 className="section-title">模板資訊</h6>
            <div className="template-info-form">
              <div className="form-group">
                <label>模板名稱</label>
                <input
                  type="text"
                  className="form-control"
                  value={templateInfo.name}
                  onChange={(e) => setTemplateInfo({...templateInfo, name: e.target.value})}
                  placeholder="輸入模板名稱"
                />
              </div>
              <div className="form-group">
                <label>認證標準</label>
                <input
                  type="text"
                  className="form-control"
                  value={templateInfo.certificationStandard}
                  onChange={(e) => setTemplateInfo({...templateInfo, certificationStandard: e.target.value})}
                  placeholder="例如：SMETA 2-Pillar"
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  className="form-control"
                  value={templateInfo.description}
                  onChange={(e) => setTemplateInfo({...templateInfo, description: e.target.value})}
                  placeholder="描述此模板的用途和要求"
                />
              </div>
            </div>
          </div>

          <div className="component-toolbox">
            <h6 className="section-title">認證要求組件</h6>
            <div className="component-list">
              {Object.values(componentTypes).map((component) => (
                <div
                  key={component.type}
                  className="component-item"
                  onClick={() => handleAddComponent(component.type)}
                >
                  <FontAwesomeIcon icon={component.icon} />
                  <span>{component.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中間：編輯區域 */}
        <div className="editor-content">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable 
              droppableId="template-components-list"
              isDropDisabled={false}
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`template-components ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  {components.length === 0 && (
                    <div className="empty-editor-message">
                      <p>請從左側選擇組件來開始建立模板</p>
                    </div>
                  )}
                  
                  {components.map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`component-wrapper ${
                            selectedComponent?.id === component.id ? 'selected' : ''
                          } ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => handleComponentSelect(component)}
                        >
                          <div className="component-header">
                            <FontAwesomeIcon icon={faGripVertical} className="drag-handle" />
                            <span>{component.label}</span>
                            <div className="component-actions">
                              <button
                                className="btn-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComponent(index);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                          <div className="component-content">
                            {renderComponent(component)}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* 右側：屬性面板 */}
        <div className="properties-panel">
          <h6 className="panel-title">
            <FontAwesomeIcon icon={faCog} className="me-2" />
            組件屬性
          </h6>
          {selectedComponent ? (
            <div className="properties-form">
              {Object.entries(selectedComponent.props).map(([key, value]) => (
                <div key={key} className="property-item">
                  <label>{key}</label>
                  {Array.isArray(value) ? (
                    <div className="array-property">
                      {value.map((item, index) => (
                        <input
                          key={index}
                          type="text"
                          value={typeof item === 'string' ? item : item.text || item.label || ''}
                          onChange={(e) => {
                            const newValue = [...value];
                            if (typeof item === 'string') {
                              newValue[index] = e.target.value;
                            } else if (item.text !== undefined) {
                              newValue[index] = { ...item, text: e.target.value };
                            } else if (item.label !== undefined) {
                              newValue[index] = { ...item, label: e.target.value };
                            }
                            handlePropertyChange(key, newValue);
                          }}
                          className="form-control"
                        />
                      ))}
                      <button
                        className="btn btn-sm btn-outline-primary mt-2"
                        onClick={() => {
                          let newItem;
                          if (typeof value[0] === 'string') {
                            newItem = '';
                          } else if (value[0].text !== undefined) {
                            newItem = { text: '', required: false };
                          } else if (value[0].label !== undefined) {
                            newItem = { type: 'text', label: '', required: false };
                          } else {
                            newItem = '';
                          }
                          const newValue = [...value, newItem];
                          handlePropertyChange(key, newValue);
                        }}
                      >
                        新增項目
                      </button>
                    </div>
                  ) : (
                    <input
                      type={typeof value === 'boolean' ? 'checkbox' : 'text'}
                      checked={typeof value === 'boolean' ? value : undefined}
                      value={typeof value === 'boolean' ? undefined : value}
                      onChange={(e) => handlePropertyChange(
                        key,
                        typeof value === 'boolean' ? e.target.checked : e.target.value
                      )}
                      className="form-control"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">請選擇一個組件來編輯其屬性</p>
          )}
        </div>
      </div>

      {/* 保存按鈕 */}
      <button className="save-button">
        <FontAwesomeIcon icon={faSave} className="me-2" />
        保存模板
      </button>
    </div>
  );
};

export default TemplateEditor; 