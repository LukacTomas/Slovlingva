import { useState } from 'react'
import './ProfileSelectPage.css'
import { useProfile } from '../../hooks/useProfile'
import { AVATARS } from '../../../utils/avatars'
import type { AppPage } from '../../../App'

interface ProfileSelectPageProps {
  onNavigate: (page: AppPage) => void
}

export function ProfileSelectPage({ onNavigate }: ProfileSelectPageProps) {
  const { profiles, createProfile, selectProfile, deleteProfile } = useProfile()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [nameError, setNameError] = useState('')

  const handleSelect = (id: string) => {
    selectProfile(id)
    onNavigate('subject-select')
  }

  const handleCreate = () => {
    const trimmed = name.trim()
    if (!trimmed) { setNameError('Zadaj meno'); return }
    if (trimmed.length > 20) { setNameError('Meno je príliš dlhé'); return }
    const profile = createProfile(trimmed, avatarIndex)
    selectProfile(profile.id)
    onNavigate('subject-select')
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Naozaj chceš odstrániť tento profil?')) {
      deleteProfile(id)
    }
  }

  return (
    <div className="profile-select">
      <header className="profile-select__header">
        <h1 className="profile-select__title">Slovlingva</h1>
        <p className="profile-select__subtitle">Kto hrá?</p>
      </header>

      <main className="profile-select__main">
        <div className="profile-select__grid">
          {profiles.map(p => (
            // Outer div — not interactive, holds layout + hover / focus-within styles
            <div key={p.id} className="profile-card">
              {/* Primary action: select profile */}
              <button
                className="profile-card__body"
                onClick={() => handleSelect(p.id)}
                aria-label={`Vybrať profil ${p.name}`}
              >
                <span className="profile-card__avatar">{AVATARS[p.avatarIndex % AVATARS.length]}</span>
                <span className="profile-card__name">{p.name}</span>
                <span className="profile-card__level">Level {p.level}</span>
                <span className="profile-card__xp">{p.totalXP} XP</span>
                {p.streak > 0 && (
                  <span className="profile-card__streak">🔥 {p.streak}</span>
                )}
              </button>
              {/* Secondary action: delete — separate button, never nested */}
              <button
                className="profile-card__delete"
                onClick={(e) => handleDelete(e, p.id)}
                aria-label={`Odstrániť profil ${p.name}`}
              >
                ×
              </button>
            </div>
          ))}

          {!showForm && (
            <button
              className="profile-card profile-card--new"
              onClick={() => setShowForm(true)}
              aria-label="Vytvoriť nový profil"
            >
              <span className="profile-card__plus">+</span>
              <span className="profile-card__name">Nový hráč</span>
            </button>
          )}
        </div>

        {showForm && (
          <div className="profile-form anim-fade-in">
            <h2 className="profile-form__title">Nový hráč</h2>

            <div className="profile-form__avatar-grid">
              {AVATARS.map((emoji, idx) => (
                <button
                  key={idx}
                  className={`profile-form__avatar-btn${avatarIndex === idx ? ' profile-form__avatar-btn--selected' : ''}`}
                  onClick={() => setAvatarIndex(idx)}
                  aria-label={`Vybrať avatar ${emoji}`}
                  aria-pressed={avatarIndex === idx}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="profile-form__field">
              <input
                className={`profile-form__input${nameError ? ' profile-form__input--error' : ''}`}
                type="text"
                placeholder="Tvoje meno"
                value={name}
                maxLength={20}
                autoFocus
                onChange={(e) => { setName(e.target.value); setNameError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                aria-label="Meno hráča"
              />
              {nameError && <p className="profile-form__error">{nameError}</p>}
            </div>

            <div className="profile-form__actions">
              <button className="btn btn--ghost" onClick={() => { setShowForm(false); setName(''); setNameError('') }}>
                Zrušiť
              </button>
              <button className="btn btn--primary" onClick={handleCreate}>
                Vytvoriť
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
