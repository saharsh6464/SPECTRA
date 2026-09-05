import React, { useState, useEffect } from 'react';
import { FaSave, FaBuilding, FaInfoCircle, FaUser } from 'react-icons/fa';
import { getCompanies, updateCompany, createCompany } from '../../api/company';

const CompanySettings = () => {
  const loggedUser = JSON.parse(localStorage.getItem('user')) || {};
  const [company, setCompany] = useState({
    id: null,
    companyName: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const companies = await getCompanies();
        // Match company associated with current user
        const currentCompany = companies.find(
          c => (c.user?.id && c.user.id === loggedUser.id) ||
               (c.user?.username && c.user.username === loggedUser.username)
        );

        if (currentCompany) {
          setCompany({
            id: currentCompany.id,
            companyName: currentCompany.companyName || '',
            description: currentCompany.description || '',
          });
        } else {
          // If no company record exists yet, set default from username
          setCompany({
            id: null,
            companyName: loggedUser.username || '',
            description: '',
          });
        }
      } catch (err) {
        console.error("Error loading company profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [loggedUser.id, loggedUser.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (company.id) {
        const updated = await updateCompany(company.id, {
          id: company.id,
          companyName: company.companyName,
          description: company.description,
          user: { id: loggedUser.id, username: loggedUser.username }
        });
        setCompany(prev => ({
          ...prev,
          companyName: updated.companyName,
          description: updated.description
        }));
        setMessage('Company profile updated successfully!');
      } else {
        const created = await createCompany({
          companyName: company.companyName,
          description: company.description,
          user: { id: loggedUser.id, username: loggedUser.username }
        });
        setCompany({
          id: created.id,
          companyName: created.companyName,
          description: created.description,
        });
        setMessage('Company profile created successfully!');
      }
    } catch (err) {
      console.error("Failed to save company settings:", err);
      setError('Failed to save settings. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-slate-400 p-6">Loading company settings...</div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Company Profile & Settings</h1>
        <p className="text-slate-400">Manage your company details according to the platform model.</p>
      </header>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white flex items-center mb-6">
            <FaBuilding className="mr-2 text-indigo-400" /> Company Profile Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Account Username
              </label>
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400">
                <FaUser className="text-slate-500 text-xs" />
                <span>{loggedUser.username || "N/A"}</span>
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={company.companyName}
                onChange={(e) => setCompany(prev => ({ ...prev, companyName: e.target.value }))}
                required
                placeholder="Enter registered company name"
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                Company Description
              </label>
              <textarea
                id="description"
                rows="4"
                value={company.description}
                onChange={(e) => setCompany(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe your company, domain, or assessment objectives..."
                className="w-full py-2 px-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <FaSave />
            <span>Save Company Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
