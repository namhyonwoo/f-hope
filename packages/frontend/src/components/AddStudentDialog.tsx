import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Student {
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
}

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: Student) => void;
}

export const AddStudentDialog = ({ isOpen, onClose, onAdd }: AddStudentDialogProps) => {
  const [formData, setFormData] = useState<Student>({
    name: "",
    birthday: "",
    photo: "",
    parent_contact: "",
    address: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthday || !formData.parent_contact || !formData.address) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    onAdd(formData);
    setFormData({
      name: "",
      birthday: "",
      photo: "",
      parent_contact: "",
      address: ""
    });
    onClose();
  };

  const handleInputChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <span>새 학생 등록</span>
          </DialogTitle>
          <DialogDescription>
            새로운 학생의 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="학생 이름을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">생년월일 *</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentContact">학부모 연락처 *</Label>
            <Input
              id="parentContact"
              value={formData.parent_contact}
              onChange={(e) => handleInputChange('parent_contact', e.target.value)}
              placeholder="010-0000-0000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">주소 *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="주소를 입력하세요"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">사진 (선택)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="사진 URL을 입력하세요"
              />
              <Button type="button" variant="outline" size="sm">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              나중에 사진을 추가할 수도 있습니다.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              등록하기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};