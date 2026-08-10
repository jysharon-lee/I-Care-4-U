import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RageRoom from './pages/RageRoom';
import PlanHangout from './pages/PlanHangout';
import HangoutInvitation from './pages/HangoutInvitation';
import GetWellSoon from './pages/GetWellSoon';
import Care4U from './pages/Care4U';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rage-room" element={<RageRoom />} />
      <Route path="/plan-hangout" element={<PlanHangout />} />
      <Route path="/hangout-invite" element={<HangoutInvitation />} />
      <Route path="/get-well" element={<GetWellSoon />} />
      <Route path="/care4u" element={<Care4U />} />
    </Routes>
  );
}

export default App;
