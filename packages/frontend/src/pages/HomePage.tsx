import { useState, useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { AttendanceCheck } from "@/components/AttendanceCheck";
import { StudentManagement } from "@/components/StudentManagement";
import { TeacherProfile } from "@/components/TeacherProfile";
import { EditStudent } from "@/components/EditStudent";
import { authApi, profileApi } from "@/api/api"; // Import authApi and profileApi

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null); // Change User to any
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authApi.getProfile();
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('accessToken');
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleUserLogin = async (token: string) => {
    localStorage.setItem('accessToken', token);
    try {
      const response = await authApi.getProfile();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile after login:', error);
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
    }
  };

  const handleUserLogout = () => {
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const handlePageNavigation = (page: string, studentId?: string) => {
    setActivePage(page);
    if (studentId) {
      setSelectedStudentId(studentId);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">앱 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm onLoginSuccess={handleUserLogin} />;
  }

  switch (activePage) {
    case 'attendance':
      return <AttendanceCheck onBack={() => setActivePage('dashboard')} />;
    case 'students':
      return <StudentManagement onBack={() => setActivePage('dashboard')} onNavigate={handlePageNavigation} />;
    case 'profile':
      return <TeacherProfile onBack={() => setActivePage('dashboard')} currentUser={currentUser.email || '사용자'} />;
    case 'edit-student':
      return selectedStudentId ? (
        <EditStudent 
          studentId={selectedStudentId} 
          onBack={() => setActivePage('students')} 
        />
      ) : (
        <div>학생을 선택해주세요</div>
      );
    default:
      return (
        <Dashboard 
          onLogout={handleUserLogout}
          onNavigate={handlePageNavigation}
          currentUser={currentUser.email || '사용자'}
        />
      );
  }
};

export default HomePage;
