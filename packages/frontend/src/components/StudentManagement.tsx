import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, UserPlus, Edit, Trash2, Phone, MapPin } from "lucide-react";
import { AddStudentDialog } from "./AddStudentDialog";
import { toast } from "@/hooks/use-toast";
import { studentApi } from "@/api/api"; // Import new API

interface Student {
  id: string;
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
}

interface StudentManagementProps {
  onBack: () => void;
  onNavigate: (page: string, studentId?: string) => void;
}

export const StudentManagement = ({ onBack, onNavigate }: StudentManagementProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAllStudents();
      setStudents(response.data || []);
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

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      const response = await studentApi.createStudent(studentData);
      setStudents(prev => [...prev, response.data]);
      toast({
        title: "학생 등록 완료",
        description: `${studentData.name} 학생이 등록되었습니다.`, 
      });
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      
      await studentApi.deleteStudent(studentId);

      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast({
        title: "학생 삭제 완료",
        description: `${student?.name} 학생이 삭제되었습니다.`, 
      });
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">학생 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* 헤더 */}
      <header className="bg-card/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">학생 관리</h1>
                <p className="text-sm text-muted-foreground">총 {students.length}명의 학생</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              학생 추가
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 학생 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const age = new Date().getFullYear() - new Date(student.birthday).getFullYear();
            const birthDate = new Date(student.birthday).toLocaleDateString('ko-KR');
            
            return (
              <Card 
                key={student.id}
                className="hover:shadow-lg transition-all duration-300 border-0 bg-card/95 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={student.photo} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-lg">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{age}세</p>
                        <p className="text-xs text-muted-foreground">{birthDate}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => onNavigate('edit-student', student.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">학부모:</span>
                    <span className="font-medium">{student.parent_contact}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">주소:</span>
                      <p className="font-medium">{student.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 빈 상태 */}
        {students.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              등록된 학생이 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 학생을 등록해보세요.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-secondary to-secondary/80"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              학생 추가하기
            </Button>
          </div>
        )}
      </main>

      {/* 학생 추가 다이얼로그 */}
      <AddStudentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddStudent}
      />
    </div>
  );
};
