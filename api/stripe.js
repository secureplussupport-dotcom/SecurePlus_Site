import cancelMembership from "../server/stripe/cancel.js";
import checkout from "../server/stripe/checkout.js";
import portal from "../server/stripe/portal.js";
import syncBilling from "../server/stripe/sync.js";
import webhook from "../server/stripe/webhook.js";
import { json } from "./_utils.js";

const ROUTES = {
  cancel: cancelMembership,
  checkout,
  portal,
  sync: syncBilling,
  webhook,
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
    return json(res, 404, { error: "Stripe endpoint not found." });
  }

  return routeHandler(req, res);
}
