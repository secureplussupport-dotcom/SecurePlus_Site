// Supabase verifies the email before granting a session; this never logs a user in locally.
export async function sendEmailAccessLink(auth,{email,origin,createUser=true,referralCode=''}){
 const address=String(email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))throw new Error('Please enter a valid email address.');
 const options={emailRedirectTo:new URL(origin).origin,shouldCreateUser:createUser};
 if(createUser)options.data={name:address.split('@')[0],avatar_id:'default-cipher',pending_referral_code:referralCode};
 const {error}=await auth.signInWithOtp({email:address,options});
 if(error)throw error;
}
