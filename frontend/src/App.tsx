import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import BuildingSelector from './components/BuildingSelector';
import BuildingDetails from './components/BuildingDetails';
import AdminPanel from './components/AdminPanel';
import { Building } from './types/Building';
import './App.css';

// 添加渐变动画
const backgroundShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 添加浮动动画
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// 淡入动画
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: 
    linear-gradient(135deg, rgba(52, 152, 219, 0.8), rgba(41, 128, 185, 0.8)),
    url('https://obsidian1122.oss-cn-nanjing.aliyuncs.com/picture/%E8%80%81%E5%BB%BA%E7%AD%91.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: white;
    font-size: 3rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  }
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const NavButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 
    'linear-gradient(135deg, #3498db, #2980b9)' : 
    'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.active ? 'white' : '#3498db'};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  
  &:hover {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const BuildingDisplay = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

type ViewMode = 'user' | 'admin';

const App: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const detailsRef = useRef<HTMLDivElement>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setTimeout(() => {
      if (detailsRef.current) {
        detailsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleBuildingsUpdate = () => {
    fetchBuildings();
    setSelectedBuilding(null);
  };

  return (
    <AppContainer>
      <ContentWrapper>
        <Header>
          <h1>🏛️ 南京大学鼓楼校区建筑信息平台</h1>
          <p>探索南京大学鼓楼校区的历史建筑，了解其深厚的文化底蕴</p>
        </Header>

        <NavBar>
          <NavButton
            active={viewMode === 'user'}
            onClick={() => setViewMode('user')}
          >
            🏛️ 用户界面
          </NavButton>
          <NavButton
            active={viewMode === 'admin'}
            onClick={() => setViewMode('admin')}
          >
            ⚙️ 管理后台
          </NavButton>
        </NavBar>

        <MainContent>
          {viewMode === 'user' ? (
            <>
              <BuildingSelector
                buildings={buildings}
                loading={loading}
                onSelect={handleBuildingSelect}
                selectedBuilding={selectedBuilding}
              />

              {selectedBuilding && (
                <BuildingDisplay ref={detailsRef}>
                  <BuildingDetails building={selectedBuilding} />
                </BuildingDisplay>
              )}
            </>
          ) : (
            <AdminPanel onBuildingsUpdate={handleBuildingsUpdate} />
          )}
        </MainContent>
      </ContentWrapper>
    </AppContainer>
  );
};

export default App;
