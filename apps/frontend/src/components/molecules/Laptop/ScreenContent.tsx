import Leaf from './Leaf';

const screenContent = () => {
  return (
    <div className="w-full h-full flex items-end justify-center pb-1">
      {/* Flower Pot Container */}
      <div className="relative">
        {/* Simple Sprout 🌱 with wind animation */}
        <div className="absolute -top-18 left-1/2 z-10 sprout-wind">
          {/* Main stem with natural curve using SVG */}
          <svg
            width="4"
            height="62"
            className="mx-auto stem-sway -z-10"
            style={{ overflow: 'visible' }}
          >
            <path
              d="M 2 64 Q 1 48, 2.5 32 Q 3.5 16, 2 0"
              stroke="#15803d"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Complex leaves using atomic component */}
          <div className="relative -top-12">
            {/* Left leaf */}
            <div className="leaf-dance-1">
              <Leaf direction="left" size="large" className="absolute -left-[5px] -top-[10px]" />
            </div>

            {/* Right leaf */}
            <div className="leaf-dance-2">
              <Leaf direction="right" size="large" className="absolute left-[6px] -top-[70px]" />
            </div>
          </div>
        </div>

        {/* Main pot body with tapered shape */}
        <div className="relative">
          {/* Pot body using clip-path for tapered effect */}
          <div
            className="noise w-20 h-14 lg:w-26 lg:h-20 bg-gradient-to-b from-orange-600 to-orange-800 relative shadow-lg"
            style={{
              clipPath: 'polygon(5% 0%, 95% 0%, 85% 100%, 15% 100%)'
            }}
          >
            {/* Highlight on the pot */}
            <div className="absolute top-2 left-3 w-2 h-6 lg:h-12 bg-orange-400 opacity-50 rounded-full blur-sm" />
          </div>

          {/* Pot rim */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-22 lg:w-28 h-4 bg-gradient-to-b from-orange-500 to-orange-600 rounded-lg shadow-md z-10" />
        </div>

        {/* Pot base/saucer */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-15 lg:w-21 h-2 bg-gradient-to-b from-orange-800 to-orange-950 rounded-full" />
      </div>
    </div>
  );
};

export default screenContent;
