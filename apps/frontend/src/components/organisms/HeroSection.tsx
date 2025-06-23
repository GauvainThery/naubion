import React from 'react';
import { Laptop, TextInputWithSubmit } from '../';
import { useNewsletter } from '../../hooks/useNewsletter';

const HeroSection = () => {
  const { subscribe, isLoading, error, success } = useNewsletter();

  const handleEmailSubmit = async (email: string) => {
    await subscribe(email);
  };

  return (
    <section className="flex flex-col lg:flex-row items-center justify-between container gap-12 pt-24">
      <div className="lg:w-1/2 flex flex-col gap-8 lg:gap-16 lg:pb-28 h-[312px] lg:h-[496px]">
        <div className="flex flex-col gap-3 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold">
            Regain control of your application's carbon footprint
          </h1>
          <p className="text-text-secondary lg:w-7/8">
            Empower your digital sustainability with cutting-edge tools to track and reduce carbon
            emissions from your websites and applications. From frontend to backend, ensure a
            greener digital presence.
          </p>
        </div>

        <div className="flex flex-col gap-6 text-center justify-center items-center">
          <p className="secondary-font">
            <strong>naubion</strong> is coming soon! Join our waiting list and be at the forefront
            of web decarbonization.
          </p>
          <TextInputWithSubmit
            type="email"
            placeholder="Enter your email..."
            buttonText="Join Waitlist"
            onSubmit={handleEmailSubmit}
            loading={isLoading}
            error={error}
            success={success}
            successMessage="Thank you and welcome!"
            required
          />
        </div>
      </div>
      <div className="lg:w-1/2 w-full h-full flex justify-center items-end">
        <Laptop />
      </div>
    </section>
  );
};

export default HeroSection;
