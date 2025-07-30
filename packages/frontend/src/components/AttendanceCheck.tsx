import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, Users, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { studentApi, attendanceApi, missionApi } from "@/api/api"; // Import new APIs
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Student {
  id: string;
  name: string;
  birthday: string;
  photo?: string;
  parent_contact: string;
  address: string;
}

interface Mission {
  id: string;
  name: string;
  description?: string;
  config: {
    type: 'yes_no' | 'count' | 'number';
    unit?: string;
    max_value?: number;
    default_value?: number;
  };
  talent_reward: number;
  is_active: boolean;
  sort_order: number;
}

interface MissionCompletion {
  id: string;
  mission_id: string;
  student_id: string;
  completion_date: string;
  result: {
    completed: boolean;
    value?: number | boolean;
    notes?: string;
  };
  talent_earned: number;
  mission: Mission;
}

interface MissionStatus {
  mission: Mission;
  completion?: MissionCompletion;
  isCompleted: boolean;
  talentEarned: number;
}

interface AttendanceCheckProps {
  onBack: () => void;
}

export const AttendanceCheck = ({ onBack }: AttendanceCheckProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionStatuses, setMissionStatuses] = useState<Record<string, MissionStatus[]>>({});
  const [missionLoading, setMissionLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [pendingMissionCancel, setPendingMissionCancel] = useState<{
    studentId: string;
    missionId: string;
    missionName: string;
    currentValue?: number;
  } | null>(null);
  const today = new Date().toLocaleDateString('ko-KR');
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchStudentsAndAttendance();
    fetchMissions();
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

  const fetchMissions = async () => {
    try {
      const response = await missionApi.getAllMissions();
      setMissions(response.data || []);
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "미션 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const fetchStudentMissions = async (studentId: string) => {
    setMissionLoading(true);
    try {
      const response = await missionApi.getStudentMissionCompletions(studentId, todayDate);
      setMissionStatuses(prev => ({
        ...prev,
        [studentId]: response.data || []
      }));
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "학생 미션 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setMissionLoading(false);
    }
  };



  const handleStudentSelect = (student: Student) => {
    // 학생 선택 (미션 섹션 표시) - 출석된 학생만
    if (attendance[student.id]) {
      setSelectedStudent(student);
      if (!missionStatuses[student.id]) {
        fetchStudentMissions(student.id);
      }
    } else {
      setSelectedStudent(null);
    }
  };

  const handleAttendanceToggle = (studentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
    
    // 출석이 해제되면 선택된 학생도 해제
    if (attendance[studentId] && selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  const handleMissionToggle = async (studentId: string, missionId: string, completed: boolean, value?: number) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const existingStatus = missionStatuses[studentId]?.find(s => s.mission.id === missionId);
    const isCurrentlyCompleted = existingStatus?.isCompleted || false;

    // 완료된 미션을 취소하려는 경우 확인 대화상자 표시
    if (isCurrentlyCompleted && !completed) {
      setPendingMissionCancel({
        studentId,
        missionId,
        missionName: mission.name,
        currentValue: value
      });
      setShowCancelDialog(true);
      return;
    }

    // 일반적인 미션 토글 처리
    await executeMissionToggle(studentId, missionId, completed, value);
  };

  const executeMissionToggle = async (studentId: string, missionId: string, completed: boolean, value?: number) => {
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const existingStatus = missionStatuses[studentId]?.find(s => s.mission.id === missionId);
      
      if (existingStatus?.completion) {
        // 기존 기록 업데이트
        await missionApi.updateMissionCompletion(existingStatus.completion.id, {
          result: {
            completed,
            value,
            notes: ''
          }
        });
      } else {
        // 새 기록 생성
        await missionApi.createMissionCompletion({
          student_id: studentId,
          mission_id: missionId,
          completion_date: todayDate,
          result: {
            completed,
            value,
            notes: ''
          }
        });
      }

      // 미션 상태 새로고침
      await fetchStudentMissions(studentId);

      toast({
        title: "미션 업데이트 완료",
        description: completed ? `${mission.name} 미션을 완료했습니다!` : `${mission.name} 미션을 취소했습니다.`,
      });
    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.response?.data?.message || "미션 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmMissionCancel = async () => {
    if (!pendingMissionCancel) return;
    
    await executeMissionToggle(
      pendingMissionCancel.studentId,
      pendingMissionCancel.missionId,
      false,
      pendingMissionCancel.currentValue
    );
    
    setShowCancelDialog(false);
    setPendingMissionCancel(null);
  };

  const handleCancelMissionCancel = () => {
    setShowCancelDialog(false);
    setPendingMissionCancel(null);
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
            const isSelected = selectedStudent?.id === student.id;
            
            return (
              <Card 
                key={student.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                  isSelected
                    ? 'border-primary bg-gradient-to-br from-primary/20 to-primary/10'
                    : isPresent 
                      ? 'border-secondary bg-gradient-to-br from-secondary/20 to-secondary/10' 
                      : 'border-muted hover:border-primary/30'
                }`}
                onClick={() => handleStudentSelect(student)}
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
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                          isPresent 
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        onClick={(e) => handleAttendanceToggle(student.id, e)}
                      >
                        {isPresent ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
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
        <div className="flex justify-center mb-8">
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

        {/* 미션 섹션 */}
        {selectedStudent && (
          <div className="mb-8">
            <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedStudent.name}의 미션 수행
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    오늘 수행한 미션을 체크해주세요
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  닫기
                </Button>
              </div>

              {missionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="ml-2 text-muted-foreground">미션 정보를 불러오는 중...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missions.map((mission) => {
                    const status = missionStatuses[selectedStudent.id]?.find(s => s.mission.id === mission.id);
                    const isCompleted = status?.isCompleted || false;
                    const currentValue = status?.completion?.result.value as number || mission.config.default_value || 0;

                    return (
                      <Card 
                        key={mission.id}
                        className={`border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          isCompleted 
                            ? 'border-secondary bg-gradient-to-br from-secondary/10 to-secondary/5' 
                            : 'border-muted hover:border-primary/30'
                        }`}
                        onClick={() => {
                          if (mission.config.type === 'yes_no') {
                            handleMissionToggle(selectedStudent.id, mission.id, !isCompleted);
                          }
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{mission.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{mission.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {mission.talent_reward}달란트
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {mission.config.type === 'yes_no' ? (
                            <div className="flex space-x-2">
                              <Button
                                variant={isCompleted ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMissionToggle(selectedStudent.id, mission.id, !isCompleted);
                                }}
                                className="flex-1 transition-all duration-200"
                              >
                                {isCompleted ? "✅ 완료" : "❌ 미완료"}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max={mission.config.max_value || 100}
                                value={currentValue}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const value = parseInt(e.target.value) || 0;
                                  // 입력값이 변경되면 자동으로 완료 상태로 설정
                                  handleMissionToggle(selectedStudent.id, mission.id, value > 0, value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-20"
                                placeholder="0"
                              />
                              <span className="text-sm text-muted-foreground">
                                {mission.config.unit}
                              </span>
                              <Button
                                variant={isCompleted ? "default" : "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMissionToggle(selectedStudent.id, mission.id, !isCompleted, currentValue);
                                }}
                                className="flex-1 transition-all duration-200"
                              >
                                {isCompleted ? "✅ 완료" : "❌ 미완료"}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 미션 취소 확인 대화상자 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>미션 완료 취소</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingMissionCancel?.missionName}</strong> 미션의 완료를 취소하시겠습니까?
              <br />
              <span className="text-sm text-muted-foreground">
                취소하면 해당 미션의 달란트 보상도 회수됩니다.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelMissionCancel}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmMissionCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              완료 취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
