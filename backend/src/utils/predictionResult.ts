/**
 * 根据比赛结果计算实际赛果（主胜/平/客胜），用于预测校验。
 */
export function getActualResult(match: {
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}): "home" | "draw" | "away" | null {
  if (match.status !== "finished") return null;
  const h = match.homeScore;
  const a = match.awayScore;
  if (h == null || a == null) return null;
  if (h > a) return "home";
  if (h < a) return "away";
  return "draw";
}

/**
 * 判断预测是否命中。若比赛未结束或无法判定结果，返回 null。
 */
export function isPredictionCorrect(
  predictedResult: string,
  actualResult: "home" | "draw" | "away" | null
): boolean | null {
  if (actualResult === null) return null;
  return predictedResult === actualResult;
}
