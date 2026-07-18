import coinAction from "../server/economy/coins-action.js";
import coinWallet from "../server/economy/coins-me.js";
import referralClaim from "../server/economy/referral-claim.js";
import referralProfile from "../server/economy/referral-me.js";
import { json } from "./_utils.js";

const ROUTES = {
  "coins-action": coinAction,
  "coins-me": coinWallet,
  "referrals-claim": referralClaim,
  "referrals-me": referralProfile,
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
  const operation = getOperation(req);
  const routeHandler = ROUTES[operation];

  if (!routeHandler) {
    return json(res, 404, { error: "Economy endpoint not found." });
  }

  return routeHandler(req, res);
}
