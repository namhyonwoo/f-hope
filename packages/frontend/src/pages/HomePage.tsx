import { useState, useEffect } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "@/components/Dashboard";
import { AttendanceCheck } from "@/components/AttendanceCheck";
import { StudentManagement } from "@/components/StudentManagement";
import { TeacherProfile } from "@/components/TeacherProfile";
import { EditStudent } from "@/components/EditStudent";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUserSession(session);
        setCurrentUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setUserSession(session);
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserLogout = async () => {
    try {
      await supabase.auth.signOut();
      setActivePage('dashboard');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const handlePageNavigation = (page: string, studentId?: string) => {
    setActivePage(page);
    if (studentId) {
      setSelectedStudentId(studentId);
    }
  };

  // Show loading spinner while checking authentication
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

  // Show auth form if user is not logged in
  if (!currentUser) {
    return <AuthForm />;
  }

  // Show appropriate page based on activePage state
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