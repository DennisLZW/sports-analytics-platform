import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPredictions, removePrediction } from '../api/predictions';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const resultLabel: Record<string, string> = {
  home: 'Home',
  draw: 'Draw',
  away: 'Away',
};

export default function PredictionsPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => fetchPredictions(),
  });

  const removeMutation = useMutation({
    mutationFn: removePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['match'] });
    },
  });

  if (isLoading) {
    return (
      <div className="page predictions-page">
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
      <div className="page predictions-page">
        <div className="page-card-block">
          <div className="error-state">
            <p>Failed to load. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page predictions-page">
      <header className="page-intro">
        <p className="muted">Submit predictions on match detail; view and remove them here.</p>
      </header>
      <div className="page-card-block">
        {items.length === 0 ? (
          <p className="muted">No predictions yet. Add one on a match detail page.</p>
        ) : (
          <ul className="prediction-list">
            {items.map((item) => (
              <li key={item.id} className="prediction-item">
                <div className="prediction-item-main">
                  <Link to={`/matches/${item.matchId}`} className="prediction-match">
                    {item.match.homeTeamName} vs {item.match.awayTeamName}
                  </Link>
                  <span className="prediction-meta">
                    {item.match.league?.name} · {formatDate(item.match.matchTime)}
                  </span>
                  <span className="prediction-result">
                    {resultLabel[item.predictedResult] ?? item.predictedResult}
                    {item.confidence != null && ` (${item.confidence}/10)`}
                  </span>
                  {item.isCorrect === true && (
                    <span className="prediction-badge prediction-badge--correct" aria-label="Correct">Correct</span>
                  )}
                  {item.isCorrect === false && (
                    <span className="prediction-badge prediction-badge--wrong" aria-label="Wrong">Wrong</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeMutation.mutate(item.matchId)}
                  disabled={removeMutation.isPending}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
