import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { studentApi, classApi } from "@/api/api";

interface Student {
  id: string;
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
  class_id?: string;
}

interface AddStudentToClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  onSuccess: () => void;
}

export const AddStudentToClassDialog = ({ 
  isOpen, 
  onClose, 
  classId, 
  className, 
  onSuccess 
}: AddStudentToClassDialogProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllStudents();
      // 반에 속하지 않은 학생들만 필터링
      const availableStudents = response.data.filter((student: Student) => !student.class_id);
      setStudents(availableStudents);
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "선택 오류",
        description: "추가할 학생을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // 각 학생을 반에 추가
      for (const studentId of selectedStudents) {
        await classApi.assignStudentToClass({
          studentId,
          classId,
        });
      }

      toast({
        title: "학생 추가 완료",
        description: `${selectedStudents.length}명의 학생이 ${className}에 추가되었습니다.`,
      });

      setSelectedStudents([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.parent_contact.includes(searchTerm)
  );

  const availableStudentsCount = students.length;
  const selectedCount = selectedStudents.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <span>{className}에 학생 추가</span>
          </DialogTitle>
          <DialogDescription>
            반에 추가할 학생을 선택해주세요. (반에 속하지 않은 학생들만 표시됩니다)
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* 검색 및 통계 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="학생 이름이나 연락처로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  사용 가능한 학생: {availableStudentsCount}명
                </span>
                <span className="text-muted-foreground">
                  선택된 학생: {selectedCount}명
                </span>
              </div>
              {selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudents([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  선택 해제
                </Button>
              )}
            </div>
          </div>

          {/* 학생 목록 */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-2 text-muted-foreground">학생 목록을 불러오는 중...</span>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const age = new Date().getFullYear() - new Date(student.birthday).getFullYear();
                const isSelected = selectedStudents.includes(student.id);
                
                return (
                  <div
                    key={student.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/30'
                    }`}
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleStudentToggle(student.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={student.photo} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate">{student.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {age}세
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        📞 {student.parent_contact}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        📍 {student.address}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "검색 결과가 없습니다" : "추가할 수 있는 학생이 없습니다"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "다른 검색어를 시도해보세요." 
                    : "모든 학생이 이미 반에 배정되어 있습니다."
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button 
            onClick={handleAddStudents}
            disabled={selectedCount === 0 || saving}
            className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {saving ? "추가 중..." : `${selectedCount}명 추가하기`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 