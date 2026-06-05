import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(20, 'Max 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      setLoading(true);
      setError('');
      const res = await authService.register(data);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'name' as const,
      label: 'Full name',
      type: 'text',
      placeholder: 'John Doe',
      icon: <User size={13} style={{ color: '#62666d' }} />,
      prefix: null,
    },
    {
      name: 'username' as const,
      label: 'Username',
      type: 'text',
      placeholder: 'johndoe',
      icon: null,
      prefix: '@',
    },
    {
      name: 'email' as const,
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      icon: <Mail size={13} style={{ color: '#62666d' }} />,
      prefix: null,
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#08090a' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: '#8dd6ff' }}
            >
              <GitBranch size={16} className="text-pitch-black" />
            </div>
            <span
              className="font-semibold"
              style={{ color: '#f7f8f8', letterSpacing: '-0.13px' }}
            >
              ForkTale
            </span>
          </Link>
          <h1
            className="font-semibold mb-1"
            style={{ fontSize: '22px', letterSpacing: '-0.22px', color: '#f7f8f8' }}
          >
            Create your account
          </h1>
          <p style={{ color: '#8a8f98', fontSize: '13px' }}>
            Start writing your first branch
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-6"
          style={{
            background: '#0f1011',
            border: '1px solid #23252a',
            boxShadow: 'rgba(255, 255, 255, 0.03) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.6) 0px 0px 0px 1px',
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-3 py-2.5 rounded text-xs"
              style={{
                background: 'rgba(235, 87, 87, 0.08)',
                border: '1px solid rgba(235, 87, 87, 0.2)',
                color: '#eb5757',
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {fields.map((field) => (
              <div key={field.name}>
                <label
                  className="block mb-1.5 text-xs font-medium"
                  style={{ color: '#8a8f98' }}
                >
                  {field.label}
                </label>
                <div className="relative">
                  {field.icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      {field.icon}
                    </span>
                  )}
                  {field.prefix && (
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: '#62666d' }}
                    >
                      {field.prefix}
                    </span>
                  )}
                  <input
                    {...register(field.name)}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="input"
                    style={{
                      fontSize: '13px',
                      paddingLeft: field.icon || field.prefix ? '32px' : '12px',
                    }}
                  />
                </div>
                {errors[field.name] && (
                  <p className="mt-1 text-xs" style={{ color: '#eb5757' }}>
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Password */}
            <div>
              <label
                className="block mb-1.5 text-xs font-medium"
                style={{ color: '#8a8f98' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#62666d' }}
                />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-9 pr-9"
                  style={{ fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#62666d' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#8a8f98')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#62666d')}
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: '#eb5757' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm mt-2"
            >
              {loading ? (
                <div
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(8,9,10,0.3)', borderTopColor: '#08090a' }}
                />
              ) : (
                <>Create account <ArrowRight size={13} /></>
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#23252a' }} />
            <span style={{ color: '#383b3f', fontSize: '11px' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#23252a' }} />
          </div>

          <p className="text-center" style={{ color: '#8a8f98', fontSize: '13px' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium"
              style={{ color: '#8dd6ff' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#a8e0ff')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8dd6ff')}
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}