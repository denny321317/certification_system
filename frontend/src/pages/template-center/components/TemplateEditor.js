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

const TemplateEditor = ({ onClose }) => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [templateInfo, setTemplateInfo] = useState({
    name: '',
    category: '',
    description: '',
    certificationStandard: '',
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
  };

  const handleAddComponent = (componentType) => {
    const newComponent = {
      id: `component-${Date.now()}`,
      ...componentTypes[componentType],
      props: { ...componentTypes[componentType].defaultProps }
    };
    setComponents([...components, newComponent]);
  };

  const handleDeleteComponent = (index) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
    setSelectedComponent(null);
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
  };

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
            <Droppable droppableId="template-components" type="TEMPLATE_COMPONENT">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="template-components"
                  data-rbd-droppable-id="template-components"
                  data-rbd-droppable-context-id={provided.droppableProps['data-rbd-droppable-context-id']}
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
                      type="TEMPLATE_COMPONENT"
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          data-rbd-draggable-id={component.id}
                          data-rbd-draggable-context-id={provided.draggableProps['data-rbd-draggable-context-id']}
                          className={`component-wrapper ${
                            selectedComponent?.id === component.id ? 'selected' : ''
                          } ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => handleComponentSelect(component)}
                        >
                          <div className="component-header" {...provided.dragHandleProps}>
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