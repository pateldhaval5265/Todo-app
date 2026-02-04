import  { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import './Auth.css';

const { Title, Text } = Typography;

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { name, email, password } = values;
    setLoading(true);

    try {
      await axios.post(
        'https://jobs-api-g0fe.onrender.com/api/v1/auth/register',
        { name, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      message.success('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      const errMsg = error.response?.data?.msg || error.message;

      if (errMsg.toLowerCase().includes('duplicate')) {
        message.error('This email is already registered.');
      } else {
        message.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell auth-shell--reverse">
        <div className="auth-hero">
          <span className="auth-badge">Personal Task Manager</span>
          <Title level={2} className="auth-hero-title">
            Start fresh with a space built for momentum.
          </Title>
          <Text className="auth-hero-text">
            Plan projects, track wins, and share a polished experience on your
            portfolio. Your productivity command center starts here.
          </Text>
          <div className="auth-metrics">
            <div>
              <Text className="auth-metric-label">Setup</Text>
              <Text className="auth-metric-value">Under 60 seconds</Text>
            </div>
            <div>
              <Text className="auth-metric-label">Design</Text>
              <Text className="auth-metric-value">Portfolio-ready</Text>
            </div>
          </div>
        </div>

        <Card className="auth-card">
          <div className="auth-header">
            <Title level={3} className="auth-title">Create your account</Title>
            <Text type="secondary" className="auth-subtitle">
              Join the workspace and keep every task in sync.
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
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
              Create account
            </Button>
          </Form>

          <Text className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
