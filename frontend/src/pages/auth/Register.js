import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';

import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    role: '', 
    avatar: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, securitySettings, fetchSecuritySettings } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!securitySettings) {
      fetchSecuritySettings();
    }
  }, [securitySettings, fetchSecuritySettings]);


  const requirements = useMemo(() => {

    // FOR DEBUG
    console.log('Calculating requirements with these settings: ', securitySettings);


    if (!securitySettings) return [];
    const reqs = [];
    if (securitySettings.requireMinLength) {
      reqs.push({
        key: 'minLength',
        label: `至少 ${securitySettings.minLength} 個字元`,
        test: (pw) => pw.length >= securitySettings.minLength
      });
    }
    if (securitySettings.requireUpperLowerCase) {
      reqs.push({
        key: 'upperLower',
        label: '密碼需同時包含大小寫字母',
        test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw)
      });
    }
    if (securitySettings.requireNumber) {
      reqs.push({
        key: 'number',
        label: '密碼需包含至少一個數字',
        test: (pw) => /\d/.test(pw)
      });
    }
    if (securitySettings.requireSpecialChar) {
      reqs.push({
        key: 'special',
        label: '密碼需包含至少一個特殊字元',
        test: (pw) => /[^A-Za-z0-9]/.test(pw)
      });
    }
    return reqs;
  }, [securitySettings]);

  const allRequirementsMet = useMemo(() => {
    if (!formData.password) return false;
    return requirements.every(r => r.test(formData.password));
  }, [formData.password, requirements]);

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('請填寫所有必填欄位');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('密碼與確認密碼不匹配');
      return false;
    }
    
    if (!allRequirementsMet) {
      setError('密碼不符合所有安全要求');
      return false;
    }
    
    if (!formData.termsAccepted) {
      setError('您必須同意服務條款和隱私政策');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        password: formData.password
      });
      
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="auth-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="auth-logo mb-3">
                    <FontAwesomeIcon icon={faShieldAlt} size="2x" />
                  </div>
                  <h4 className="mb-0">企業認證資料整合系統</h4>
                  <p className="text-muted mt-2">建立新帳號</p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>姓名</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="請輸入您的姓名"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>電子郵件</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="請輸入您的電子郵件"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>部門</Form.Label>
                    <Form.Select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">請選擇部門</option>
                      <option value="it">資訊部</option>
                      <option value="qa">品質管理部</option>
                      <option value="compliance">合規部</option>
                      <option value="hr">人力資源部</option>
                      <option value="rd">研發部</option>
                      <option value="sales">業務部</option>
                      <option value="finance">財務部</option>
                      <option value="marketing">行銷部</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>職稱</Form.Label>
                    <Form.Control
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="請輸入您的職稱"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>密碼</Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="請設定密碼"
                      required
                    />
                    <div 
                      className="password-toggle" 
                      onClick={toggleShowPassword}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </div>
                  </Form.Group>
                  
                  {/* Password Requirements Display */}
                  {formData.password && requirements.length > 0 && (
                    <div className='password-requirements mb-3'>
                      <ul className='list-unstyled'>
                        {requirements.map(r => {
                          const met = r.test(formData.password);
                          return (
                            <li key={r.key} className={met ? 'text-success' : 'text-danger'}>
                              {met ? '✓' : '✗'} {r.label}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}




                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>確認密碼</Form.Label>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="請再次輸入密碼"
                      required
                    />
                    <div 
                      className="password-toggle" 
                      onClick={toggleShowConfirmPassword}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </div>
                    {formData.password && formData.confirmPassword && 
                      formData.password !== formData.confirmPassword && (
                      <Form.Text className="text-danger">
                        密碼與確認密碼不匹配
                      </Form.Text>
                    )}
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="termsAccepted"
                      name="termsAccepted"
                      label={<>我同意 <Link to="/terms" className="text-decoration-none">服務條款</Link> 和 <Link to="/privacy" className="text-decoration-none">隱私政策</Link></>}
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-100 mb-3"
                    disabled={loading || !allRequirementsMet}
                  >
                    {loading ? '註冊中...' : '註冊帳號'}
                  </Button>
                  
                  <div className="text-center">
                    已經有帳號？ <Link to="/login" className="text-decoration-none">登入</Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register; 