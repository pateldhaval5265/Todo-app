import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import './Auth.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        'https://jobs-api-g0fe.onrender.com/api/v1/auth/login',
        values
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      message.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      message.error(err.response?.data?.msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell">
        <div className="auth-hero">
          <span className="auth-badge">Personal Task Manager</span>
          <Title level={2} className="auth-hero-title">
            Organize your day with a calm, focused workspace.
          </Title>
          <Text className="auth-hero-text">
            Keep every task, deadline, and win in one place. Designed to feel
            premium on your portfolio and effortless for users.
          </Text>
          <div className="auth-metrics">
            <div>
              <Text className="auth-metric-label">Status</Text>
              <Text className="auth-metric-value">Always synced</Text>
            </div>
            <div>
              <Text className="auth-metric-label">Focus</Text>
              <Text className="auth-metric-value">Distraction-free</Text>
            </div>
          </div>
        </div>

        <Card className="auth-card">
          <div className="auth-header">
            <Title level={3} className="auth-title">Welcome back</Title>
            <Text type="secondary" className="auth-subtitle">
              Sign in to continue planning your week.
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email address" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Password is required' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="auth-btn"
            >
              Sign In
            </Button>
          </Form>
          <Text className="auth-footer">
            Don’t have an account?
            <Button type="link" className="auth-link" onClick={() => navigate('/signup')}>
              Sign up
            </Button>
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default Login;
