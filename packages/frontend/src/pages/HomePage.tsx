import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { AttendanceCheck } from "@/components/AttendanceCheck";
import { StudentManagement } from "@/components/StudentManagement";
import { TeacherProfile } from "@/components/TeacherProfile";
import { EditStudent } from "@/components/EditStudent";
import { authApi, profileApi } from "@/api/api";

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = async () => {
    console.log('HomePage: checking authentication...');
    const token = localStorage.getItem('accessToken');
    console.log('HomePage: token from localStorage', token);

    if (token) {
      try {
        const response = await authApi.getProfile();
        console.log('HomePage: user profile fetched', response.data);
        setCurrentUser(response.data);
      } catch (error) {
        console.error('HomePage: Failed to fetch user profile:', error);
        localStorage.removeItem('accessToken');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setAuthLoading(false);
  };

  // URL 파라미터에서 토큰 처리
  const handleUrlToken = async () => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      console.log('HomePage: token found in URL', token);
      localStorage.setItem('accessToken', token);
      
      // URL에서 토큰 파라미터 제거
      navigate('/dashboard', { replace: true });
      
      // 사용자 프로필 가져오기
      try {
        const response = await authApi.getProfile();
        console.log('HomePage: user profile fetched from URL token', response.data);
        setCurrentUser(response.data);
      } catch (error) {
        console.error('HomePage: Failed to fetch user profile from URL token:', error);
        localStorage.removeItem('accessToken');
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    // URL 토큰 처리 먼저
    handleUrlToken().then(() => {
      // 그 다음 기존 인증 체크
      checkAuth();
    });
  }, [location.search]); // location.search가 변경될 때마다 실행

  const handleUserLogin = async (token: string) => {
    console.log('HomePage: handleUserLogin called with token', token);
    setAuthLoading(true);
    localStorage.setItem('accessToken', token);
    try {
      const response = await authApi.getProfile();
      console.log('HomePage: user profile fetched after login', response.data);
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile after login:', error);
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
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
      return <TeacherProfile onBack={() => setActivePage('dashboard')} currentUser={currentUser} />;
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
          currentUser={currentUser.display_name || '사용자'}
        />
      );
  }
};

export default HomePage;
