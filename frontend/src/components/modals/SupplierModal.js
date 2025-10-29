import React, { useEffect, useState } from 'react';
import './SupplierModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const CERT_STATUS = ['CERTIFICATED', 'UNDER_CERTIFICATION', 'NOT_CERTIFICATED'];
const RISK_PROFILE = ['LOW', 'MEDIUM', 'HIGH'];

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
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      setForm({
        id: supplier.id ?? null,
        name: supplier.name ?? '',
        type: supplier.type ?? '',
        product: supplier.product ?? '',
        country: supplier.location || supplier.country || '',
        address: supplier.address ?? '',
        telephone: supplier.telephone ?? '',
        email: supplier.email ?? '',
        collabStart: (supplier.collabStart || '') ? toDateInputValue(supplier.collabStart) : '',
        certificateStatus: supplier.certificateStatus || 'UNDER_CERTIFICATION',
        riskProfile: supplier.riskProfile || 'MEDIUM',
      });
    } else {
      setForm((prev) => ({ ...prev, id: null }));
    }
    setErrors({});
  }, [open, supplier, mode]);

  if (!open) return null;

  const title = isView ? '查看供應商' : isEdit ? '編輯供應商' : '新增供應商';
  const readOnly = isView;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = '必填';
    if (!form.country.trim()) nextErrors.country = '必填';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = { ...form, location: form.country };
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <Field label="供應商名稱" error={errors.name}>
                <input name="name" value={form.name} onChange={handleChange} disabled={readOnly} />
              </Field>

              <Field label="國家 (ISO 代碼)" error={errors.country}>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  disabled={readOnly}
                  placeholder="TW / US / CN / VN ..."
                />
              </Field>

              <Field label="類別">
                <input name="type" value={form.type} onChange={handleChange} disabled={readOnly} />
              </Field>

              <Field label="供應產品">
                <input name="product" value={form.product} onChange={handleChange} disabled={readOnly} />
              </Field>

              <Field label="聯絡地址">
                <input name="address" value={form.address} onChange={handleChange} disabled={readOnly} />
              </Field>

              <Field label="電話">
                <input name="telephone" value={form.telephone} onChange={handleChange} disabled={readOnly} />
              </Field>

              <Field label="Email">
                <input type="email" name="email" value={form.email} onChange={handleChange} disabled={readOnly} />
              </Field>

              <Field label="合作起始日">
                <input
                  type="date"
                  name="collabStart"
                  value={form.collabStart}
                  onChange={handleChange}
                  disabled={readOnly}
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
