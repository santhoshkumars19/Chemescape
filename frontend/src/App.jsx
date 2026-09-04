import './index.css';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Context
import { AuthProvider, useAuth } from './auth/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import CurriculumMismatchGuard from './components/CurriculumMismatchGuard';

// ── ProgressBridge ────────────────────────────────────────────────────────────
// Sits inside BOTH AuthProvider and NavigationProvider.
// On mount it injects NavigationContext's clearProgressState + refreshUserStats
// into AuthContext via registerProgressActions, bridging the two contexts
// without creating a circular import dependency.
function ProgressBridge() {
  const { registerProgressActions } = useAuth();
  const { clearProgressState, refreshUserStats } = useNavigation();
  useEffect(() => {
    registerProgressActions(clearProgressState, refreshUserStats);
  }, [registerProgressActions, clearProgressState, refreshUserStats]);
  return null;
}

// Auth Components
import SplashScreen from './auth/SplashScreen';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';

// Landing Components
import LabBackground from './components/LabBackground';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import EscapeRoomsSection from './components/EscapeRoomsSection';
import LeaderboardSection from './components/LeaderboardSection';
import AchievementsSection from './components/AchievementsSection';
import Footer from './components/Footer';
import PeriodicTableStrip from './components/PeriodicTableStrip';

// Dashboard
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardPage from './dashboard/DashboardPage';
import TeacherDashboardPage from './dashboard/TeacherDashboardPage';
import TeacherQuestionBankPage from './dashboard/TeacherQuestionBankPage';
import AdminDashboardPage from './dashboard/AdminDashboardPage';
import ReportsPage from './dashboard/ReportsPage';

// Pages
import SyllabusPage from './pages/SyllabusPage';
import ChaptersPage from './pages/ChaptersPage';
import MissionBriefPage from './pages/MissionBriefPage';
import LabGamePage from './pages/LabGamePage';
import Room1Page from './pages/Room1Page';
import Room2Page from './pages/Room2Page';
import Room3Page from './pages/Room3Page';
import BossPage  from './pages/BossPage';
import CalculationHeistPage from './pages/CalculationHeistPage';
import QuantumArchitectPage from './pages/QuantumArchitectPage';
import GridReconstructionPage from './pages/GridReconstructionPage';
import HydrogenReactorPage from './pages/HydrogenReactorPage';
import MetalSortingPage from './pages/MetalSortingPage';
import GasSimulatorPage from './pages/GasSimulatorPage';
import InteractiveQuizEngine from './pages/InteractiveQuizEngine';
import MissionCompletePage from './pages/MissionCompletePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import StandardSelectionPage from './pages/StandardSelectionPage';
import SubjectSelectionPage  from './pages/SubjectSelectionPage';

// ── Dashboard Layout Wrapper ──────────────────────────────────────────────────
function DashboardScreen() {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  let dashboardContent = <DashboardPage />;
  if (role === 'TEACHER') {
    dashboardContent = <TeacherDashboardPage />;
  } else if (role === 'ADMIN') {
    dashboardContent = <AdminDashboardPage />;
  }

  return (
    <DashboardLayout>
      {dashboardContent}
    </DashboardLayout>
  );
}

// Protected screens that require a logged-in user
const PROTECTED_SCREENS = [
  'dashboard', 'teacher-questions', 'question-bank', 'questions',
  'reports', 'activity-reports', 'reports-page',
  'select-standard', 'select-subject', 'standards', 'syllabus', 'chapters', 'mission', 'lab',
  'calculation-heist', 'heist', 'quantum-architect', 'quantum',
  'grid-reconstruction', 'grid', 'periodic-grid',
  'hydrogen-reactor', 'hydrogen', 'reactor',
  'metal-sorting', 'element-sorting', 'sorting-factory',
  'gas-simulator', 'gas', 'gas-chamber',
  'room1', 'room2', 'room3', 'boss',
  'mission-complete', 'leaderboard', 'profile', 'settings',
];

// ── Single URL Unified Root Application ───────────────────────────────────────
function SingleUrlUnifiedApp() {
  const { user, logout } = useAuth();
  const { currentScreen, navigateTo } = useNavigation();

  // On every render: if no authenticated user and screen is protected → redirect to landing
  useEffect(() => {
    if (!user && PROTECTED_SCREENS.includes(currentScreen)) {
      navigateTo('landing');
    }
  }, [user, currentScreen, navigateTo]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'teacher-questions':
      case 'question-bank':
      case 'questions':
        return (
          <DashboardLayout>
            <TeacherQuestionBankPage />
          </DashboardLayout>
        );
      case 'reports':
      case 'activity-reports':
      case 'reports-page':
        if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
          return <DashboardScreen />;
        }
        return (
          <DashboardLayout>
            <ReportsPage />
          </DashboardLayout>
        );
      case 'select-standard':
        return <StandardSelectionPage />;
      case 'select-subject':
        return <SubjectSelectionPage />;
      case 'standards':
      case 'syllabus':
        return <SyllabusPage />;
      case 'chapters':
        return <ChaptersPage />;
      case 'mission':
        return <MissionBriefPage />;
      case 'interactive-quiz':
      case 'quiz':
      case 'chapter-quiz':
        return <InteractiveQuizEngine />;
      case 'lab':
        return (
          <CurriculumMismatchGuard gameName="Chemistry 2D Lab Escape">
            <LabGamePage />
          </CurriculumMismatchGuard>
        );
      case 'calculation-heist':
      case 'heist':
        return (
          <CurriculumMismatchGuard gameName="Mole Calculation Heist">
            <CalculationHeistPage />
          </CurriculumMismatchGuard>
        );
      case 'quantum-architect':
      case 'quantum':
        return (
          <CurriculumMismatchGuard gameName="Quantum Orbital Architect">
            <QuantumArchitectPage />
          </CurriculumMismatchGuard>
        );
      case 'grid-reconstruction':
      case 'grid':
      case 'periodic-grid':
        return (
          <CurriculumMismatchGuard gameName="Periodic Grid Reconstruction">
            <GridReconstructionPage />
          </CurriculumMismatchGuard>
        );
      case 'hydrogen-reactor':
      case 'hydrogen':
      case 'reactor':
        return (
          <CurriculumMismatchGuard gameName="Hydrogen Reactor Terminal">
            <HydrogenReactorPage />
          </CurriculumMismatchGuard>
        );
      case 'metal-sorting':
      case 'element-sorting':
      case 'sorting-factory':
        return (
          <CurriculumMismatchGuard gameName="Element Sorting Factory">
            <MetalSortingPage />
          </CurriculumMismatchGuard>
        );
      case 'gas-simulator':
      case 'gas':
      case 'gas-chamber':
        return (
          <CurriculumMismatchGuard gameName="Gas Chamber Simulator">
            <GasSimulatorPage />
          </CurriculumMismatchGuard>
        );
      case 'room1':
        return (
          <CurriculumMismatchGuard gameName="Periodic Table Room 1">
            <Room1Page />
          </CurriculumMismatchGuard>
        );
      case 'room2':
        return (
          <CurriculumMismatchGuard gameName="Quantum Chamber Room 2">
            <Room2Page />
          </CurriculumMismatchGuard>
        );
      case 'room3':
        return (
          <CurriculumMismatchGuard gameName="Reaction Vault Room 3">
            <Room3Page />
          </CurriculumMismatchGuard>
        );
      case 'boss':
        return (
          <CurriculumMismatchGuard gameName="Master Lab Boss">
            <BossPage />
          </CurriculumMismatchGuard>
        );
      case 'mission-complete':
        return <MissionCompletePage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'profile':
      case 'settings':
        if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
          return <TeacherProfilePage />;
        }
        return <ProfilePage />;
      case 'ai-assistant':
      case 'assistant':
        return <DashboardScreen />;
      case 'landing':
      default:
        return (
          <div className="relative min-h-screen bg-[#040810] text-white overflow-x-hidden w-full pb-20">
            <LabBackground />
            <div
              className="fixed inset-0 pointer-events-none -z-10"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.15) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,212,255,0.08) 0%, transparent 60%)
                `
              }}
            />
            <div className="relative z-10 w-full">
              <Navbar user={user} onLogout={logout} />
              <HeroSection />
              <Footer />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#040810] text-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen"
        >
          {renderCurrentScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          {/* Wire clearProgressState + refreshUserStats into AuthContext */}
          <ProgressBridge />
          <SingleUrlUnifiedApp />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
