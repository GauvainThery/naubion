import { TextInputWithSubmit } from '../';
import { useNewsletter } from '../../hooks/useNewsletter';
import { cn } from './../../utils/classnames';

type CallToActionSectionProps = {
  className?: string;
  subtitle?: string;
};

const DEFAULT_SUBTITLE =
  "naubion is not yet available, but you can already start reducing your web application's carbon footprint. Join our community to stay updated on our progress and be the first to know when we launch.";

const CallToActionSection = ({
  className = '',
  subtitle = DEFAULT_SUBTITLE
}: CallToActionSectionProps) => {
  const { subscribe, isLoading, error, success } = useNewsletter();

  const handleEmailSubmit = async (email: string) => {
    await subscribe(email);
    console.log('Email submitted:', email);
  };

  return (
    <section className={cn('pt-48 pb-16', className)}>
      <div className="container flex flex-col gap-18 relative z-10">
        <div className="w-full flex justify-center items-center">
          <div className="flex flex-col gap-3 max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Join the fight for a greener web</h2>
            <p className="text-text-secondary">{subtitle}</p>
          </div>
        </div>
        <div className="w-full flex justify-center">
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
    </section>
  );
};

export default CallToActionSection;
