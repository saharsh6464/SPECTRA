import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaClipboardList, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

const CompanySidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/company', icon: <FaHome /> },
    { name: 'Tests', path: '/company/tests', icon: <FaClipboardList /> },
    { name: 'Questions', path: '/company/questions', icon: <FaQuestionCircle /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-700/50">
      <div className="flex-shrink-0 p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-center text-slate-300">Company Portal</h2>
      </div>
      <nav className="flex-grow flex flex-col justify-between p-4">
        <div className="space-y-2">
          {navItems.map(({ name, path, icon }) => (
            <NavLink
              to={path}
              key={name}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              end={path === '/company'}
            >
              <span className="text-lg">{icon}</span>
              <span>{name}</span>
            </NavLink>
          ))}
        </div>
        <div className="space-y-2">
          <hr className="border-t border-slate-700/50 my-2" />
          <NavLink
            to="/company/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg"><FaCog /></span>
            <span>Settings</span>
          </NavLink>
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

export default CompanySidebar;
