import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlanHangout from './pages/PlanHangout';
import HangoutInvitation from './pages/HangoutInvitation';
import BoxBuilder from './pages/BoxBuilder';
import PackageViewer from './pages/PackageViewer';
import RageRoom from './pages/RageRoom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/plan-hangout" element={<PlanHangout />} />
      <Route path="/hangout-invite" element={<HangoutInvitation />} />
      <Route path="/build-package/:type" element={<BoxBuilder />} />
      <Route path="/package/:id" element={<PackageViewer />} />
      <Route path="/rage-room" element={<RageRoom />} />
    </Routes>
  );
}

export default App;
