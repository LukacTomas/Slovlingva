/**
 * ResetPasswordUseCase — sends a password reset email for a given username.
 *
 * Steps:
 *   1. Look up recovery email from /usernames/{username}
 *   2. If no recovery email → throw (tell user to contact parent)
 *   3. Send Firebase password reset email to the recovery address
 */
import type { IAuthService, IUsernameRegistry } from '../../domain/ports/IAuthService'

export class ResetPasswordUseCase {
  private readonly authService: IAuthService
  private readonly usernameRegistry: IUsernameRegistry

  constructor(authService: IAuthService, usernameRegistry: IUsernameRegistry) {
    this.authService = authService
    this.usernameRegistry = usernameRegistry
  }

  async execute(username: string): Promise<void> {
    const recoveryEmail = await this.usernameRegistry.getRecoveryEmailByUsername(username)
    if (!recoveryEmail) {
      throw new Error('Pre tento účet nie je nastavený e-mail na obnovenie hesla. Požiadaj rodiča o pomoc.')
    }

    await this.authService.resetPassword(recoveryEmail)
  }
}
