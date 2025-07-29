import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Edit, Trash2, Phone, MapPin, GraduationCap, Users } from "lucide-react";
import { AddStudentDialog } from "./AddStudentDialog";
import { CreateClassDialog } from "./CreateClassDialog";
import { toast } from "@/hooks/use-toast";
import { studentApi, classApi } from "@/api/api"; // Import new API

interface Student {
  id: string;
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
  class_id?: string;
  class?: {
    id: string;
    name: string;
  };
}

interface Class {
  id: string;
  name: string;
  description?: string;
  grade?: number;
  students: Student[];
  created_at: string;
}

interface StudentManagementProps {
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

export const StudentManagement = ({ onBack, onNavigate }: StudentManagementProps) => {
  console.log('StudentManagement component rendered');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    console.log('Fetching students...');
    try {
      const response = await studentApi.getAllStudents();
      console.log('Students response:', response);
      
      // 응답이 배열인지 확인
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setStudents([]);
        toast({
          title: "데이터 형식 오류",
          description: "서버에서 올바른 데이터를 받지 못했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
      setStudents([]);
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    console.log('Fetching classes...');
    try {
      const response = await classApi.getAllClasses();
      console.log('Classes response:', response);
      
      // 응답이 배열인지 확인
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setClasses([]);
        toast({
          title: "데이터 형식 오류",
          description: "서버에서 올바른 데이터를 받지 못했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      setClasses([]);
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "반 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
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

  const handleDeleteClass = async (classId: string) => {
    try {
      const class_ = classes.find(c => c.id === classId);
      
      await classApi.deleteClass(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
      
      toast({
        title: "반 삭제 완료",
        description: `${class_?.name} 반이 삭제되었습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "반 삭제 중 오류가 발생했습니다.",
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
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'students' ? `총 ${students.length}명의 학생` : `총 ${classes.length}개의 반`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* 탭 버튼 */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={activeTab === 'students' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('students')}
                  className="flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>학생 관리</span>
                </Button>
                <Button
                  variant={activeTab === 'classes' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('classes')}
                  className="flex items-center space-x-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>반 관리</span>
                </Button>
              </div>
              
              {/* 액션 버튼 */}
              {activeTab === 'students' ? (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  학생 추가
                </Button>
              ) : (
                <Button 
                  onClick={() => setIsCreateClassDialogOpen(true)}
                  className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  반 추가
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'students' ? (
          <>
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
                            {student.class && (
                              <Badge variant="secondary" className="mt-1">
                                {student.class.name}
                              </Badge>
                            )}
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
          </>
        ) : (
          <>
            {/* 반 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((class_) => (
                <Card 
                  key={class_.id}
                  className="hover:shadow-lg transition-all duration-300 border-0 bg-card/95 backdrop-blur-sm cursor-pointer"
                  onClick={() => onNavigate('class-detail', class_.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{class_.name}</CardTitle>
                          {class_.grade && (
                            <Badge variant="secondary" className="mt-1">
                              {class_.grade}학년
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('edit-class', class_.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(class_.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {class_.description && (
                      <p className="text-sm text-muted-foreground">{class_.description}</p>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">학생 수:</span>
                      <span className="font-medium">{class_.students.length}명</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">생성일:</span>
                      <span className="font-medium">
                        {new Date(class_.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 빈 상태 */}
            {classes.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  등록된 반이 없습니다
                </h3>
                <p className="text-muted-foreground mb-6">
                  첫 번째 반을 등록해보세요.
                </p>
                <Button 
                  onClick={() => setIsCreateClassDialogOpen(true)}
                  className="bg-gradient-to-r from-secondary to-secondary/80"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  반 추가하기
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 학생 추가 다이얼로그 */}
      <AddStudentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddStudent}
      />

      {/* 반 생성 다이얼로그 */}
      <CreateClassDialog
        isOpen={isCreateClassDialogOpen}
        onClose={() => setIsCreateClassDialogOpen(false)}
        onSuccess={fetchClasses}
      />
    </div>
  );
};
