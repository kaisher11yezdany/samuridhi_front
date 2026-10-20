import Sidebar from './Sidebar';
import Header  from './Header';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <Sidebar />
      <Header />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}
