import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/classnames';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

type LoginFormProps = {
  onLogin: (password: string) => Promise<void>;
  error?: string;
  loading?: boolean;
  className?: string;
};

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  error,
  loading = false,
  className = ''
}) => {
  const { t } = useTranslation('admin');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onLogin(password);
    }
  };

  return (
    <div className={cn('max-w-md mx-auto flex flex-col gap-6', className)}>
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{t('login.title')}</h1>
        <p className="text-text-secondary">{t('login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <Input
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="text-center"
          />
        </div>

        {error && (
          <div className="text-utils-700 text-center bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!password.trim() || loading}
          className="self-end"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
