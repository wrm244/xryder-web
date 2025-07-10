// 聊天组件的动画样式
export const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes smoothPulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
  }

  @keyframes thinkingDots {
    0%, 20% {
      transform: scale(0.6) translateY(0);
      opacity: 0.4;
    }
    50% {
      transform: scale(1) translateY(-6px);
      opacity: 1;
    }
    80%, 100% {
      transform: scale(0.6) translateY(0);
      opacity: 0.4;
    }
  }

  @keyframes thinkingWave {
    0%, 40%, 100% {
      transform: scaleY(0.4);
      opacity: 0.5;
    }
    20% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  @keyframes thinkingGlow {
    0%, 100% {
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 25px rgba(147, 51, 234, 0.6);
    }
  }

  .smooth-pulse {
    animation: smoothPulse 2s ease-in-out infinite;
  }

  .float-animation {
    animation: float 3s ease-in-out infinite;
  }

  .glow-animation {
    animation: glow 2s ease-in-out infinite;
  }

  .thinking-dots {
    animation: thinkingDots 1.4s ease-in-out infinite;
  }

  .thinking-wave {
    animation: thinkingWave 1s ease-in-out infinite;
  }

  .thinking-glow {
    animation: thinkingGlow 2s ease-in-out infinite;
  }

  .message-hover-glow {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .message-hover-glow:hover {
    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .user-message-glow:hover {
    box-shadow: 0 10px 40px rgba(59, 130, 246, 0.25);
    transform: translateY(-2px);
  }

  .copy-button-animated {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .copy-button-animated:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .avatar-bounce:hover {
    animation: float 1s ease-in-out;
  }
`

// 将样式注入到页面
export const injectStyles = () => {
  if (
    typeof document !== 'undefined' &&
    !document.getElementById('message-animations')
  ) {
    const style = document.createElement('style')
    style.id = 'message-animations'
    style.textContent = animationStyles
    document.head.appendChild(style)
  }
}
