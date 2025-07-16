import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Heart, Users, UserPlus, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthFormProps {}

export const AuthForm = ({}: AuthFormProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: username,
          password: password,
          options: {
            data: {
              name: name
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "회원가입 완료",
          description: "이메일을 확인하여 계정을 활성화해주세요.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });
        
        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message || "인증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google 로그인 에러:', error.message);
      }
    } catch (error) {
      console.error('Google 로그인 실패:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              유년부 출석부
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {isSignup ? "새로운 교사 계정을 만들어보세요" : "교사 로그인으로 시작하세요"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="교사 이름을 입력하세요"
                  required
                  className="h-12"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="교사 아이디를 입력하세요"
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
            >
              {isSignup ? <UserPlus className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
              {isSignup ? "회원가입" : "로그인"}
            </Button>
            
            <div className="relative my-6">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-2 text-sm text-muted-foreground">또는</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-300"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google로 계속하기
            </Button>
            <div className="text-center mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setUsername("");
                  setPassword("");
                  setName("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignup ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 회원가입"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};