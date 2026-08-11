import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { TelegramLoginPage } from './components/auth'
import { FocusLayout, MainLayout } from './components/layout'
import { SplashScreen } from './components/splash'
import { useAppSplash } from './hooks/useAppSplash'
import { useAuthGateway } from './hooks/useAuthGateway'
import { CreatePage } from './pages/CreatePage'
import { DailyPage } from './pages/DailyPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { ImageStudioPage } from './pages/ImageStudioPage'
import { LibraryPage } from './pages/LibraryPage'
import { MusicStudioPage } from './pages/MusicStudioPage'
import { PremiumPage } from './pages/PremiumPage'
import { ProfilePage } from './pages/ProfilePage'
import { ResultPage } from './pages/ResultPage'
import { VideoStudioPage } from './pages/VideoStudioPage'
import { UiKitPage } from './pages/dev/UiKitPage'

/**
 * Порядок старта: gateway (браузер) → splash → приложение.
 * В Telegram gateway пропускается — initData уже есть.
 */
function App() {
  const { showGateway, continueFromGateway } = useAuthGateway()
  const splash = useAppSplash()

  if (showGateway) {
    return <TelegramLoginPage onContinue={continueFromGateway} />
  }

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
          <Route path="library" element={<LibraryPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="create/:mode" element={<CreatePage />} />
          <Route path="video" element={<VideoStudioPage />} />
          <Route path="image" element={<ImageStudioPage />} />
          <Route path="music" element={<MusicStudioPage />} />
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
