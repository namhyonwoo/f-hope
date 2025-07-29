import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { classApi } from "@/api/api";

interface CreateClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateClassDialog = ({ isOpen, onClose, onSuccess }: CreateClassDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "입력 오류",
        description: "반 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        grade: formData.grade ? parseInt(formData.grade) : undefined,
      };

      await classApi.createClass(submitData);
      
      toast({
        title: "반 생성 완료",
        description: `${formData.name} 반이 생성되었습니다.`,
      });

      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        grade: '',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "반 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        grade: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 반 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">반 이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="예: 1반, A반, 유치부"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">학년</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="학년을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1학년</SelectItem>
                <SelectItem value="2">2학년</SelectItem>
                <SelectItem value="3">3학년</SelectItem>
                <SelectItem value="4">4학년</SelectItem>
                <SelectItem value="5">5학년</SelectItem>
                <SelectItem value="6">6학년</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="반에 대한 설명을 입력하세요 (선택사항)"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
            >
              {loading ? "생성 중..." : "반 만들기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 