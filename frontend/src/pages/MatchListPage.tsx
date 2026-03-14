import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLeagues } from '../api/leagues';
import { fetchMatches, type Match } from '../api/matches';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: 'Scheduled',
    live: 'Live',
    finished: 'Finished',
    cancelled: 'Cancelled',
  };
  const cls = status === 'live' ? 'match-status live' : 'match-status';
  return <span className={cls}>{map[status] ?? status}</span>;
}

export default function MatchListPage() {
  const [leagueId, setLeagueId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const { data: leagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => fetchLeagues(),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', leagueId || undefined, status || undefined],
    queryFn: () =>
      fetchMatches({
        leagueId: leagueId || undefined,
        status: status || undefined,
        limit: 50,
      }),
  });

  const matches = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="page match-list-page">
      <header className="page-intro">
        <p className="muted">Filter by league and status; click for details and odds.</p>
      </header>

      <div className="page-card-block">
        <div className="filters">
          <label>
            <span>League</span>
            <select value={leagueId} onChange={(e) => setLeagueId(e.target.value)}>
              <option value="">All</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner" aria-hidden />
            <p>Loading…</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <p>Failed to load. Please try again.</p>
          </div>
        )}
        {!isLoading && !error && matches.length === 0 && (
          <div className="empty-state">
            <p className="muted">No matches.</p>
          </div>
        )}

        {!isLoading && matches.length > 0 && (
          <>
            <ul className="match-list">
              {matches.map((m: Match) => (
                <li key={m.id} className="match-item">
                  <Link to={`/matches/${m.id}`} className="match-link">
                    <span className="match-teams">
                      {m.homeTeamName} vs {m.awayTeamName}
                    </span>
                    <span className="match-meta">
                      {m.league?.name} · {formatDate(m.matchTime)} · <StatusBadge status={m.status} />
                      {(m.status === 'finished' || m.status === 'live') && m.homeScore != null && m.awayScore != null && (
                        <> · {m.homeScore} - {m.awayScore}</>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {total > 0 && <p className="match-total">{total} match{total !== 1 ? 'es' : ''}</p>}
          </>
        )}
      </div>
    </div>
  );
}
