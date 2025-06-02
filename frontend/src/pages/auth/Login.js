import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('登錄時發生錯誤，請稍後再試');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
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
                    disabled={loading}
                  >
                    {loading ? '登入中...' : '登入'}
                  </Button>
                  
                  <div className="text-center">
                    還沒有帳號？ <Link to="/register" className="text-decoration-none">立即註冊</Link>
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

export default Login; 