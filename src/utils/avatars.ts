/** All available avatar emojis — single source of truth. */
export const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']

/** Resolve an avatar index to an emoji, wrapping safely. */
export function avatarEmoji(index: number): string {
  return AVATARS[index % AVATARS.length]
}
