import history from "../server/question-overrides/history.js";
import revert from "../server/question-overrides/revert.js";
import save from "../server/question-overrides/save.js";
import { json } from "./_utils.js";

const ROUTES = {
  history,
  revert,
  save,
};

function getOperation(req) {
  const queryValue = req.query?.operation;
  if (Array.isArray(queryValue)) return String(queryValue[0] || "");
  if (queryValue) return String(queryValue);

  try {
    return new URL(req.url || "", "http://localhost").searchParams.get("operation") || "";
  } catch {
    return "";
  }
}

export default async function handler(req, res) {
  const routeHandler = ROUTES[getOperation(req)];
  if (!routeHandler) return json(res, 404, { error: "Question Manager endpoint not found." });
  return routeHandler(req, res);
}
