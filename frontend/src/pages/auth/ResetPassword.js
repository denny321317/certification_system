import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEye, faEyeSlash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const ResetPassword = () => {
  const { resetPassword } = useContext(AuthContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // 從 URL 參數中獲取重置令牌
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get('token');
    
    if (!resetToken) {
      setError('無效的重置連結。請嘗試重新請求密碼重置');
      return;
    }
    
    setToken(resetToken);
  }, [location]);
  
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  };
  
  const getPasswordStrengthScore = () => {
    const { length, uppercase, lowercase, number, special } = passwordStrength;
    return (length ? 1 : 0) + (uppercase ? 1 : 0) + (lowercase ? 1 : 0) + (number ? 1 : 0) + (special ? 1 : 0);
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    checkPasswordStrength(e.target.value);
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const renderPasswordStrength = () => {
    const score = getPasswordStrengthScore();
    let label, variant;
    
    if (score <= 2) {
      label = '弱';
      variant = 'danger';
    } else if (score <= 3) {
      label = '中';
      variant = 'warning';
    } else {
      label = '強';
      variant = 'success';
    }
    
    return (
      <div className="mt-2">
        <div className="d-flex align-items-center mb-1">
          <div className="me-3" style={{ width: '100%' }}>
            <div className="progress" style={{ height: '6px' }}>
              <div 
                className={`progress-bar bg-${variant}`} 
                role="progressbar" 
                style={{ width: `${(score / 5) * 100}%` }} 
                aria-valuenow={score} 
                aria-valuemin="0" 
                aria-valuemax="5"
              />
            </div>
          </div>
          <span className={`text-${variant} small`}>{label}</span>
        </div>
        
        <div className="small">
          <div className={passwordStrength.length ? 'text-success' : 'text-muted'}>
            <FontAwesomeIcon icon={passwordStrength.length ? faCheck : faTimes} className="me-1" />
            至少8個字符
          </div>
          <div className={passwordStrength.uppercase ? 'text-success' : 'text-muted'}>
            <FontAwesomeIcon icon={passwordStrength.uppercase ? faCheck : faTimes} className="me-1" />
            至少1個大寫字母
          </div>
          <div className={passwordStrength.number ? 'text-success' : 'text-muted'}>
            <FontAwesomeIcon icon={passwordStrength.number ? faCheck : faTimes} className="me-1" />
            至少1個數字
          </div>
          <div className={passwordStrength.special ? 'text-success' : 'text-muted'}>
            <FontAwesomeIcon icon={passwordStrength.special ? faCheck : faTimes} className="me-1" />
            至少1個特殊字符
          </div>
        </div>
      </div>
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('密碼與確認密碼不匹配');
      return;
    }
    
    if (getPasswordStrengthScore() < 3) {
      setError('密碼強度不足，請遵循建議的密碼要求');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || '重設密碼失敗，請稍後再試');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="auth-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="auth-logo mb-3">
                    <FontAwesomeIcon icon={faShieldAlt} size="2x" />
                  </div>
                  <h4 className="mb-0">重設密碼</h4>
                  <p className="text-muted mt-2">請設置您的新密碼</p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && (
                  <Alert variant="success">
                    密碼已成功重設！正在重定向到登入頁面...
                  </Alert>
                )}
                
                {!success && (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3 position-relative">
                      <Form.Label>新密碼</Form.Label>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="請輸入您的新密碼"
                        required
                      />
                      <div 
                        className="password-toggle" 
                        onClick={toggleShowPassword}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </div>
                      {password && renderPasswordStrength()}
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>確認密碼</Form.Label>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="請再次輸入密碼"
                        required
                      />
                      {password && confirmPassword && 
                        password !== confirmPassword && (
                        <Form.Text className="text-danger">
                          密碼與確認密碼不匹配
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? '處理中...' : '重設密碼'}
                    </Button>
                    
                    <div className="text-center">
                      <Link to="/login" className="text-primary">
                        返回登入頁面
                      </Link>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword; 