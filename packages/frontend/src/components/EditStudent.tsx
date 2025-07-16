import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EditStudentProps {
  studentId: string;
  onBack: () => void;
}

export const EditStudent = ({ studentId, onBack }: EditStudentProps) => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    parent_contact: "",
    address: "",
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) {
        console.error('학생 정보 조회 에러:', error);
        toast({
          title: "에러",
          description: "학생 정보를 불러오지 못했습니다.",
          variant: "destructive",
        });
        return;
      }

      setStudent(data);
      setFormData({
        name: data.name || "",
        birthday: data.birthday || "",
        parent_contact: data.parent_contact || "",
        address: data.address || "",
      });

      // 학생 사진 URL 생성
      if (data.photo) {
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(data.photo);
        setPhotoUrl(publicUrl);
      }
    } catch (error) {
      console.error('학생 정보 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/students/${studentId}.${fileExt}`;

      // 기존 파일 삭제
      if (student?.photo) {
        await supabase.storage
          .from('profiles')
          .remove([student.photo]);
      }

      // 새 파일 업로드
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // 학생 정보에 photo URL 업데이트
      const { error: updateError } = await supabase
        .from('students')
        .update({ photo: fileName })
        .eq('id', studentId);

      if (updateError) {
        throw updateError;
      }

      // 새 URL 설정
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);
      
      setPhotoUrl(publicUrl + '?t=' + Date.now()); // 캐시 방지

      toast({
        title: "성공",
        description: "학생 사진이 업로드되었습니다.",
      });

      fetchStudent();
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      toast({
        title: "에러",
        description: "파일 업로드에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "에러",
        description: "학생 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: formData.name,
          birthday: formData.birthday || null,
          parent_contact: formData.parent_contact || null,
          address: formData.address || null,
        })
        .eq('id', studentId);

      if (error) {
        throw error;
      }

      toast({
        title: "성공",
        description: "학생 정보가 저장되었습니다.",
      });

      fetchStudent();
    } catch (error) {
      console.error('학생 정보 저장 에러:', error);
      toast({
        title: "에러",
        description: "학생 정보 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // 학생 사진 삭제
      if (student?.photo) {
        await supabase.storage
          .from('profiles')
          .remove([student.photo]);
      }

      // 출석 기록 먼저 삭제
      await supabase
        .from('attendance_records')
        .delete()
        .eq('student_id', studentId);

      // 학생 정보 삭제
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) {
        throw error;
      }

      toast({
        title: "성공",
        description: "학생 정보가 삭제되었습니다.",
      });

      onBack();
    } catch (error) {
      console.error('학생 삭제 에러:', error);
      toast({
        title: "에러",
        description: "학생 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">학생 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">학생 정보를 찾을 수 없습니다.</p>
          <Button onClick={onBack} className="mt-4">
            돌아가기
          </Button>
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
          학생 관리로 돌아가기
        </Button>

        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary">
              학생 정보 수정
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 학생 사진 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage 
                    src={photoUrl || undefined} 
                    alt="학생 사진" 
                  />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {formData.name ? formData.name.charAt(0) : '👤'}
                  </AvatarFallback>
                </Avatar>
                
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
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

            {/* 학생 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                이름 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="학생 이름을 입력하세요"
                className="bg-white/70"
              />
            </div>

            {/* 생년월일 */}
            <div className="space-y-2">
              <Label htmlFor="birthday" className="text-base font-medium">
                생년월일
              </Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                className="bg-white/70"
              />
            </div>

            {/* 보호자 연락처 */}
            <div className="space-y-2">
              <Label htmlFor="parent_contact" className="text-base font-medium">
                보호자 연락처
              </Label>
              <Input
                id="parent_contact"
                value={formData.parent_contact}
                onChange={(e) => handleInputChange('parent_contact', e.target.value)}
                placeholder="보호자 연락처를 입력하세요"
                className="bg-white/70"
              />
            </div>

            {/* 주소 */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium">
                주소
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="주소를 입력하세요"
                className="bg-white/70 min-h-[80px]"
              />
            </div>

            {/* 버튼들 */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </>
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={deleting}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>학생 정보 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 {formData.name} 학생의 정보를 삭제하시겠습니까?
                      이 작업은 되돌릴 수 없으며, 모든 출석 기록도 함께 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          삭제 중...
                        </>
                      ) : (
                        "삭제"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};