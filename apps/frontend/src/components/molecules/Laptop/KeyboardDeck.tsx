const KeyboardDeck = () => {
  return (
    <div className="absolute inset-2 rounded-md">
      {/* Trackpad */}
      <div className="transition-all duration-900 absolute bottom-4 rounded-sm left-1/2 transform -translate-x-1/2 w-14 sm:w-20 lg:w-24 h-8 sm:h-12 lg:h-16 bg-gradient-to-b from-gray-600 to-gray-700 shadow-inner" />

      {/* Keyboard Keys Grid */}
      <div className="absolute top-4 left-4 right-4 grid grid-cols-15 gap-[2px] p-1 rounded-sm bg-gray-700">
        {/* Generate keyboard keys */}
        {Array.from({ length: 60 }, (_, i) => {
          if (i === 50) {
            return (
              <div
                className="transition-all duration-900 w-19 sm:w-25 lg:w-34 h-[11px] sm:h-[16px] lg:h-[21px] bg-gradient-to-b from-black to-gray-800 rounded-sm shadow-sm"
                style={{
                  aspectRatio: '1',
                  fontSize: '6px',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.1)'
                }}
              />
            );
          }

          if (i > 50 && i < 56) {
            return <div className="w-[26px]" />;
          }

          return (
            <div
              key={i}
              className="bg-gradient-to-b from-black to-gray-800 rounded-sm shadow-sm hover:to-gray-150 transition-colors duration-950"
              style={{
                aspectRatio: '1',
                fontSize: '6px',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default KeyboardDeck;
