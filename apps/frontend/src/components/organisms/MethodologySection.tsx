import React from 'react';
import IconCard, { IconCardProps } from '../atoms/IconCard';
import { cn } from './../../utils/classnames';

type MethodologySectionProps = {
  className?: string;
};

const MethodologySection: React.FC<MethodologySectionProps> = ({ className }) => {
  const methodologySteps: {
    title: string;
    description: string;
    icon: Pick<IconCardProps, 'icon'>['icon'];
  }[] = [
    {
      title: 'Resource Collection & Analysis',
      description:
        'We simulate user interactions on your webpage using real browser automation (Puppeteer) to capture all network resources including HTML, CSS, JavaScript, images, fonts, and media files. Our system measures the actual transfer size of each resource, providing accurate data on what users download when visiting your page.',
      icon: 'code'
    },
    {
      title: 'Interaction Simulation',
      description:
        'Our analysis includes different interaction levels (minimal, default, thorough) to simulate real user behavior like scrolling, clicking, and loading dynamic content. This ensures we capture the full environmental impact of your page, not just the initial load.',
      icon: 'cursor'
    },
    {
      title: 'Green Hosting Assessment',
      description:
        "We check if your website is hosted on green, renewable energy-powered servers using The Green Web Foundation's database. This assessment impacts the carbon footprint calculation, as green-hosted sites have significantly lower emissions per byte transferred.",
      icon: 'servers'
    },
    {
      title: 'CO₂e Emissions Calculation',
      description:
        "Using The Green Web Foundation's CO2.js library with the Sustainable Web Design (SWD) model v4, we convert the total data transfer into grams of CO₂ equivalent emissions. This industry-standard methodology accounts for device energy use, network infrastructure, and data center operations.",
      icon: 'earth'
    },
    {
      title: 'Real-World Impact Translation',
      description:
        'We convert abstract CO₂e numbers into tangible equivalents like kilometers driven by a gasoline car (using the standard 200 gCO₂e/km emission factor). This helps you understand the real environmental impact of your webpage in everyday terms.',
      icon: 'car'
    }
  ];

  return (
    <section
      className={cn(
        'noise bg-primary border-t-4 border-green-950 text-text-light pb-16 relative drop-shadow-2xl',
        className
      )}
    >
      <div className="grass" />
      {/* Curved bottom */}
      <div
        className="absolute -bottom-24 left-0 w-full h-24 bg-primary noise"
        style={{
          clipPath: 'ellipse(100% 100% at 00% 0%)'
        }}
      />

      <div className="container">
        <div className="flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-light mb-4">Our Methodology</h2>
            <p className="text-text-secondary-light max-w-3xl mx-auto">
              Our carbon footprint analysis follows industry-standard methodologies and uses
              trusted, open-source tools to provide accurate environmental impact assessments of web
              pages.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-18 lg:gap-24">
            {methodologySteps.map((step, index) => (
              <IconCard
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
                className="text-justify"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
