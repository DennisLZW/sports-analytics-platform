import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWatchlist, removeFromWatchlist } from '../api/watchlist';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function WatchlistPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });

  if (isLoading) {
    return (
      <div className="page watchlist-page">
        <div className="page-card-block">
          <div className="loading-state">
            <div className="loading-spinner" aria-hidden />
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="page watchlist-page">
        <div className="page-card-block">
          <div className="error-state">
            <p>Failed to load. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page watchlist-page">
      <header className="page-intro">
        <p className="muted">Saved matches appear on the dashboard for quick access.</p>
      </header>
      <div className="page-card-block">
        {items.length === 0 ? (
          <p className="muted">No saved matches. Add matches from the match detail page.</p>
        ) : (
          <ul className="match-list">
            {items.map((item) => (
              <li key={item.id} className="match-item">
                <div className="match-item-row">
                  <Link to={`/matches/${item.matchId}`} className="match-link">
                    <span className="match-teams">
                      {item.match.homeTeamName} vs {item.match.awayTeamName}
                    </span>
                    <span className="match-meta">
                      {item.match.league?.name} · {formatDate(item.match.matchTime)} · {item.match.status === 'scheduled' ? 'Scheduled' : item.match.status === 'finished' ? 'Finished' : item.match.status}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeMutation.mutate(item.matchId)}
                    disabled={removeMutation.isPending}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
