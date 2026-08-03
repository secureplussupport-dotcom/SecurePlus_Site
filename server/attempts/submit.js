import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";

const ACTIVE_MCQ_COUNT = 412;
const ACTIVE_PBQ_COUNT = 105;
const SESSION_TYPES = new Set(["exam", "practice", "pbq"]);

function cleanSessionType(value) {
  const sessionType = String(value || "").trim().toLowerCase();
  return SESSION_TYPES.has(sessionType) ? sessionType : "";
}

function numberInRange(value, min, max, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function cleanChapterId(value) {
  const chapter = String(value || "").trim();
  return /^[1-5]$/.test(chapter) ? chapter : null;
}

function isMissingAchievementsSchema(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "42883" ||
    error?.code === "PGRST204" ||
    error?.code === "PGRST205" ||
    /achievements|user_achievements|total_stars|duration_seconds|questions_count|session_type|award_user_achievement|schema cache|relation/i.test(error?.message || "")
  );
}

async function countDistinctAnsweredQuestions(supabase, userId, questionType) {
  const { data, error } = await supabase
    .from("attempts")
    .select("question_id")
    .eq("user_id", userId)
    .eq("question_type", questionType)
    .not("question_id", "like", "session:%")
    .limit(5000);

  if (error) throw error;
  return new Set((data || []).map(row => row.question_id).filter(Boolean)).size;
}

async function awardAchievement(supabase, userId, achievementId) {
  const { data, error } = await supabase.rpc("award_user_achievement", {
    target_user_id: userId,
    target_achievement_id: achievementId,
  });
  if (error) throw error;
  return Boolean(data);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before submitting a session." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const body = await getJsonBody(req);
    const sessionType = cleanSessionType(body.session_type);
    if (!sessionType) return json(res, 400, { error: "session_type must be exam, practice, or pbq." });

    const score = numberInRange(body.score, 0, 100, 0);
    const durationSeconds = Math.round(numberInRange(body.duration_seconds, 0, 24 * 60 * 60, 0));
    const questionsCount = Math.round(numberInRange(body.questions_count, 1, 500, 1));
    const chapterId = cleanChapterId(body.chapter_id);
    const correct = score >= 80;

    const sessionAttempt = {
      user_id: authData.user.id,
      question_id: `session:${sessionType}:${Date.now()}`,
      question_type: `session_${sessionType}`,
      title: `${sessionType === "exam" ? "Exam" : sessionType === "pbq" ? "PBQ" : "Practice"} session summary`,
      domain: sessionType,
      chapter: chapterId,
      correct,
      score,
      session_type: sessionType,
      duration_seconds: durationSeconds,
      questions_count: questionsCount,
    };

    const { error: insertError } = await supabase.from("attempts").insert(sessionAttempt);
    if (insertError) throw insertError;

    let coinReward = null;
    if (sessionType === "practice" && questionsCount >= 5 && score === 100) {
      const rewardDate = new Date().toISOString().slice(0, 10);
      const { data: rewardData, error: rewardError } = await supabase.rpc("award_cipher_coins", {
        target_user_id: authData.user.id,
        reward_amount: 15,
        reward_event_type: "perfect_mcq",
        reward_reference_key: `perfect_mcq:${rewardDate}`,
        reward_metadata: {
          score,
          questionsCount,
          rewardDate,
          dailyCap: 1,
        },
      });
      if (rewardError) {
        if (!isMissingAchievementsSchema(rewardError)) {
          console.warn("Perfect MCQ Cipher Coin reward failed:", rewardError);
        }
      } else if (rewardData?.ok) {
        coinReward = rewardData;
      }
    }

    const qualified = new Set();
    if (sessionType === "exam" && questionsCount >= 50 && score === 100) qualified.add("flawless_victory");
    if (sessionType === "exam" && questionsCount >= 50 && score >= 80 && durationSeconds < 600) qualified.add("speed_demon");
    if (sessionType === "practice" && questionsCount === 10 && score === 100 && durationSeconds < 90) qualified.add("blitz_run");
    if (sessionType === "practice" && chapterId && score === 100) qualified.add("domain_master");

    const [mcqPractised, pbqPractised] = await Promise.all([
      countDistinctAnsweredQuestions(supabase, authData.user.id, "mcq"),
      countDistinctAnsweredQuestions(supabase, authData.user.id, "pbq"),
    ]);

    if (mcqPractised >= ACTIVE_MCQ_COUNT) qualified.add("no_stone_unturned");
    if (pbqPractised >= ACTIVE_PBQ_COUNT) qualified.add("pbq_crusher");

    const newlyUnlocked = [];
    for (const achievementId of qualified) {
      if (await awardAchievement(supabase, authData.user.id, achievementId)) {
        newlyUnlocked.push(achievementId);
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_stars")
      .eq("id", authData.user.id)
      .maybeSingle();

    return json(res, 200, {
      success: true,
      newlyUnlocked,
      total_stars: profile?.total_stars ?? null,
      coinReward,
      cipherCoins: coinReward?.balance ?? null,
    });
  } catch (error) {
    console.error("Achievement session submission failed:", error);
    if (isMissingAchievementsSchema(error)) {
      return json(res, 409, {
        error: "Achievements database setup is missing. Run supabase/achievements.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: "Unable to submit session achievements." });
  }
}
