import React, { useState, useContext} from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from '../../contexts/AuthContext';  // 引入 AuthContext
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('請輸入您的電子郵件地址');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || '無法發送重置密碼電子郵件，請稍後再試');
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
                  <h4 className="mb-0">忘記密碼</h4>
                  <p className="text-muted mt-2">輸入您的電子郵件以重設密碼</p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && (
                  <Alert variant="success">
                    重置密碼的連結已發送到您的電子郵件地址。請查看您的收件箱，按照指示重設密碼。
                  </Alert>
                )}
                
                {!success ? (
                  <Form onSubmit={handleSubmit}>
                    <div className="mb-4 text-center">
                      <div className="mb-3">
                        <FontAwesomeIcon icon={faEnvelope} size="3x" className="text-muted" />
                      </div>
                      <p>請輸入您註冊時使用的電子郵件地址，我們將向您發送重設密碼的連結。</p>
                    </div>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>電子郵件</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="請輸入您的電子郵件"
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? '發送中...' : '發送重設連結'}
                    </Button>
                    
                    <div className="text-center">
                      <Link to="/login" className="text-primary">
                        返回登入頁面
                      </Link>
                    </div>
                  </Form>
                ) : (
                  <div className="text-center mt-4">
                    <Button 
                      as={Link} 
                      to="/login" 
                      variant="outline-primary" 
                      className="mt-2"
                    >
                      返回登入頁面
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword; 