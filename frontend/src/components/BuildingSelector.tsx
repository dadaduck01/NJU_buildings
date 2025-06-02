import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Building } from '../types/Building';

interface Props {
  buildings: Building[];
  loading: boolean;
  onSelect: (building: Building) => void;
  selectedBuilding: Building | null;
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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const SelectorContainer = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: white;
  margin-bottom: 25px;
  font-size: 2rem;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const BuildingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px 0;
`;

const BuildingCard = styled.div<{ selected: boolean }>`
  background: ${props => props.selected ? 
    'linear-gradient(135deg, #3498db, #2980b9)' : 
    'rgba(255, 255, 255, 0.95)'
  };
  color: ${props => props.selected ? 'white' : '#2c3e50'};
  border: 2px solid ${props => props.selected ? 
    'rgba(255, 255, 255, 0.3)' : 
    'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(15px);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(52, 152, 219, 0.2);
    border-color: rgba(52, 152, 219, 0.3);
  }

  &:active {
    transform: translateY(-1px);
  }

  h3 {
    margin: 0 0 15px 0;
    font-size: 1.4rem;
    font-weight: 600;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 40px;
      height: 2px;
      background: ${props => props.selected ? 
        'rgba(255, 255, 255, 0.5)' : 
        '#3498db'
      };
      border-radius: 1px;
      transition: width 0.2s ease;
    }
  }
  
  &:hover h3::after {
    width: 50px;
  }

  p {
    margin: 0;
    font-size: 1rem;
    opacity: ${props => props.selected ? 0.9 : 0.7};
    transition: opacity 0.2s ease;
  }
  
  &:hover p {
    opacity: 1;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  p {
    font-size: 1.2rem;
    margin: 0;
  }
`;

const EmptyContainer = styled.div`
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  h3 {
    margin-bottom: 15px;
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.8;
  }
`;

const BuildingSelector: React.FC<Props> = ({ 
  buildings, 
  loading, 
  onSelect, 
  selectedBuilding 
}) => {
  if (loading) {
    return (
      <SelectorContainer>
        <Title>🏛️ 选择建筑</Title>
        <LoadingContainer>
          <p>🔄 正在加载建筑信息...</p>
        </LoadingContainer>
      </SelectorContainer>
    );
  }

  if (buildings.length === 0) {
    return (
      <SelectorContainer>
        <Title>🏛️ 选择建筑</Title>
        <EmptyContainer>
          <h3>📭 暂无建筑信息</h3>
          <p>请稍后再试或联系管理员添加建筑信息</p>
        </EmptyContainer>
      </SelectorContainer>
    );
  }

  return (
    <SelectorContainer>
      <Title>🏛️ 选择建筑</Title>
      <BuildingGrid>
        {buildings.map((building, index) => (
          <BuildingCard
            key={building.id}
            selected={selectedBuilding?.id === building.id}
            onClick={() => onSelect(building)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <h3>{building.name}</h3>
            <p>📍 {building.address}</p>
          </BuildingCard>
        ))}
      </BuildingGrid>
    </SelectorContainer>
  );
};

export default BuildingSelector; 