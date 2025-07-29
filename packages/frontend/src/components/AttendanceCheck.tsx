import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Check, X, Users, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { studentApi, attendanceApi } from "@/api/api"; // Import new APIs

interface Student {
  id: string;
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
}

interface AttendanceCheckProps {
  onBack: () => void;
}

export const AttendanceCheck = ({ onBack }: AttendanceCheckProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toLocaleDateString('ko-KR');
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, []);

  const fetchStudentsAndAttendance = async () => {
    try {
      // Fetch students
      const studentsResponse = await studentApi.getAllStudents();
      const studentsData: Student[] = studentsResponse.data;

      // Fetch today's attendance records
      const attendanceResponse = await attendanceApi.getAttendanceRecordsByDate(todayDate);
      const attendanceData = attendanceResponse.data;

      setStudents(studentsData || []);
      
      const attendanceMap: Record<string, boolean> = {};
      attendanceData?.forEach((record: any) => { // Adjust type to any for now
        attendanceMap[record.student_id] = record.is_present;
      });
      setAttendance(attendanceMap);
      
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceToggle = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        attendance_date: todayDate,
        is_present: attendance[student.id] || false
      }));

      await attendanceApi.upsertAttendanceRecords(attendanceRecords);

      const presentCount = Object.values(attendance).filter(Boolean).length;
      toast({
        title: "출석부 저장 완료",
        description: `총 ${students.length}명 중 ${presentCount}명이 출석했습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "출석부 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">출석 정보를 불러오는 중...</p>
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
                <h1 className="text-xl font-bold text-foreground">출석 체크</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                {presentCount}/{students.length}명
              </Badge>
              <Badge variant="default" className="text-sm bg-primary">
                {attendanceRate}% 출석률
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 안내 메시지 */}
        <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4 mb-6 flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-secondary-foreground" />
          <div>
            <p className="font-medium text-secondary-foreground">출석 체크 (개발 모드)</p>
            <p className="text-sm text-muted-foreground">
              각 학생의 이름을 터치하여 출석을 체크하세요. (개발 단계에서는 모든 요일에 출석 체크 가능)
            </p>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {students.map((student) => {
            const isPresent = attendance[student.id];
            const age = new Date().getFullYear() - new Date(student.birthday).getFullYear();
            
            return (
              <Card 
                key={student.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                  isPresent 
                    ? 'border-secondary bg-gradient-to-br from-secondary/20 to-secondary/10' 
                    : 'border-muted hover:border-primary/30'
                }`}
                onClick={() => handleAttendanceToggle(student.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.photo} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">
                          {student.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{age}세</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isPresent 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPresent ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>📞 {student.parent_contact}</p>
                    <p>📍 {student.address}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="px-8 h-14 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-lg"
          >
            <Check className="w-5 h-5 mr-2" />
            {saving ? "저장 중..." : "출석부 저장하기"}
          </Button>
        </div>
      </main>
    </div>
  );
};
