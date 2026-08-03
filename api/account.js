import deleteAccount from "../server/account/delete.js";
import requestDeletion from "../server/account/delete-request.js";
import { json } from "./_utils.js";

const ROUTES = {
  delete: deleteAccount,
  "delete-request": requestDeletion,
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
  if (!routeHandler) return json(res, 404, { error: "Account endpoint not found." });
  return routeHandler(req, res);
}
