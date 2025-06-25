import React from 'react';
import FAQItem from '../atoms/FAQItem';
import { cn } from './../../utils/classnames';

type FAQSectionProps = {
  className?: string;
};

const FAQSection: React.FC<FAQSectionProps> = ({ className }) => {
  const faqs = [
    {
      question: 'Is this tool naubion or just a demo?',
      answer:
        "This tool is a sneak peek of naubion's capabilities, showcasing our commitment to sustainability and transparency in web development. While it provides valuable insights into your website's carbon footprint, the full naubion platform will offer even more advanced features and integrations to help you build greener applications."
    },
    {
      question: 'How accurate are the carbon footprint calculations?',
      answer:
        "Our calculations use The Green Web Foundation's CO2.js library with the Sustainable Web Design (SWD) model v4, which is an industry-standard methodology. The results provide scientifically-backed estimates based on actual data transfer and hosting infrastructure. While estimates may vary ±20% depending on real-world conditions, they give you a reliable baseline for understanding and improving your website's environmental impact."
    },
    {
      question: 'What does the interaction level setting change?',
      answer:
        "Interaction levels simulate different user behaviors:\n\n• Minimal: Basic page load with minimal scrolling\n• Default: Typical user behavior including moderate scrolling and interaction\n• Thorough: Comprehensive analysis with extensive scrolling and interaction simulation\n\nHigher interaction levels may reveal additional resources loaded dynamically, providing a more complete picture of your page's total environmental impact."
    },
    {
      question: 'Why does green hosting matter for carbon emissions?',
      answer:
        "Green hosting significantly reduces carbon emissions because it uses renewable energy sources (solar, wind, hydro) instead of fossil fuels. Websites hosted on green servers can have 50-70% lower carbon emissions per byte transferred. We check your hosting provider against The Green Web Foundation's database of verified green hosting providers."
    },
    {
      question: 'How is the car distance equivalent calculated?',
      answer:
        'We use the standard automotive emission factor of 200 gCO₂e per kilometer for gasoline cars. This means 1 gram of CO₂e equals approximately 5 meters of driving. This conversion helps translate abstract carbon numbers into tangible, everyday equivalents that are easier to understand and communicate.'
    },
    {
      question: 'What resources are included in the analysis?',
      answer:
        'Our analysis captures all resources downloaded when loading your page:\n\n• HTML documents\n• CSS stylesheets\n• JavaScript files\n• Images and media files\n• Web fonts\n• Third-party scripts and resources\n• API calls and dynamic content\n\nWe measure the actual transfer size (compressed size) that users download, not the uncompressed file size.'
    },
    {
      question: 'Can I analyze pages behind authentication or with complex interactions?',
      answer:
        "Currently, our tool analyzes publicly accessible pages without authentication. For pages requiring login or complex user flows, we recommend analyzing similar public pages or the main landing pages that represent your site's typical resource usage. Future versions may include support for authenticated analysis."
    },
    {
      question: "What's the difference between desktop and mobile analysis?",
      answer:
        'Desktop and mobile analyses simulate different device types and screen sizes:\n\n• Desktop: 1920x1080 viewport, simulates traditional computer usage\n• Mobile: 375x667 viewport with touch simulation, represents smartphone usage\n\nMobile analysis often shows different resource loading patterns and may reveal mobile-specific optimizations or issues.'
    }
  ];

  return (
    <section className={cn('container', className)}>
      <div className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <p className="text-text-secondary">
            Get answers to common questions about our carbon footprint analysis methodology and
            results.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
