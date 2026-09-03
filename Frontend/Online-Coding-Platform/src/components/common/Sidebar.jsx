import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaLaptopCode, FaClock, FaHistory, FaSignOutAlt, FaBookOpen } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/student', icon: <FaHome /> },
    { name: 'My Tests', path: '/student/tests', icon: <FaLaptopCode /> },
    { name: 'Upcoming Tests', path: '/student/upcoming', icon: <FaClock /> },
    { name: 'Question Bank', path: '/student/questions', icon: <FaBookOpen /> },
    { name: 'Test History', path: '/student/history', icon: <FaHistory /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-700/50">
      <div className="flex-shrink-0 p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-center text-slate-300">Student Portal</h2>
      </div>
      <nav className="flex-grow flex flex-col justify-between p-4">
        {/* Main navigation links */}
        <div className="space-y-2">
          {navItems.map(({ name, path, icon }) => (
            <NavLink
              to={path}
              key={name}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              end={path === '/student'}
            >
              <span className="text-lg">{icon}</span>
              <span>{name}</span>
            </NavLink>
          ))}
        </div>

        {/* Bottom navigation */}
        <div className="space-y-2">
          <hr className="border-t border-slate-700/50 my-2" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-400 cursor-pointer"
          >
            <span className="text-lg"><FaSignOutAlt /></span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;