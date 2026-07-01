export type AdminConversationPrefs = {
  pinnedUserIds: string[]
  mutedUserIds: string[]
  blockedUserIds: string[]
  removedUserIds: string[]
  unreadUserIds: string[]
}

const EMPTY_PREFS: AdminConversationPrefs = {
  pinnedUserIds: [],
  mutedUserIds: [],
  blockedUserIds: [],
  removedUserIds: [],
  unreadUserIds: [],
}

function storageKey(adminId: number): string {
  return `gmw-admin-conversation-prefs-${adminId}`
}

export function readAdminConversationPrefs(adminId: number): AdminConversationPrefs {
  try {
    const raw = localStorage.getItem(storageKey(adminId))
    if (!raw) return { ...EMPTY_PREFS }
    const parsed = JSON.parse(raw) as Partial<AdminConversationPrefs>
    return {
      pinnedUserIds: Array.isArray(parsed.pinnedUserIds) ? parsed.pinnedUserIds.map(String) : [],
      mutedUserIds: Array.isArray(parsed.mutedUserIds) ? parsed.mutedUserIds.map(String) : [],
      blockedUserIds: Array.isArray(parsed.blockedUserIds) ? parsed.blockedUserIds.map(String) : [],
      removedUserIds: Array.isArray(parsed.removedUserIds) ? parsed.removedUserIds.map(String) : [],
      unreadUserIds: Array.isArray(parsed.unreadUserIds) ? parsed.unreadUserIds.map(String) : [],
    }
  } catch {
    return { ...EMPTY_PREFS }
  }
}

export function writeAdminConversationPrefs(adminId: number, prefs: AdminConversationPrefs): void {
  localStorage.setItem(storageKey(adminId), JSON.stringify(prefs))
}

export function toPrefSets(prefs: AdminConversationPrefs) {
  return {
    pinnedUserIds: prefs.pinnedUserIds,
    mutedUserIds: new Set(prefs.mutedUserIds),
    blockedUserIds: new Set(prefs.blockedUserIds),
    removedUserIds: new Set(prefs.removedUserIds),
    unreadUserIds: prefs.unreadUserIds,
  }
}

export function fromPrefSets(
  pinnedUserIds: string[],
  mutedUserIds: Set<string>,
  blockedUserIds: Set<string>,
  removedUserIds: Set<string>,
  unreadUserIds: string[],
): AdminConversationPrefs {
  return {
    pinnedUserIds,
    mutedUserIds: [...mutedUserIds],
    blockedUserIds: [...blockedUserIds],
    removedUserIds: [...removedUserIds],
    unreadUserIds: [...unreadUserIds],
  }
}

export function unreadMapFromIds(unreadUserIds: string[]): Record<string, boolean> {
  return Object.fromEntries(unreadUserIds.map((id) => [id, true]))
}

export function unreadIdsFromMap(unreadByUserId: Record<string, boolean>): string[] {
  return Object.entries(unreadByUserId)
    .filter(([, unread]) => unread)
    .map(([id]) => id)
}
