import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Users, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { classApi } from "@/api/api";
import { CreateClassDialog } from "./CreateClassDialog";

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

interface ClassManagementProps {
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

export const ClassManagement = ({ onBack, onNavigate }: ClassManagementProps) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classApi.getAllClasses();
      setClasses(response.data || []);
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "반 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <p className="text-muted-foreground">반 목록을 불러오는 중...</p>
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
                <h1 className="text-xl font-bold text-foreground">반 관리</h1>
                <p className="text-sm text-muted-foreground">총 {classes.length}개의 반</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/80 hover:to-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              반 추가
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-secondary to-secondary/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              반 추가하기
            </Button>
          </div>
        )}
      </main>

      {/* 반 생성 다이얼로그 */}
      <CreateClassDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={fetchClasses}
      />
    </div>
  );
}; 