import React, { useState, useContext } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordChangeModal from '../../components/modals/PasswordChangeModal';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [securitySettings, setSecuritySettings] = useState(null);
  const [lockSeconds, setLockSeconds] = useState(0);


  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (lockSeconds <= 0) return;

    const id = setInterval(() => {
      setLockSeconds(s => {
        if (s <= 1) return 0;
        return s-1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [lockSeconds]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('請輸入電子郵件和密碼');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await login(email, password);
      
      if (result.success) {
        localStorage.setItem("userEmail", result.user.email);
        navigate('/dashboard', { replace: true });
      } else {
        if (result.error === 'password_change_required') {
          setSecuritySettings(result.securitySettings);
          setShowPasswordChangeModal(true);
          setError(''); // Clear login from error
        } else if (result.error === 'account_locked') {
          setLockSeconds(result.lockRemainingSeconds || 0);
          setError('因登入失敗次數過多，此帳號被暫時封鎖，請稍後再試');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('登錄時發生錯誤，請稍後再試');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* 
  const handlePasswordUpdate = async (newPassword) => {
    try {
      setLoading(true);
      setError('');
      const result = await forcePasswordUpdate(email, newPassword);
      if (result.success) {
        setShowPasswordChangeModal(false);
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error); // Show error inside the modal
      }
    } catch (error) {
      setError('更新密碼時發生錯誤')
    } finally {
      setLoading(false);
    }
  };
  */
  
  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <Card className="auth-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="auth-logo mb-3">
                    <FontAwesomeIcon icon={faShieldAlt} size="2x" />
                  </div>
                  <h4 className="mb-0">企業認證資料整合系統</h4>
                  <p className="text-muted mt-2">歡迎回來</p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>電子郵件</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="請輸入您的電子郵件"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>密碼</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="請輸入密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button"
                        className="password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </Form.Group>
                  
                  <div className="mb-4 d-flex justify-content-between align-items-center">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="記住我"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <Link to="/forgot-password" className="text-decoration-none">忘記密碼？</Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-100 mb-3"
                    disabled={loading || lockSeconds > 0}
                  >
                    {lockSeconds > 0 ? `鎖定中 (${lockSeconds}s)` : (loading ? '登入中...' : '登入')}

                  </Button>
                  {lockSeconds > 0 && (
                    <div style={{ marginTop: 8, color: '#b45309', fontSize: '0.9rem' }}>
                      帳號被鎖定，請等待 {lockSeconds} 秒後再試。
                    </div>
                  )}
                  
                  <div className="text-center">
                    還沒有帳號？ <Link to="/register" className="text-decoration-none">立即註冊</Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <PasswordChangeModal
        open={showPasswordChangeModal && !!securitySettings}
        onClose={() => { 
          setShowPasswordChangeModal(false);
          setSecuritySettings(null);
        }}
        securitySettings={securitySettings}
        username={email}
        oldPassword={password}
      />
    </div>
  );
};

export default Login; 