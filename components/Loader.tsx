'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';

interface LoaderProps {
  text?: string;
}

const StyledWrapper = styled.div`
  .loader {
    width: 44.8px;
    height: 44.8px;
    position: relative;
    transform: rotate(45deg);
  }

  .loader:before,
  .loader:after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50% 50% 0 50%;
    background: #0000;
    background-image: radial-gradient(circle 11.2px at 50% 50%, #0000 94%, #ff4747);
  }

  .loader:after {
    animation: pulse-ytk0dhmd 1s infinite;
    transform: perspective(336px) translateZ(0px);
  }

  @keyframes pulse-ytk0dhmd {
    to {
      transform: perspective(336px) translateZ(168px);
      opacity: 0;
    }
  }

  /* Larger loader on bigger screens */
  @media (min-width: 640px) {
    .loader {
      width: 67.2px;
      height: 67.2px;
    }
    
    .loader:before,
    .loader:after {
      background-image: radial-gradient(circle 16.8px at 50% 50%, #0000 94%, #ff4747);
    }
  }

  @media (min-width: 1024px) {
    .loader {
      width: 89.6px;
      height: 89.6px;
    }
    
    .loader:before,
    .loader:after {
      background-image: radial-gradient(circle 22.4px at 50% 50%, #0000 94%, #ff4747);
    }
  }
`;

export default function Loader({ text = 'Loading...' }: LoaderProps) {
  // Always prevent scrolling when loader is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-slate-900"
      style={{ 
        zIndex: 99999,
        width: '100vw',
        height: '100vh',
        position: 'fixed',
      }}
    >
      <StyledWrapper className="flex flex-col items-center gap-4 sm:gap-6">
        <div className="loader" />
        {text && <p className="text-white/70 text-sm sm:text-base lg:text-lg font-bold">{text}</p>}
      </StyledWrapper>
    </div>
  );
}
