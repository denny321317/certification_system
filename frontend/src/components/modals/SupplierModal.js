import React, { useEffect, useState } from 'react';
import './SupplierModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const CERT_STATUS = ['CERTIFICATED', 'UNDER_CERTIFICATION', 'NOT_CERTIFICATED'];
const RISK_PROFILE = ['LOW', 'MEDIUM', 'HIGH'];
const COMMON_CERTS = ['SMETA', 'ISO 14001', 'ISO 9001'];

const sanitizeText = (s = '') =>
  s.replace(/\u00A0/g, ' ')       // non-breaking space → 空白
   .replace(/\t/g, ' ')           // tab → 空白
   .replace(/\s+/g, ' ')          // 多個空白壓成一個
   .trim();

const sanitizePhone = (s = '') =>
  sanitizeText(s).replace(/[^\d+\-()\s]/g, ''); // 僅保留 + - ( ) 空白 與數字

const onPasteSanitized = (e) => {
  e.preventDefault();
  const raw = (e.clipboardData || window.clipboardData).getData('text');
  const cleaned = sanitizeText(raw);
  const target = e.target;
  const start = (target.selectionStart != null) ? target.selectionStart : target.value.length;
  const end = (target.selectionEnd != null) ? target.selectionEnd : start;
  const next = target.value.slice(0, start) + cleaned + target.value.slice(end);
  target.value = next;
  // 觸發 React onChange 讓 state 同步
  const ev = new Event('input', { bubbles: true });
  target.dispatchEvent(ev);
};

export default function SupplierModal({
  open,
  mode,              // 'view' | 'edit' | 'create'
  supplier,
  canWrite,
  onClose,
  onSave,
}) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const [form, setForm] = useState({
    id: null,
    name: '',
    type: '',
    product: '',
    country: '',
    address: '',
    telephone: '',
    email: '',
    collabStart: '', // YYYY-MM-DD
    certificateStatus: 'UNDER_CERTIFICATION',
    riskProfile: 'MEDIUM',
    selectedCerts: [],   
    otherCert: '',       

  });

  const [errors, setErrors] = useState({});
  const EMPTY_FORM = {
  id: null,
  name: '',
  type: '',
  product: '',
  country: '',
  address: '',
  telephone: '',
  email: '',
  collabStart: '', // yyyy-MM-dd
  certificateStatus: 'UNDER_CERTIFICATION',
  riskProfile: 'MEDIUM',
  selectedCerts: [],
  otherCert: '',

};

  useEffect(() => {
  if (!open) return;

  // ★ 新增模式：無論父層有沒有塞 supplier 物件，都強制清空
  if (mode === 'create') {
    setForm(EMPTY_FORM);
    setErrors({});
    return;
  }

  // 安全防呆：若沒有 supplier（理論上不會發生），也清空
  if (!supplier) {
    setForm(EMPTY_FORM);
    setErrors({});
    return;
  }

  // 編輯/檢視：載入這一筆的資料；依賴只看 id，所以不會在你打字時覆蓋
  setForm({
    id: supplier.id ?? null,
    name: sanitizeText(supplier.name ?? ''),
    type: sanitizeText(supplier.type ?? ''),
    product: sanitizeText(supplier.product ?? ''),
    country: sanitizeText(supplier.location || supplier.country || ''),
    address: sanitizeText(supplier.address ?? ''),
    telephone: sanitizePhone(supplier.telephone ?? ''),
    email: sanitizeText(supplier.email ?? ''),
    collabStart: (supplier.collabStart || '') ? toDateInputValue(supplier.collabStart) : '',
    certificateStatus: (supplier.certificateStatus || 'UNDER_CERTIFICATION').toUpperCase(),
    riskProfile: (supplier.riskProfile || 'MEDIUM').toUpperCase(),
    selectedCerts: Array.isArray(supplier.commonCerts) ? supplier.commonCerts : [],
    otherCert: sanitizeText(supplier.otherCertification || ''),

  });
    setErrors({});
  }, [open, supplier, mode]);

  if (!open) return null;

  const title = isView ? '查看供應商' : isEdit ? '編輯供應商' : '新增供應商';
  const readOnly = isView;

      
    const handleChange = (e) => {
      const { name, value } = e.target;

      const cleaned =
        name === 'telephone' ? sanitizePhone(value) :
        name === 'collabStart' ? value :
        sanitizeText(value);

      setForm((f) => ({ ...f, [name]: cleaned }));
    }; 

   
    const toggleCert = (cert) => {
      if (readOnly) return;
      setForm((f) => {
        const has = f.selectedCerts.includes(cert);
        const next = has
          ? f.selectedCerts.filter((c) => c !== cert)
          : [...f.selectedCerts, cert];
        return { ...f, selectedCerts: next }; 
      });
    };

    const handleOtherCertChange = (e) => {
      if (readOnly) return;
      const v = sanitizeText(e.target.value);
      setForm((f) => ({ ...f, otherCert: v }));
    };


  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = '必填';
    if (!form.country.trim()) nextErrors.country = '必填';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

      const payload = {
    ...form,
    name: sanitizeText(form.name),
    type: sanitizeText(form.type),
    product: sanitizeText(form.product),
    country: sanitizeText(form.country),
    address: sanitizeText(form.address),
    telephone: sanitizePhone(form.telephone),
    email: sanitizeText(form.email),
    // 這裡保留 yyyy-MM-dd；若父層/後端要 epoch 再由父層轉換
    collabStart: form.collabStart || '',
    certificateStatus: String(form.certificateStatus || '').toUpperCase(),
    riskProfile: String(form.riskProfile || '').toUpperCase(),
    location: sanitizeText(form.country),
    commonCerts: Array.isArray(form.selectedCerts) ? form.selectedCerts : [],
    otherCertification: sanitizeText(form.otherCert || ''),

    };
    
    onSave?.(payload);
  };

  const closeOnBackdrop = (e) => {
    if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('supplier-modal')) {
      onClose?.();
    }
  };

  return (
    <div className="modal-backdrop supplier-modal" onMouseDown={closeOnBackdrop}>
      <div className="modal-card supplier-modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button
            type="button"
            className="icon-btn close-btn"
            onClick={onClose}
            aria-label="關閉"
            title="關閉"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="modal-body">
            <div className="grid-2">
              <Field label="供應商名稱" error={errors.name}>
                <input name="name" value={form.name} onChange={handleChange} disabled={readOnly} onPaste={onPasteSanitized}/>
              </Field>

              <Field label="國家 (ISO 代碼)" error={errors.country}>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  disabled={readOnly}
                  placeholder="TW / US / CN / VN ..."
                  onPaste={onPasteSanitized}
                />
              </Field>

              <Field label="類別">
                <input name="type" value={form.type} onChange={handleChange} disabled={readOnly} onPaste={onPasteSanitized}/>
              </Field>

              <Field label="供應產品">
                <input name="product" value={form.product} onChange={handleChange} disabled={readOnly} onPaste={onPasteSanitized} autoComplete="off" />
              </Field>

              <Field label="聯絡地址">
                <input name="address" value={form.address} onChange={handleChange} disabled={readOnly} onPaste={onPasteSanitized}/>
              </Field>

              <Field label="電話">
                <input name="telephone" value={form.telephone} onChange={handleChange} disabled={readOnly} onPaste={onPasteSanitized}/>
              </Field>

              <Field label="Email">
                <input type="email" name="email" value={form.email} onChange={handleChange} disabled={readOnly} onPaste={onPasteSanitized} />
              </Field>

              <Field label="合作起始日">
                <input
                  type="date"
                  name="collabStart"
                  value={form.collabStart}
                  onChange={handleChange}
                  disabled={readOnly}
                  onPaste={onPasteSanitized}
                />
              </Field>

              <Field label="認證狀態">
                <select
                  name="certificateStatus"
                  value={form.certificateStatus}
                  onChange={handleChange}
                  disabled={readOnly}
                >
                  {CERT_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="風險等級">
                <select name="riskProfile" value={form.riskProfile} onChange={handleChange} disabled={readOnly}>
                  {RISK_PROFILE.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
                        {/* 認證選擇區（常見勾選＋其他輸入） */}
            <div className="cert-section mt-3">
              <h6 className="mb-2">認證項目</h6>

              {/* 常見認證勾選 */}
              <div className="cert-list">
                {COMMON_CERTS.map((cert) => {
                  const checked = form.selectedCerts.includes(cert);
                  return (
                    <label key={cert} className={`cert-chip ${checked ? 'is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCert(cert)}
                      disabled={readOnly}
                      className="sr-only"
                      aria-pressed={checked}
                    />
                    <span className="cert-icon">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className="cert-text">{cert}</span>
                  </label>


                  );
                })}
              </div>

              {/* 其他認證（自由輸入） */}
              <div className="mt-2">
                <label className="field">
                  <span className="field-label">其他認證（選填）</span>
                  <input
                    name="otherCert"
                    value={form.otherCert}
                    onChange={handleOtherCertChange}
                    disabled={readOnly}
                    placeholder="例如：RBA、SA8000、ISO 45001..."
                    onPaste={onPasteSanitized}
                  />
                </label>
              </div>
            </div>

            {errors.perm && <div className="error mt-2">{errors.perm}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              取消
            </button>
            {!isView && (
              <button type="submit" className="btn btn-primary">
                儲存
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label} {error && <em className="error">({error})</em>}
      </span>
      {children}
    </label>
  );
}

function toDateInputValue(v) {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return '';
  }
}

