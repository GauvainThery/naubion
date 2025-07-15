import { cn } from '../../utils/classnames';
import PageCarbonAnalyzerIntro from '../molecules/PageCarbonAnalyzerIntro';

type PageCarbonAnalyzerSectionProps = {
  className?: string;
};

const PageCarbonAnalyzerSection = ({ className }: PageCarbonAnalyzerSectionProps) => {
  return (
    <section className={cn('container', className)}>
      <PageCarbonAnalyzerIntro />
    </section>
  );
};

export default PageCarbonAnalyzerSection;
