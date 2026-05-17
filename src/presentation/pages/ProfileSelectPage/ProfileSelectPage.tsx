import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import './ProfileSelectPage.css'
import { useProfile } from '../../hooks/useProfile'
import { AVATARS } from '../../../utils/avatars'
import { PinModal } from '../../components/PinModal/PinModal'
import type { IProfile } from '../../../domain/entities/profile.entity'

export function ProfileSelectPage() {
  const navigate = useNavigate()
  const { profiles, selectProfile, deleteProfile } = useProfile()

  // PIN verification modal state
  const [pinProfile, setPinProfile] = useState<IProfile | null>(null)

  const handleSelect = async (profile: IProfile) => {
    if (profile.pinHash) {
      setPinProfile(profile)
      return
    }
    await selectProfile(profile.id)
    navigate({ to: '/dashboard' })
  }

  const handlePinSuccess = async () => {
    if (!pinProfile) return
    await selectProfile(pinProfile.id)
    setPinProfile(null)
    navigate({ to: '/dashboard' })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Naozaj chceš odstrániť tento profil?')) {
      void deleteProfile(id)
    }
  }

  return (
    <div className="profile-select" data-testid="profile-select-page">
      <header className="profile-select__header">
        <h1 className="profile-select__title">Slovlingva</h1>
        <p className="profile-select__subtitle">Kto hrá?</p>
      </header>

      <main className="profile-select__main">
        <div className="profile-select__grid">
          {profiles.map(p => (
            <div key={p.id} className="profile-card">
              <button
                className="profile-card__body"
                data-testid="profile-card"
                onClick={() => handleSelect(p)}
                aria-label={`Vybrať profil ${p.name}`}
              >
                <span className="profile-card__avatar">{AVATARS[p.avatarIndex % AVATARS.length]}</span>
                <span className="profile-card__name">{p.name}</span>
                <span className="profile-card__level">Level {p.level}</span>
                <span className="profile-card__xp">{p.totalXP} XP</span>
                {p.streak > 0 && (
                  <span className="profile-card__streak">🔥 {p.streak}</span>
                )}
                {p.pinHash && (
                  <span className="profile-card__lock" aria-label="Chránené PINom">🔒</span>
                )}
              </button>
              <button
                className="profile-card__delete"
                data-testid="profile-delete-btn"
                onClick={(e) => handleDelete(e, p.id)}
                aria-label={`Odstrániť profil ${p.name}`}
              >
                ×
              </button>
            </div>
          ))}

          <button
            className="profile-card profile-card--new"
            data-testid="new-player-btn"
            onClick={() => navigate({ to: '/register' })}
            aria-label="Vytvoriť nový profil"
          >
            <span className="profile-card__plus">+</span>
            <span className="profile-card__name">Nový hráč</span>
          </button>
        </div>
      </main>

      {/* PIN verification modal */}
      {pinProfile && (
        <PinModal
          profileName={pinProfile.name}
          avatar={AVATARS[pinProfile.avatarIndex % AVATARS.length]}
          pinHash={pinProfile.pinHash!}
          onSuccess={handlePinSuccess}
          onCancel={() => setPinProfile(null)}
        />
      )}
    </div>
  )
}
