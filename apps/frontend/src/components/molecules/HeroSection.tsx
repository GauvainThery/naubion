const HeroSection = () => {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between container gap-12 pt-16">
      <div className="lg:w-1/2 flex flex-col gap-16">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold">Regain control of your app carbon footprint</h1>
          <p>
            Track and reduce the emissions of your websites and applications, from design to
            deployment.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="secondary-font">
            <strong>naubion</strong> is not yet available, but you can join the waiting list and be
            pioneer in the web decarbonation.
          </p>
          input to come
        </div>
      </div>
      <div className="lg:w-1/2">Design to come</div>
    </section>
  );
};

export default HeroSection;
