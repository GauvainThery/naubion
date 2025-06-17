import { Logo } from '../components';
import { page } from '@naubion/shared';
import React from 'react';
import { Link } from 'react-router';

const Home: React.FC = () => {
  return (
    <div>
      <Logo size="lg" hasDropShadow />
      <Link to={page.pageCarbonFootprint}>Go to Page Carbon Footprint</Link>
    </div>
  );
};

export default Home;
