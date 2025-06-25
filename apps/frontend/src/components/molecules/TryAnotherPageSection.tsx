import React from 'react';
import { Button, ReloadIcon } from '../';

const TryAnotherPageSection: React.FC = () => {
  const handleTryAnother = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="w-full flex justify-center">
      <Button
        className="flex flex-row gap-3 w-full lg:w-1/3 justify-center"
        onClick={handleTryAnother}
      >
        <p>Try on another page</p>
        <div>
          <ReloadIcon />
        </div>
      </Button>
    </div>
  );
};

export default TryAnotherPageSection;
