import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchDashboard } from '../api/dashboard';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const resultLabel: Record<string, string> = {
  home: 'Home',
  draw: 'Draw',
  away: 'Away',
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  const loading = authLoading || dashboardLoading;

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner" aria-hidden />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="page">
        <div className="error-state">
          <p>Failed to load. Please try again.</p>
        </div>
      </div>
    );
  }

  const upcoming = dashboard?.upcomingMatches ?? [];
  const upcomingCount = dashboard?.upcomingCount ?? 0;
  const watchlistCount = dashboard?.watchlistCount ?? 0;
  const predictionCount = dashboard?.predictionCount ?? 0;
  const predictionStats = dashboard?.predictionStats;
  const recentPredictions = dashboard?.recentPredictions ?? [];

  return (
    <div className="page dashboard-page">
      <header className="dashboard-intro">
        <p className="dashboard-greeting">
          {user ? (
            <>Hello, {user.name || user.email}.</>
          ) : (
            <span className="muted">Log in to see your watchlist and prediction summary.</span>
          )}
        </p>
      </header>

      <div className="dashboard-cards">
        <Link to="/matches" className="dashboard-card">
          <span className="dashboard-card-value">{upcomingCount}</span>
          <span className="dashboard-card-label">Upcoming</span>
        </Link>
        {user !== null && (
          <>
            <Link to="/watchlist" className="dashboard-card">
              <span className="dashboard-card-value">{watchlistCount}</span>
              <span className="dashboard-card-label">Watchlist</span>
            </Link>
            <Link to="/predictions" className="dashboard-card">
              <span className="dashboard-card-value">{predictionCount}</span>
              <span className="dashboard-card-label">Predictions</span>
            </Link>
          </>
        )}
      </div>

      <section className="dashboard-section dashboard-card-block">
        <h2 className="dashboard-section-title">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="dashboard-empty">
            <p className="muted">No upcoming matches.</p>
            <Link to="/matches" className="dashboard-link-more">View matches</Link>
          </div>
        ) : (
          <>
            <ul className="dashboard-list">
              {upcoming.map((m) => (
                <li key={m.id} className="dashboard-list-item">
                  <Link to={`/matches/${m.id}`} className="dashboard-list-link">
                    {m.homeTeamName} vs {m.awayTeamName}
                  </Link>
                  <span className="dashboard-list-meta">
                    {m.league?.name} · {formatDate(m.matchTime)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="dashboard-section-footer">
              <Link to="/matches" className="dashboard-link-more">View all matches →</Link>
            </p>
          </>
        )}
      </section>

      {user && predictionStats && (predictionStats.totalFinished > 0 || predictionCount > 0) && (
        <section className="dashboard-section dashboard-card-block">
          <h2 className="dashboard-section-title">Prediction stats</h2>
          <div className="dashboard-stats">
            <p className="dashboard-stats-line">
              <strong>{predictionStats.totalFinished}</strong> finished, <strong>{predictionStats.correct}</strong> correct
              {predictionStats.accuracy != null && (
                <> · <strong className="dashboard-stats-accuracy">{predictionStats.accuracy}%</strong> accuracy</>
              )}
            </p>
            {predictionStats.totalFinished === 0 && predictionCount > 0 && (
              <p className="muted">No finished matches yet. Accuracy will show here once results are in.</p>
            )}
          </div>
        </section>
      )}

      {user && recentPredictions.length > 0 && (
        <section className="dashboard-section dashboard-card-block">
          <h2 className="dashboard-section-title">Recent predictions</h2>
          <ul className="dashboard-list">
            {recentPredictions.map((p) => (
              <li key={p.id} className="dashboard-list-item">
                <Link to={`/matches/${p.matchId}`} className="dashboard-list-link">
                  {p.match.homeTeamName} vs {p.match.awayTeamName}
                </Link>
                <span className="dashboard-list-meta">
                  {resultLabel[p.predictedResult] ?? p.predictedResult}
                  {p.confidence != null && ` · ${p.confidence}/10`}
                  {p.isCorrect === true && (
                    <> · <span className="prediction-badge prediction-badge--correct">Correct</span></>
                  )}
                  {p.isCorrect === false && (
                    <> · <span className="prediction-badge prediction-badge--wrong">Wrong</span></>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="dashboard-section-footer">
            <Link to="/predictions" className="dashboard-link-more">View all predictions →</Link>
          </p>
        </section>
      )}
    </div>
  );
}
