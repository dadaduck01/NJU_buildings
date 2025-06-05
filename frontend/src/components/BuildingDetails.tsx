import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Building } from '../types/Building';

interface Props {
  building: Building;
}

// 添加动画效果
const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-50px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const DetailsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const BuildingImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-bottom: 1px solid rgba(236, 240, 241, 0.3);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #ecf0f1, #bdc3c7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(236, 240, 241, 0.3);
`;

const ContentArea = styled.div`
  padding: 40px;
`;

const BuildingTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  text-align: center;
`;

const InfoSection = styled.div`
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

const InfoItem = styled.div`
  margin: 15px 0;
  color: #7f8c8d;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: #3498db;
    transform: translateX(5px);
  }
  
  strong {
    color: #2c3e50;
    margin-right: 10px;
  }
`;

const DescriptionSection = styled.div`
  margin-top: 30px;
`;

const DescriptionTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 1.6rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 60px;
    height: 3px;
    background: #3498db;
    border-radius: 2px;
  }
`;

const DescriptionContent = styled.div`
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  border-left: 4px solid #3498db;
  padding: 30px;
  border-radius: 0 15px 15px 0;
  line-height: 1.8;
  color: #2c3e50;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  
  &.loading {
    text-align: center;
    color: #7f8c8d;
  }
`;

const ActionSection = styled.div`
  margin: 30px 0;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  
  &:hover {
    background: linear-gradient(135deg, #2980b9, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #bdc3c7, #95a5a6);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const AudioSection = styled.div`
  margin-top: 20px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 15px;
  border-radius: 10px;
  outline: none;
  
  &::-webkit-media-controls-panel {
    background: linear-gradient(135deg, #3498db, #2980b9);
    border-radius: 10px;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin: 20px 0;
  text-align: center;
  box-shadow: 0 8px 32px rgba(231, 76, 60, 0.3);
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #3498db;
  font-size: 1.1rem;
  margin: 20px 0;
`;

const AutoPlayNotification = styled.div`
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin: 15px 0;
  text-align: center;
  font-size: 0.9rem;
`;

const BuildingDetails: React.FC<Props> = ({ building }) => {
  const [description, setDescription] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loadingDescription, setLoadingDescription] = useState<boolean>(false);
  const [loadingAudio, setLoadingAudio] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [autoPlayNotification, setAutoPlayNotification] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentBuildingRef = useRef<string>(''); // 添加引用来跟踪当前建筑

  // 自动生成建筑介绍
  useEffect(() => {
    // 只有当建筑名称真正改变时才重新生成
    if (building.name !== currentBuildingRef.current) {
      currentBuildingRef.current = building.name;
      generateDescription();
      // 清理之前的状态
      setAudioUrl('');
      setError('');
      setAutoPlayNotification('');
    }
  }, [building.name]);

  // 当描述生成完成后，自动转换为语音
  useEffect(() => {
    // 确保描述是针对当前建筑的，并且还没有对应的音频
    if (description && 
        !loadingDescription && 
        !audioUrl && 
        !loadingAudio && 
        building.name === currentBuildingRef.current) {
      setAutoPlayNotification('🔄 描述已生成，正在自动转换为语音...');
      generateAudio();
    }
  }, [description, loadingDescription]); // 移除audioUrl依赖，避免循环触发

  // 当语音生成完成后，自动播放
  useEffect(() => {
    if (audioUrl && 
        audioRef.current && 
        !loadingAudio && 
        building.name === currentBuildingRef.current) {
      setAutoPlayNotification('🎵 语音已生成，正在自动播放...');
      
      // 延迟一点播放以确保音频加载完成
      setTimeout(() => {
        if (audioRef.current && building.name === currentBuildingRef.current) {
          audioRef.current.play().then(() => {
            setAutoPlayNotification('');
          }).catch((error) => {
            console.error('自动播放失败:', error);
            setAutoPlayNotification('⚠️ 自动播放失败，请手动点击播放按钮');
          });
        }
      }, 500);
    }
  }, [audioUrl, loadingAudio, building.name]);

  const generateDescription = async () => {
    // 防止重复调用
    if (loadingDescription) return;
    
    setLoadingDescription(true);
    setError('');
    setDescription('');
    
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buildingName: building.name }),
      });
      
      const data = await response.json();
      
      // 确保响应的建筑名称与当前选择的建筑一致（防止异步问题）
      if (data.success && building.name === currentBuildingRef.current) {
        setDescription(data.description);
      } else if (data.error) {
        setError(data.error || '生成建筑介绍失败');
      }
    } catch (err) {
      if (building.name === currentBuildingRef.current) {
        setError('网络错误，请稍后重试');
      }
    } finally {
      setLoadingDescription(false);
    }
  };

  const generateAudio = async () => {
    if (!description || loadingAudio) {
      if (!description) {
        setError('请等待建筑介绍生成完成');
      }
      return;
    }

    setLoadingAudio(true);
    setError('');
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: description }),
      });
      
      const data = await response.json();
      
      // 确保当前建筑没有改变
      if (data.success && building.name === currentBuildingRef.current) {
        setAudioUrl(data.audioUrl);
      } else if (data.error && building.name === currentBuildingRef.current) {
        setError('生成语音失败');
        setAutoPlayNotification('');
      }
    } catch (err) {
      if (building.name === currentBuildingRef.current) {
        setError('网络错误，请稍后重试');
        setAutoPlayNotification('');
      }
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <DetailsContainer>
      {building.image_url ? (
        <BuildingImage
          src={building.image_url}
          alt={building.name}
          onError={handleImageError}
        />
      ) : (
        <ImagePlaceholder>
          🏛️ 暂无图片
        </ImagePlaceholder>
      )}
      
      <ContentArea>
        <BuildingTitle>{building.name}</BuildingTitle>
        
        <InfoSection>
          <InfoItem>
            <strong>📍 地址：</strong>{building.address}
          </InfoItem>
          <InfoItem>
            <strong>📅 录入时间：</strong>{new Date(building.created_at).toLocaleString('zh-CN')}
          </InfoItem>
        </InfoSection>

        {error && (
          <ErrorMessage>
            ❌ {error}
          </ErrorMessage>
        )}

        {autoPlayNotification && (
          <AutoPlayNotification>
            {autoPlayNotification}
          </AutoPlayNotification>
        )}

        <DescriptionSection>
          <DescriptionTitle>📖 建筑介绍</DescriptionTitle>
          {loadingDescription ? (
            <LoadingIndicator>
              <span>🔄</span>
              <span>正在生成建筑介绍，请稍候...</span>
            </LoadingIndicator>
          ) : (
            <DescriptionContent>
              {description || '暂无介绍信息'}
            </DescriptionContent>
          )}
        </DescriptionSection>

        {loadingAudio && (
          <LoadingIndicator>
            <span>🔊</span>
            <span>正在生成语音，请稍候...</span>
          </LoadingIndicator>
        )}

        {audioUrl && (
          <AudioSection>
            <DescriptionTitle>🎵 语音播放</DescriptionTitle>
            <AudioPlayer ref={audioRef} controls>
              <source src={audioUrl} type="audio/mpeg" />
              您的浏览器不支持音频播放。
            </AudioPlayer>
          </AudioSection>
        )}
      </ContentArea>
    </DetailsContainer>
  );
};

export default BuildingDetails; 