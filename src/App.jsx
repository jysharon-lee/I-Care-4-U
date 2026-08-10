import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlanHangout from './pages/PlanHangout';
import HangoutInvitation from './pages/HangoutInvitation';
import BoxBuilder from './pages/BoxBuilder';
import PackageViewer from './pages/PackageViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan-hangout" element={<PlanHangout />} />
        <Route path="/hangout-invite" element={<HangoutInvitation />} />
        <Route path="/build-package/:type" element={<BoxBuilder />} />
        <Route path="/package/:id" element={<PackageViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
