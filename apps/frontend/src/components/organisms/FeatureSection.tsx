import { IconCard } from '../';

const FeatureSection = () => {
  return (
    <section className="noise bg-primary border-t-4 border-green-950 text-text-light pt-24 pb-16 relative drop-shadow-2xl">
      <div className="grass" />
      {/* Curved bottom */}
      <div
        className="absolute -bottom-24 left-0 w-full h-24 bg-primary noise"
        style={{
          clipPath: 'ellipse(100% 100% at 00% 0%)'
        }}
      />

      <div className="container flex flex-col gap-18 lg:gap-24 relative z-10">
        <div className="w-full flex justify-center items-center">
          <div className="flex flex-col gap-3 max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Implementation in a heartbeat, impact forever</h2>
            <p className="text-text-secondary">
              naubion is designed to be integrated seamlessly into your existing infrastructure and
              to help you reduce your application's carbon footprint with minimal effort.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-18 lg:gap-24">
          <IconCard
            icon="code"
            description="Simply add a snippet of code in both the frontend and the backend of your application"
            title="1. Easy implementation"
          />

          <IconCard
            icon="magnifyingGlass"
            description="Access an insightful dashboard with live and accurate data about your app environmental footprint"
            title="2. Monitor your app"
          />

          <IconCard
            icon="charts"
            description="Reduce the carbon footprint of your application by understanding better your usage and the impact of your code"
            title="3. Reduce your footprint"
          />

          <IconCard
            icon="sheet"
            description="Report on your application's environmental footprint to legal instances"
            title="4. Report on your impact"
          />

          <IconCard
            icon="thumb"
            description="Communicate transparently on your footprint and your actions to reduce it"
            title="5. Communicate to your users"
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
