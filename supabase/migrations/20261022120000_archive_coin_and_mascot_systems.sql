-- Archive without deleting balances, transactions, unlocks, placement records, or functions.
-- Old clients must not be able to mutate the economy through service API RPCs.
DO $archive$
DECLARE fn record;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS grant_new_user_cipher_welcome ON public.profiles';
  END IF;
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN (
      'award_cipher_coins', 'claim_cipher_daily_check_in', 'record_cipher_daily_challenge',
      'purchase_cipher_coin_item', 'consume_cipher_exam_pass', 'claim_referral_reward'
    )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated, service_role',fn.signature);
  END LOOP;
  IF to_regclass('public.mascot_placements') IS NOT NULL THEN
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON TABLE public.mascot_placements FROM anon, authenticated, service_role';
  END IF;
END
$archive$;
