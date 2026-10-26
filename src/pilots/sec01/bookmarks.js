// Use the same keys and authenticated star endpoint as the Flashcards page.
export function createLessonBookmarks({getSession, request, storage}) {
  const ownerOf = session => session?.user?.email?.trim().toLowerCase() || session?.user?.id || 'guest';
  async function context() {
    const session = await getSession();
    return {owner:ownerOf(session), signedIn:Boolean(session?.access_token)};
  }
  async function load() {
    const current = await context();
    const keys = current.signedIn
      ? (await request('star',{action:'list'})).stars.map(row=>row.question_key).reverse()
      : JSON.parse((await storage.get('starred:guest'))?.value || '[]');
    if (!Array.isArray(keys)) throw new Error('Unable to load saved terms.');
    return {...current,keys};
  }
  async function toggle(state, cardId) {
    const current = await context();
    if (current.owner!==state.owner || current.signedIn!==state.signedIn)
      throw new Error('Your sign-in changed. Reload saved terms first.');
    // Refresh before mutating so another tab’s saved questions are preserved.
    const fresh = await load();
    if(fresh.owner!==state.owner || fresh.signedIn!==state.signedIn)
      throw new Error('Your sign-in changed. Reload saved terms first.');
    const key = `flashcard:${cardId}`, saved = !fresh.keys.includes(key);
    if (current.signedIn) {
      const result = await request('star',{action:saved?'save':'remove',key,...(saved?{type:'flashcard',id:cardId}:{})});
      if (saved && !result.saved) throw new Error('Unable to save this term. Try again.');
    }
    const keys = saved ? [key,...fresh.keys] : fresh.keys.filter(item=>item!==key);
    // A signed-in save is authoritative on the server; local cache failure must
    // not turn a successful cloud save into a misleading failed toggle.
    try {await storage.set(`starred:${current.owner}`,JSON.stringify(keys));}
    catch(error) {if(!current.signedIn)throw error;}
    return {...current,keys};
  }
  return {load,toggle};
}
