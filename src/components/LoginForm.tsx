import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Activity, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Login successful');
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials'
      });
    } finally {
      setLoading(false);
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
      
      <form onSubmit={handleLogin} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email" 
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl h-12"
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="w-full rounded-xl h-12 text-lg font-medium bg-primary hover:bg-primary/90 mt-4"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
