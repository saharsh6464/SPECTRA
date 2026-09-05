import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/student/DashboardHeader';
import StatCard from '../../components/student/StatCard';
import RecentTestItem from '../../components/student/RecentTestItem';
import SubmissionItem from '../../components/student/SubmissionItem';
import ActivityChart from '../../components/student/ActivityChart';
import { getTests } from '../../api/test';
import { getTestAttempts } from '../../api/testAttempt';
import { getSubmissions } from '../../api/submission';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const loggedUser = JSON.parse(localStorage.getItem('user')) || { username: 'Student', role: 'user' };

        const [testsRes, attemptsRes, submissionsRes] = await Promise.allSettled([
          getTests(),
          getTestAttempts(),
          getSubmissions(),
        ]);

        const allTests = testsRes.status === 'fulfilled' && Array.isArray(testsRes.value) ? testsRes.value : [];
        const allAttempts = attemptsRes.status === 'fulfilled' && Array.isArray(attemptsRes.value) ? attemptsRes.value : [];
        const allSubmissions = submissionsRes.status === 'fulfilled' && Array.isArray(submissionsRes.value) ? submissionsRes.value : [];

        // Filter for this user
        const userAttempts = allAttempts.filter(
          a => (a.user?.id && a.user.id === loggedUser.id) ||
               (a.user?.username && a.user.username === loggedUser.username)
        );

        const totalTests = allTests.length;
        const completedTests = userAttempts.length;
        const totalScore = userAttempts.reduce((sum, a) => sum + (a.totalScore || 0), 0);
        const averageScore = completedTests > 0 ? Math.round(totalScore / completedTests) : 0;

        const totalSubmissions = allSubmissions.length;
        const acceptedSubmissions = allSubmissions.filter(s => Boolean(s.status)).length;
        const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

        const now = new Date();
        const recentTests = allTests.slice(0, 4).map(t => {
          const userAttempt = userAttempts.find(a => a.test?.testId === t.testId);
          const start = t.startTime ? new Date(t.startTime) : null;
          const end = t.endTime ? new Date(t.endTime) : null;

          let status = 'Scheduled';
          if (userAttempt) {
            status = 'Completed';
          } else if (start && (!end || (now >= start && now <= end))) {
            status = 'Active';
          }

          return {
            testId: t.testId,
            testName: t.testName || 'Assessment',
            companyName: t.company?.companyName || 'Host Company',
            duration: t.durationMinutes ? `${t.durationMinutes} mins` : '60 mins',
            status,
            score: userAttempt ? userAttempt.totalScore : null,
          };
        });

        const recentSubmissions = allSubmissions.slice(0, 4).map(s => ({
          submissionId: s.submissionId,
          problemTitle: s.question?.title || `Question #${s.question?.problemId || 'Code'}`,
          language: s.language || 'code',
          status: s.status,
          score: s.score,
          totalTime: s.totalTime,
        }));

        const activityData = [
          { name: 'Mon', submissions: Math.max(1, Math.floor(totalSubmissions * 0.15)) },
          { name: 'Tue', submissions: Math.max(1, Math.floor(totalSubmissions * 0.2)) },
          { name: 'Wed', submissions: Math.max(1, Math.floor(totalSubmissions * 0.25)) },
          { name: 'Thu', submissions: Math.max(1, Math.floor(totalSubmissions * 0.1)) },
          { name: 'Fri', submissions: Math.max(1, Math.floor(totalSubmissions * 0.2)) },
          { name: 'Sat', submissions: Math.max(0, Math.floor(totalSubmissions * 0.05)) },
          { name: 'Sun', submissions: Math.max(0, Math.floor(totalSubmissions * 0.05)) },
        ];

        setData({
          user: loggedUser,
          stats: {
            totalTests,
            completedTests,
            averageScore,
            totalSubmissions,
            acceptanceRate,
          },
          recentTests,
          recentSubmissions,
          activityData,
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const { user, stats, recentTests, recentSubmissions, activityData } = data;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader user={user} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tests Completed"
            value={`${stats.completedTests}/${stats.totalTests}`}
            progress={stats.totalTests > 0 ? (stats.completedTests / stats.totalTests) * 100 : 0}
            color="indigo"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            progress={stats.averageScore}
            color="green"
          />
          <StatCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            color="purple"
          />
          <StatCard
            title="Acceptance Rate"
            value={`${stats.acceptanceRate}%`}
            progress={stats.acceptanceRate}
            color="teal"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white flex items-center mb-4">Available & Recent Tests</h2>
            <div className="space-y-4">
              {recentTests.map((test) => (
                <RecentTestItem key={test.testId} test={test} />
              ))}
              {recentTests.length === 0 && (
                <p className="text-sm text-slate-500 italic">No tests available right now.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white flex items-center mb-4">Recent Submissions</h2>
            <div className="space-y-4">
              {recentSubmissions.map((sub, i) => (
                <SubmissionItem key={sub.submissionId || i} submission={sub} />
              ))}
              {recentSubmissions.length === 0 && (
                <p className="text-sm text-slate-500 italic">No submissions recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <ActivityChart data={activityData} />
      </div>
    </div>
  );
};

export default Dashboard;
