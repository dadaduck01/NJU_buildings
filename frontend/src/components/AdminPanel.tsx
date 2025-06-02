import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Building } from '../types/Building';

interface Props {
  onBuildingsUpdate: () => void;
}

// 动画定义
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const AdminContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  padding: 40px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const AdminTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 30px 0;
  font-size: 2.2rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: #3498db;
    border-radius: 2px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  border-radius: 15px;
  border-left: 4px solid #3498db;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 25px 0;
  font-size: 1.5rem;
  position: relative;
  
  &::before {
    content: '📝';
    margin-right: 10px;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #3498db;
  }
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid rgba(236, 240, 241, 0.8);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
  }
  
  &:hover {
    border-color: rgba(52, 152, 219, 0.5);
  }
`;

const FileInput = styled.input`
  padding: 12px;
  border: 2px solid rgba(236, 240, 241, 0.8);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
  
  &:hover {
    border-color: rgba(52, 152, 219, 0.5);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 15px;
  padding: 18px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  grid-column: 1 / -1;
  justify-self: center;
  
  &:hover {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #bdc3c7, #95a5a6);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BuildingsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
`;

const BuildingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(15px);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    border-color: rgba(52, 152, 219, 0.3);
  }
`;

const CardTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CardInfo = styled.p`
  color: #7f8c8d;
  margin: 8px 0;
  font-size: 1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #3498db;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin: 15px 0;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const DeleteButton = styled.button`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #c0392b, #e74c3c);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  padding: 20px;
  border-radius: 15px;
  margin: 20px 0;
  border: 2px solid rgba(195, 230, 203, 0.5);
  backdrop-filter: blur(10px);
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(39, 174, 96, 0.2);
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  padding: 20px;
  border-radius: 15px;
  margin: 20px 0;
  border: 2px solid rgba(245, 198, 203, 0.5);
  backdrop-filter: blur(10px);
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(231, 76, 60, 0.2);
`;

const AdminPanel: React.FC<Props> = ({ onBuildingsUpdate }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    image: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/buildings');
      const data = await response.json();
      if (data.success) {
        setBuildings(data.data);
      }
    } catch (error) {
      console.error('获取建筑信息失败:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files) {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('address', formData.address);
      
      if (formData.image) {
        submitFormData.append('image', formData.image);
      }

      const response = await fetch('http://localhost:5000/api/buildings', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '建筑信息添加成功！' });
        setFormData({
          name: '',
          address: '',
          image: null
        });
        // 重置文件输入框
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        fetchBuildings();
        onBuildingsUpdate();
      } else {
        setMessage({ type: 'error', text: data.error || '添加失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个建筑信息吗？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/buildings/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '建筑信息删除成功！' });
        fetchBuildings();
        onBuildingsUpdate();
      } else {
        setMessage({ type: 'error', text: data.error || '删除失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' });
    }
  };

  return (
    <AdminContainer>
      <AdminTitle>⚙️ 建筑信息管理后台</AdminTitle>

      {message && (
        message.type === 'success' ? (
          <SuccessMessage>✅ {message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>❌ {message.text}</ErrorMessage>
        )
      )}

      <FormSection>
        <SectionTitle>🏗️ 添加新建筑</SectionTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">建筑名称 *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="例如：图书馆"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="address">地址 *</Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="例如：校园中心区域"
            />
          </FormGroup>

          <FormGroup className="full-width">
            <Label htmlFor="image">建筑图片</Label>
            <FileInput
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '🔄 添加中...' : '➕ 添加建筑'}
          </SubmitButton>
        </Form>
      </FormSection>

      <FormSection>
        <SectionTitle>📋 现有建筑列表</SectionTitle>
        <BuildingsList>
          {buildings.map((building) => (
            <BuildingCard key={building.id}>
              <CardTitle>{building.name}</CardTitle>
              <CardInfo>📍 {building.address}</CardInfo>
              {building.image_url && (
                <CardImage
                  src={`http://localhost:5000${building.image_url}`}
                  alt={building.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <DeleteButton onClick={() => handleDelete(building.id)}>
                🗑️ 删除
              </DeleteButton>
            </BuildingCard>
          ))}
        </BuildingsList>
        
        {buildings.length === 0 && (
          <CardInfo style={{ textAlign: 'center', padding: '40px' }}>
            暂无建筑信息
          </CardInfo>
        )}
      </FormSection>
    </AdminContainer>
  );
};

export default AdminPanel; 