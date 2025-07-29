import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, UserPlus, LogOut, CheckCircle2, Clock, User, GraduationCap } from "lucide-react";
import { studentApi, attendanceApi } from "@/api/api"; // Import new APIs

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (page: string, id?: string) => void;
  currentUser: string;
}

export const Dashboard = ({ onLogout, onNavigate, currentUser }: DashboardProps) => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const isSunday = today.getDay() === 0;
  const todayDate = today.toISOString().split('T')[0];
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total students
      const studentsResponse = await studentApi.getAllStudents();
      setTotalStudents(studentsResponse.data.length);

      // Fetch today's attendance summary
      const attendanceSummaryResponse = await attendanceApi.getAttendanceSummary(todayDate);
      setPresentToday(attendanceSummaryResponse.data.presentToday);

    } catch (error) {
      console.error('Dashboard 데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* 헤더 */}
      <header className="bg-card/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => onNavigate('profile')}
            >
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">유년부 출석부</h1>
              <p className="text-sm text-muted-foreground">{currentUser} 선생님</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 오늘 날짜 및 상태 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {today.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </h2>
            <Badge 
              variant="default"
              className="bg-secondary text-secondary-foreground"
            >
              개발 모드 - 출석 가능
            </Badge>
          </div>
          
          <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4 flex items-center space-x-3">
            <Clock className="w-5 h-5 text-secondary-foreground" />
            <p className="text-sm text-secondary-foreground">
              개발 단계에서는 모든 요일에 출석 체크가 가능합니다.
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/10 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  전체 학생
                </CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : `${totalStudents}명`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  오늘 출석
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : `${presentToday}명`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  출석률
                </CardTitle>
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : `${attendanceRate}%`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>출석 체크</CardTitle>
                  <CardDescription>
                    오늘 출석을 체크하세요 (개발 모드)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                onClick={() => onNavigate('attendance')}
              >
                출석 체크하기
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle>학생 관리</CardTitle>
                  <CardDescription>
                    학생 정보를 확인하고 추가하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full h-12 border-secondary text-secondary-foreground hover:bg-secondary"
                onClick={() => onNavigate('students')}
              >
                학생 관리하기
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>반 관리</CardTitle>
                  <CardDescription>
                    반 정보와 학생들을 관리하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full h-12 border-accent text-accent-foreground hover:bg-accent"
                onClick={() => onNavigate('classes')}
              >
                반 관리하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
