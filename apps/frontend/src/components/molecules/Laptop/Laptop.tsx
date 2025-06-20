import { useMotionValueEvent, useScroll } from 'motion/react';
import { KeyboardDeck, ScreenContent } from '../../index';
import { useRef, useState } from 'react';

const Laptop = () => {
  const laptopRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: laptopRef,
    offset: ['start start', 'center center']
  });
  const [screenValue, setScreenValue] = useState({
    rotateX: 88.1
  });
  const [keyboardValue, setKeyboardValue] = useState({
    rotateX: 90
  });
  const [latest, setLatest] = useState(1);

  useMotionValueEvent(scrollYProgress, 'change', latest => {
    setScreenValue({
      rotateX: Math.min(10 + (1 - latest) * 100, 88.1)
    });
    setKeyboardValue({
      rotateX: Math.min(72 + ((1 - latest) / 4) * 100, 90)
    });
    setLatest(latest);
  });

  return (
    <div
      ref={laptopRef}
      className="relative transition-transform duration-700 z-10"
      style={{
        perspective: '1000px',
        transform: `translateY(${(1 - latest) * 50}%)`,
        transitionDelay: '0.05s'
      }}
    >
      {/* Laptop Screen */}
      <div
        className="w-[309px] h-[180px] lg:w-[395px] lg:h-[230px] flex items-center justify-center rounded-lg transition-all duration-900 ring-1 ring-gray-600 border-b-1 border-gray-700 "
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(-${screenValue.rotateX}deg)`,
          transformOrigin: 'bottom center'
        }}
      >
        {/* 3D border effect */}
        <div
          className="absolute bg-gradient-to-b from-gray-700 to-gray-900 w-full rounded-t-lg rounded-b-xs"
          style={{
            height: `${(1 - latest) * 8}px`,
            top: `-${(1 - latest) * 8}px`,
            width: `${98 + (1 - latest) * 2}%`,
            left: `${1 - (1 - latest) * 1}%`,
            transform: `rotateX(${screenValue.rotateX}deg)`
          }}
        />
        <div className="absolute left-0 -top-[2px] bg-gradient-to-b from-gray-700 to-gray-900 w-full h-full rounded-lg" />
        <div className="absolute left-0 top-0 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg w-full h-full" />

        {/* Inner screen area */}
        <div className="bg-black size-[calc(100%-12px)] rounded-md flex items-center justify-center relative">
          <ScreenContent />
        </div>
        <div
          className="z-50 absolute bg-black w-full rounded-lg inset-0 transition-opacity duration-900"
          style={{ opacity: 1 - latest }}
        />
      </div>

      {/* Laptop Keyboard */}
      <div
        className="w-[309px] h-[180px] lg:w-[395px] lg:h-[230px] bg-gradient-to-b from-gray-600 to-gray-500 rounded-lg relative transition-all duration-900"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${keyboardValue.rotateX}deg)`,
          transformOrigin: 'top center'
        }}
      >
        {/* 3D border effect */}
        <div
          className="absolute left-0 -bottom-3 h-1 w-full bg-transparent transition-shadow delay-75"
          style={{
            transform: `rotateX(90deg)`,
            boxShadow: latest <= 0.03 ? '0px -5px 5px rgba(0,0,0,1)' : 'none'
          }}
        />

        <div
          className="absolute bg-gradient-to-b from-gray-700 to-gray-900 w-full rounded-b-lg rounded-t-xs shadow-2xl"
          style={{
            height: `${(1 - latest) * 8}px`,
            bottom: `-${3 + (1 - latest) * 7}px`,
            width: `${98 + (1 - latest) * 2}%`,
            left: `${1 - (1 - latest) * 1}%`,
            transform: `rotateX(-${screenValue.rotateX}deg)`
          }}
        />
        <div className="absolute left-0 top-2 bg-gradient-to-b from-gray-700 to-gray-900 w-full h-full rounded-2xl" />
        <div
          className="absolute left-0 top-0 bg-gradient-to-b from-gray-600 to-gray-500 rounded-lg w-full h-full transition-shadow delay-75"
          style={{
            boxShadow: '0px 30px 50px rgba(0,0,0,0.5)'
          }}
        />

        {/* Keyboard Deck */}
        <KeyboardDeck />
        <div
          className="absolute bg-black w-full rounded-lg inset-0 transition-opacity duration-900"
          style={{ opacity: 1 - latest }}
        />
      </div>
    </div>
  );
};

export default Laptop;
