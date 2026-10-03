// Every writer obtains this transaction-scoped lock before reading retry state,
// owner rows, manifests or projections. Missing schema/enrollment fails closed.
export async function assertOwnerWritable(tx, ownerId, enrollmentId = null) {
  const [row] = await tx`select adaptive_private.assert_owner_writable(${ownerId}::uuid,${enrollmentId}::uuid) as enrollment_id`;
  return row.enrollment_id;
}
