import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Typography, Card, Space, message, Modal } from 'antd';
import axios from 'axios';
import deleteJob from './Delete';
import editJob from './Edit';
import createJob from './CreateJob';
import './Dashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [formValues, setFormValues] = useState({ company: '', position: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showTips, setShowTips] = useState(true);
  const [theme, setTheme] = useState('light');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);//add
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);//add
  const [editingJob, setEditingJob] = useState(null);//add

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('currentUser'));
  const tokenValue = localStorage.getItem('token');
  const token = `Bearer ${tokenValue}`;

  useEffect(() => {
    if (!user || !tokenValue) {
      navigate('/login');
    } else {
      fetchJobs();
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('https://jobs-api-g0fe.onrender.com/api/v1/jobs', {
        headers: { Authorization: token },
      });
      setJobs(response.data.jobs);
    } catch (error) {
      message.error(error.response?.data?.msg || error.message);
      navigate('/login');
    }
  };

  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    const result = await createJob(formValues, token);
    if (result.success) {
      message.success('Job created!');
      setFormValues({ company: '', position: '', status: '' });
      fetchJobs();
      setIsCreateModalOpen(false);//add
    } else {
      message.error(result.message);
    }
  };

  const startEdit = (job) => {
    setEditingJob(job);
    setFormValues({ company: job.company, position: job.position, status: job.status });
    setIsEditModalOpen(true);//add
  };

  const submitEdit = async () => {
    const result = await editJob(editingJob._id, formValues, token);
    if (result.success) {
      message.success('Job updated successfully!');
      setEditingJob(null);
      setIsEditModalOpen(false);
      setFormValues({ company: '', position: '', status: '' });
      fetchJobs();
    } else {
      message.error(result.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.clear();
    navigate('/login');
  };

  const showDeleteModal = (job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmLoading(true);
    const result = await deleteJob(jobToDelete._id, token);
    if (result.success) {
      message.success('Job deleted successfully!');
      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
    } else {
      message.error(result.message || 'Failed to delete job');
    }
    setConfirmLoading(false);
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const stats = jobs.reduce(
    (acc, job) => {
      acc.total += 1;
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, interview: 0, declined: 0 }
  );

  const companyCounts = jobs.reduce((acc, job) => {
    if (!job.company) return acc;
    acc[job.company] = (acc[job.company] || 0) + 1;
    return acc;
  }, {});

  const [topCompany] = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]);
  const topCompanyLabel = topCompany ? `${topCompany[0]} (${topCompany[1]})` : 'Add your first role';

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = `${job.company} ${job.position}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOrder = ['pending', 'interview', 'declined'];
  const timelineJobs = [...filteredJobs].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="dashboard-page" data-theme={theme}>
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <Text className="dashboard-eyebrow">Job Tracker</Text>
            <Title level={2} className="dashboard-title">Your hiring pipeline</Title>
            <Text className="dashboard-subtitle">
              Keep momentum with a clean view of every role you’re tracking.
            </Text>
          </div>
          <Space className="dashboard-actions">
            <Button
              className="theme-toggle"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? 'Night mode' : 'Day mode'}
            </Button>
            <Button danger onClick={handleLogout}>Logout</Button>
            <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
              ➕ Create Job
            </Button>
          </Space>
        </header>

        <div className="dashboard-stats">
          <Card className="stat-card">
            <Text className="stat-label">Total Roles</Text>
            <Title level={3} className="stat-value">{stats.total}</Title>
          </Card>
          <Card className="stat-card">
            <Text className="stat-label">Pending</Text>
            <Title level={3} className="stat-value">{stats.pending}</Title>
          </Card>
          <Card className="stat-card">
            <Text className="stat-label">Interview</Text>
            <Title level={3} className="stat-value">{stats.interview}</Title>
          </Card>
          <Card className="stat-card">
            <Text className="stat-label">Declined</Text>
            <Title level={3} className="stat-value">{stats.declined}</Title>
          </Card>
        </div>

        <div className="insights-grid">
          <Card className="insight-card">
            <Text className="stat-label">Top company</Text>
            <Title level={4} className="insight-value">{topCompanyLabel}</Title>
            <Text className="insight-note">Focus where you’re getting traction.</Text>
          </Card>
          <Card className="insight-card">
            <Text className="stat-label">Pipeline health</Text>
            <Title level={4} className="insight-value">
              {stats.total ? Math.round((stats.interview / stats.total) * 100) : 0}% interview rate
            </Title>
            <Text className="insight-note">Aim for 20%+ to stay in momentum.</Text>
          </Card>
          <Card className="insight-card">
            <Text className="stat-label">Next focus</Text>
            <Title level={4} className="insight-value">Follow-ups</Title>
            <Text className="insight-note">Schedule 2 follow-ups this week.</Text>
          </Card>
        </div>


      {/* Create Modal add whole model */}

      <Modal title="Create Job" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={handleCreate}>

          <Form.Item label="Company" required>
            <Input value={formValues.company} onChange={(e) => handleInputChange('company', e.target.value)} />
          </Form.Item>

          <Form.Item label="Position" required>
            <Input value={formValues.position} onChange={(e) => handleInputChange('position', e.target.value)} />
          </Form.Item>

          <Form.Item label="Status" required>
            <Select value={formValues.status} onChange={(value) => handleInputChange('status', value)}>
              <Option value="pending">Pending</Option>
              <Option value="interview">Interview</Option>
              <Option value="declined">Declined</Option>
            </Select>
          </Form.Item>

          {/* <Button type="primary" htmlType="submit" style={{ marginTop: 16,}}>
            Create
          </Button> */}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </div>
        </Form>
      </Modal>


      {/* Edit Modal add whole model */}

      <Modal title="Edit Job" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>

        <Form layout="vertical" onFinish={submitEdit}>
          <Form.Item label="Company" required>
            <Input value={formValues.company} onChange={(e) => handleInputChange('company', e.target.value)} />
          </Form.Item>

          <Form.Item label="Position" required>
            <Input value={formValues.position} onChange={(e) => handleInputChange('position', e.target.value)} />
          </Form.Item>

          <Form.Item label="Status" required>

            <Select value={formValues.status} onChange={(value) => handleInputChange('status', value)}>
              <Option value="pending">Pending</Option>
              <Option value="interview">Interview</Option>
              <Option value="declined">Declined</Option>
            </Select>

          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
            Save
          </Button>
        </Form>
      </Modal>



        <div className="dashboard-list-header">
          <div>
            <Title level={3} className="section-title">Your Job Posts</Title>
            <Text className="section-subtitle">
              Track progress, update statuses, and keep everything in sync.
            </Text>
          </div>
          <div className="dashboard-filters">
            <Input
              placeholder="Search company or position"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="status-filter"
            >
              <Option value="all">All statuses</Option>
              <Option value="pending">Pending</Option>
              <Option value="interview">Interview</Option>
              <Option value="declined">Declined</Option>
            </Select>
            <Select value={viewMode} onChange={setViewMode} className="view-toggle">
              <Option value="grid">Card view</Option>
              <Option value="kanban">Kanban</Option>
              <Option value="timeline">Timeline</Option>
            </Select>
          </div>
        </div>

        {showTips && (
          <Card className="tips-card">
            <div>
              <Text className="tips-title">Quick tips</Text>
              <Text className="tips-text">
                Add notes to your next follow-up and keep the status updated after each call.
              </Text>
            </div>
            <Button type="link" onClick={() => setShowTips(false)}>Dismiss</Button>
          </Card>
        )}

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <Title level={4}>No jobs found</Title>
            <Text>Try adjusting your filters or add a new role.</Text>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="kanban-board">
            {statusOrder.map((status) => (
              <div key={status} className="kanban-column">
                <div className="kanban-header">
                  <Text className="kanban-title">{status}</Text>
                  <span className={`status-pill status-${status}`}>
                    {filteredJobs.filter((job) => job.status === status).length}
                  </span>
                </div>
                <div className="kanban-cards">
                  {filteredJobs
                    .filter((job) => job.status === status)
                    .map((job) => (
                      <Card key={job._id} className="job-card kanban-card">
                        <Title level={5} className="job-title">{job.company}</Title>
                        <Text className="job-value">{job.position}</Text>
                        <Space className="job-actions">
                          <Button danger onClick={() => showDeleteModal(job)}>Delete</Button>
                          <Button onClick={() => startEdit(job)}>Edit</Button>
                        </Space>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="timeline">
            {timelineJobs.map((job) => (
              <Card key={job._id} className="job-card timeline-card">
                <div className="timeline-header">
                  <div>
                    <Text className="job-label">Company</Text>
                    <Title level={4} className="job-title">{job.company}</Title>
                  </div>
                  <span className={`status-pill status-${job.status}`}>{job.status}</span>
                </div>
                <Text className="job-value">{job.position}</Text>
                <Space className="job-actions">
                  <Button danger onClick={() => showDeleteModal(job)}>Delete</Button>
                  <Button onClick={() => startEdit(job)}>Edit</Button>
                </Space>
              </Card>
            ))}
          </div>
        ) : (
          <div className="job-grid">
            {filteredJobs.map((job) => (
              <Card key={job._id} className="job-card">
                <div className="job-card-header">
                  <div>
                    <Text className="job-label">Company</Text>
                    <Title level={4} className="job-title">{job.company}</Title>
                  </div>
                  <span className={`status-pill status-${job.status}`}>{job.status}</span>
                </div>

                <div className="job-details">
                  <div>
                    <Text className="job-label">Position</Text>
                    <Text className="job-value">{job.position}</Text>
                  </div>
                </div>

                <Space className="job-actions">
                  <Button danger onClick={() => showDeleteModal(job)}>Delete</Button>
                  <Button onClick={() => startEdit(job)}>Edit</Button>
                </Space>
              </Card>
            ))}
          </div>
        )}

      {/* Delete Modal */}
      <Modal title="Confirm Deletion" open={isDeleteModalOpen} onOk={handleConfirmDelete} confirmLoading={confirmLoading}
        onCancel={() => setIsDeleteModalOpen(false)} okText="Delete" okType="danger" >
        <p>Are you sure you want to delete the job?</p>
      </Modal>

      </div>
    </div>
  );
};

export default Dashboard;



