import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save, Loader2 } from "lucide-react";
import { profileApi } from "@/api/api";
import { useToast } from "@/hooks/use-toast";

interface TeacherProfileProps {
  onBack: () => void;
  currentUser: any; // User 객체 전체를 받도록 변경
}

export const TeacherProfile = ({ onBack, currentUser }: TeacherProfileProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      const data = response.data;

      setProfile(data);
      setDisplayName(data.display_name || '');
      
      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      console.error('프로필 조회 에러:', error);
      toast({
        title: "에러",
        description: error.response?.data?.message || "프로필 정보를 불러오지 못했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.updateProfile({
        display_name: displayName,
      });

      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다.",
      });

      fetchProfile();
    } catch (error: any) {
      console.error('프로필 저장 에러:', error);
      toast({
        title: "에러",
        description: error.response?.data?.message || "프로필 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "에러",
        description: "파일 크기는 5MB 이하여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const response = await profileApi.uploadAvatar(file);
      setAvatarUrl(response.data.avatarUrl + '?t=' + Date.now());
      toast({
        title: "성공",
        description: "프로필 사진이 업로드되었습니다.",
      });
      fetchProfile();
    } catch (error: any) {
      console.error('파일 업로드 에러:', error);
      toast({
        title: "에러",
        description: error.response?.data?.message || "파일 업로드에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">프로필 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          대시보드로 돌아가기
        </Button>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary">
              마이 프로필
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 프로필 사진 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    alt="프로필 사진" 
                  />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {displayName ? displayName.charAt(0).toUpperCase() : '👤'}
                  </AvatarFallback>
                </Avatar>
                
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              
              {uploading && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  업로드 중...
                </div>
              )}
            </div>

            {/* 이름 수정 */}
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-base font-medium">
                이름
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="bg-white/70"
              />
            </div>

            {/* 이메일 (읽기 전용) - User 엔티티의 email 필드 사용 */}
            <div className="space-y-2">
              <Label className="text-base font-medium">이메일</Label>
              <Input
                value={currentUser?.email || '이메일 정보 없음'}
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>

            {/* 역할 (읽기 전용) */}
            <div className="space-y-2">
              <Label className="text-base font-medium">역할</Label>
              <Input
                value="교사"
                disabled
                className="bg-gray-50 text-gray-600"
              />
            </div>

            {/* 저장 버튼 */}
            <Button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  프로필 저장
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
