import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Activity, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginFormData } from '../lib/schemas';

export function LoginForm() {
  const { signIn } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Login successful');
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Activity className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2 text-center">Kiran Seva Sansthan</h1>
      <p className="text-neutral-500 mb-8 text-center">Secure patient tracking for Kiran Seva Sansthan.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email" 
            placeholder="admin@example.com"
            {...register('email')}
            className={`rounded-xl h-12 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={`rounded-xl h-12 ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="w-full rounded-xl h-12 text-lg font-medium bg-primary hover:bg-primary/90 mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
