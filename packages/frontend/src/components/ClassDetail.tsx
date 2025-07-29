import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Trash2, Users, GraduationCap, Phone, MapPin, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { classApi } from "@/api/api";

interface Class {
  id: string;
  name: string;
  description?: string;
  grade?: number;
  students: Student[];
  created_at: string;
}

interface Student {
  id: string;
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
  class_id?: string;
}

interface ClassDetailProps {
  classId: string;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

export const ClassDetail = ({ classId, onBack, onNavigate }: ClassDetailProps) => {
  const [class_, setClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      const response = await classApi.getClassWithStudents(classId);
      setClass(response.data);
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "반 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await classApi.removeStudentFromClass(studentId);
      await fetchClassDetail(); // 다시 불러오기
      
      toast({
        title: "학생 제거 완료",
        description: "학생이 반에서 제거되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 제거 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">반 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!class_) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">반을 찾을 수 없습니다.</p>
          <Button onClick={onBack} className="mt-4">돌아가기</Button>
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{class_.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {class_.students.length}명의 학생
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => onNavigate('edit-class', class_.id)}
              >
                <Edit className="w-4 h-4 mr-2" />
                반 정보 수정
              </Button>
              <Button 
                onClick={() => onNavigate('add-student-to-class', class_.id)}
                className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                학생 추가
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 반 정보 */}
          <div className="lg:col-span-1">
            <Card className="bg-card/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>반 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{class_.name}</h3>
                  {class_.grade && (
                    <Badge variant="secondary" className="mt-1">
                      {class_.grade}학년
                    </Badge>
                  )}
                </div>
                
                {class_.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">설명</p>
                    <p className="text-sm">{class_.description}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">총 학생 수:</span>
                  <span className="font-medium">{class_.students.length}명</span>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">생성일</p>
                  <p className="text-sm">
                    {new Date(class_.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 학생 목록 */}
          <div className="lg:col-span-2">
            <Card className="bg-card/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>학생 목록</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {class_.students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {class_.students.map((student) => {
                      const age = new Date().getFullYear() - new Date(student.birthday).getFullYear();
                      const birthDate = new Date(student.birthday).toLocaleDateString('ko-KR');
                      
                      return (
                        <Card key={student.id} className="hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={student.photo} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">
                                    {student.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{student.name}</h4>
                                  <p className="text-sm text-muted-foreground">{age}세</p>
                                  <p className="text-xs text-muted-foreground">{birthDate}</p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRemoveStudent(student.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span className="text-muted-foreground">학부모:</span>
                                <span className="font-medium">{student.parent_contact}</span>
                              </div>
                              <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="w-3 h-3 text-muted-foreground mt-0.5" />
                                <div>
                                  <span className="text-muted-foreground">주소:</span>
                                  <p className="font-medium text-xs">{student.address}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      등록된 학생이 없습니다
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      이 반에 학생을 추가해보세요.
                    </p>
                    <Button 
                      onClick={() => onNavigate('add-student-to-class', class_.id)}
                      className="bg-gradient-to-r from-secondary to-secondary/80"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      학생 추가하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}; 