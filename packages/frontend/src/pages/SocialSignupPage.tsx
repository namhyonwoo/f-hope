import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { authApi } from '@/api/api'; // Import authApi instead of axios

const SocialSignupPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [socialSignupToken, setSocialSignupToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      setSocialSignupToken(token);
      // Optionally decode token to pre-fill display name if available
      // const decoded = jwt_decode(token); // You'd need a jwt-decode library
      // setDisplayName(decoded.firstName + ' ' + decoded.lastName);
    } else {
      toast({
        title: 'Error',
        description: 'No social signup token found.',
        variant: 'destructive',
      });
      navigate('/login'); // Redirect to login if no token
    }
  }, [location.search, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialSignupToken) {
      toast({
        title: 'Error',
        description: 'Social signup token is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await authApi.socialSignup({
        socialSignupToken,
        display_name: displayName,
        date_of_birth: dateOfBirth,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        toast({
          title: 'Success',
          description: 'Account created and logged in!',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete social signup.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
          <CardDescription>Please provide your name and date of birth to complete your account setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSignupPage;
