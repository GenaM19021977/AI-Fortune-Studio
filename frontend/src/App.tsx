import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { FocusLayout, MainLayout } from './components/layout'
import { SplashScreen } from './components/splash'
import { useAppSplash } from './hooks/useAppSplash'
import { CreatePage } from './pages/CreatePage'
import { DailyPage } from './pages/DailyPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { PremiumPage } from './pages/PremiumPage'
import { ProfilePage } from './pages/ProfilePage'
import { ResultPage } from './pages/ResultPage'
import { UiKitPage } from './pages/dev/UiKitPage'

/**
 * Корневой роутер + splash при cold start («Открыть студию» в боте).
 */
function App() {
  const splash = useAppSplash()

  if (splash.visible) {
    return (
      <SplashScreen progress={splash.progress} statusText={splash.statusText} />
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="daily" element={<DailyPage />} />
          {/* Макет Create с BottomNav */}
          <Route path="create" element={<CreatePage />} />
          <Route path="create/:mode" element={<CreatePage />} />
        </Route>

        <Route element={<FocusLayout />}>
          <Route path="result/:id" element={<ResultPage />} />
          <Route path="premium" element={<PremiumPage />} />
        </Route>

        <Route path="dev/ui" element={<UiKitPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
