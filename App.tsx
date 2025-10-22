
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import { OnboardingModal } from './components/OnboardingModal';
import { NavBar } from './components/NavBar';

const AppContent: React.FC = () => {
    const { state } = useAppContext();

    if (!state.settings.onboardingComplete) {
        return <OnboardingModal />;
    }

    return (
        <HashRouter>
            <div className="min-h-screen flex flex-col">
                <NavBar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/notifications" element={<Notifications />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
