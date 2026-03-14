import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchMatch, fetchMatchOdds, fetchMatchPredictionStats, type MatchOdds } from '../api/matches';
import { addToWatchlist, removeFromWatchlist } from '../api/watchlist';
import { upsertPrediction, removePrediction } from '../api/predictions';
import { useAuth } from '../contexts/AuthContext';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function oddsChartData(odds: MatchOdds[]) {
  return odds.map((o) => ({
    time: new Date(o.recordedAt).toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    home: o.homeOdds,
    draw: o.drawOdds ?? undefined,
    away: o.awayOdds,
  }));
}

const resultOptions = [
  { value: 'home', label: 'Home' },
  { value: 'draw', label: 'Draw' },
  { value: 'away', label: 'Away' },
];

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [predResult, setPredResult] = useState('home');
  const [predConfidence, setPredConfidence] = useState<number | ''>(5);

  const {
    data: detail,
    isLoading: matchLoading,
    error: matchError,
  } = useQuery({
    queryKey: ['match', id],
    queryFn: () => fetchMatch(id!),
    enabled: !!id,
  });

  const match = detail?.match;
  const inWatchlist = detail?.inWatchlist ?? false;
  const userPrediction = detail?.userPrediction;

  const { data: odds = [] } = useQuery({
    queryKey: ['match-odds', id],
    queryFn: () => fetchMatchOdds(id!),
    enabled: !!id && !!match,
  });

  const { data: predictionStats } = useQuery({
    queryKey: ['match-prediction-stats', id],
    queryFn: () => fetchMatchPredictionStats(id!),
    enabled: !!id && !!match,
  });

  const watchlistAdd = useMutation({
    mutationFn: () => addToWatchlist(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
  const watchlistRemove = useMutation({
    mutationFn: () => removeFromWatchlist(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const predictionUpsert = useMutation({
    mutationFn: () =>
      upsertPrediction(id!, predResult, predConfidence === '' ? undefined : Number(predConfidence)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['match-prediction-stats', id] });
    },
  });
  const predictionRemove = useMutation({
    mutationFn: () => removePrediction(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['match-prediction-stats', id] });
    },
  });

  if (!id) {
    return (
      <div className="page match-detail-page">
        <div className="page-card-block">
          <p>Invalid match ID.</p>
          <p className="back-link"><Link to="/matches">← Matches</Link></p>
        </div>
      </div>
    );
  }

  if (matchLoading || !match) {
    return (
      <div className="page match-detail-page">
        <div className="page-card-block">
          {matchLoading && <p>Loading…</p>}
          {matchError && <p>Failed to load. Please try again.</p>}
          {!matchLoading && !match && !matchError && <p>Match not found.</p>}
          <p className="back-link"><Link to="/matches">← Matches</Link></p>
        </div>
      </div>
    );
  }

  const chartData = odds.length > 0 ? oddsChartData(odds) : [];

  return (
    <div className="page match-detail-page">
      <p className="back-link">
        <Link to="/matches">← Matches</Link>
      </p>

      <div className="page-card-block match-detail-header">
        <h1 className="page-card-title">
          {match.homeTeamName} vs {match.awayTeamName}
        </h1>
        <p className="match-detail-meta">
          {match.league?.name} · {formatDate(match.matchTime)}
        </p>
        <p className="match-detail-status">
          {match.status === 'scheduled' && 'Scheduled'}
          {match.status === 'live' && 'Live'}
          {match.status === 'finished' && 'Finished'}
          {match.status === 'cancelled' && 'Cancelled'}
          {(match.status === 'finished' || match.status === 'live') &&
            match.homeScore != null &&
            match.awayScore != null && (
              <span className="score">
                {' '}
                {match.homeScore} - {match.awayScore}
              </span>
            )}
        </p>
      </div>

      {user && (
        <div className="page-card-block match-detail-actions">
          <div className="action-group">
            <span className="action-label">Watchlist</span>
            {inWatchlist ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => watchlistRemove.mutate()}
                disabled={watchlistRemove.isPending}
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => watchlistAdd.mutate()}
                disabled={watchlistAdd.isPending}
              >
                Add to watchlist
              </button>
            )}
          </div>

          <div className="action-group">
            <span className="action-label">Prediction</span>
            {userPrediction ? (
              <div className="prediction-current">
                <span>
                  Current: {resultOptions.find((o) => o.value === userPrediction.predictedResult)?.label ?? userPrediction.predictedResult}
                  {userPrediction.confidence != null && ` (confidence ${userPrediction.confidence}/10)`}
                </span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => predictionRemove.mutate()}
                  disabled={predictionRemove.isPending}
                >
                  Remove prediction
                </button>
              </div>
            ) : null}
            <div className="prediction-form">
              <select
                value={predResult}
                onChange={(e) => setPredResult(e.target.value)}
                className="input-select"
              >
                {resultOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label className="confidence-label">
                Confidence (1-10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={predConfidence}
                  onChange={(e) =>
                    setPredConfidence(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                  }
                  className="input-num"
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={() => predictionUpsert.mutate()}
                disabled={predictionUpsert.isPending}
              >
                {userPrediction ? 'Update prediction' : 'Submit prediction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {predictionStats && predictionStats.total > 0 && (
        <div className="page-card-block prediction-stats-block">
          <h2 className="page-card-title">Crowd prediction</h2>
          <p className="prediction-stats-summary">
            <strong>{predictionStats.total}</strong> prediction{predictionStats.total !== 1 ? 's' : ''}
          </p>
          <ul className="prediction-stats-list">
            <li className="prediction-stats-item">
              <span className="prediction-stats-label">Home</span>
              <span className="prediction-stats-bar-wrap">
                <span
                  className="prediction-stats-bar prediction-stats-bar--home"
                  style={{ width: `${predictionStats.total ? (predictionStats.home / predictionStats.total) * 100 : 0}%` }}
                />
              </span>
              <span className="prediction-stats-value">
                {predictionStats.home}
                {predictionStats.total > 0 && (
                  <> ({Math.round((predictionStats.home / predictionStats.total) * 100)}%)</>
                )}
              </span>
            </li>
            <li className="prediction-stats-item">
              <span className="prediction-stats-label">Draw</span>
              <span className="prediction-stats-bar-wrap">
                <span
                  className="prediction-stats-bar prediction-stats-bar--draw"
                  style={{ width: `${predictionStats.total ? (predictionStats.draw / predictionStats.total) * 100 : 0}%` }}
                />
              </span>
              <span className="prediction-stats-value">
                {predictionStats.draw}
                {predictionStats.total > 0 && (
                  <> ({Math.round((predictionStats.draw / predictionStats.total) * 100)}%)</>
                )}
              </span>
            </li>
            <li className="prediction-stats-item">
              <span className="prediction-stats-label">Away</span>
              <span className="prediction-stats-bar-wrap">
                <span
                  className="prediction-stats-bar prediction-stats-bar--away"
                  style={{ width: `${predictionStats.total ? (predictionStats.away / predictionStats.total) * 100 : 0}%` }}
                />
              </span>
              <span className="prediction-stats-value">
                {predictionStats.away}
                {predictionStats.total > 0 && (
                  <> ({Math.round((predictionStats.away / predictionStats.total) * 100)}%)</>
                )}
              </span>
            </li>
          </ul>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="page-card-block odds-chart">
          <h2 className="page-card-title">Odds history</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="home" name="Home" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="draw" name="Draw" stroke="#888" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="away" name="Away" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {odds.length > 0 && chartData.length === 0 && (
        <div className="page-card-block">
          <p className="odds-note">No odds history yet.</p>
        </div>
      )}
      {odds.length === 0 && (
        <div className="page-card-block">
          <p className="odds-note">No odds data.</p>
        </div>
      )}
    </div>
  );
}
