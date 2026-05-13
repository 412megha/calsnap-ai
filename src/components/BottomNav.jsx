import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const NAV = [
  { to: '/home',     icon: HomeIcon,    label: 'Home' },
  { to: '/scan',     icon: ScanIcon,    label: 'Scan' },
  { to: '/diary',    icon: DiaryIcon,   label: 'Diary' },
  { to: '/progress', icon: ChartIcon,   label: 'Progress' },
  { to: '/profile',  icon: ProfileIcon, label: 'Profile' },
]

const AC = '#d4607a'
const IN = '#806068'
const AF = '#fad4e0'

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          {({ isActive }) => (
            <>
              {isActive && <span className={styles.bar} />}
              <Icon active={isActive} />
              <span className={styles.label}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
        stroke={active ? AC : IN} strokeWidth="1.8" fill={active ? AF : 'none'} strokeLinejoin="round" />
    </svg>
  )
}

function ScanIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke={active ? AC : IN} strokeWidth="1.8" />
      <rect x="15" y="3" width="6" height="6" rx="1" stroke={active ? AC : IN} strokeWidth="1.8" />
      <rect x="3" y="15" width="6" height="6" rx="1" stroke={active ? AC : IN} strokeWidth="1.8" />
      <circle cx="18" cy="18" r="3" stroke={active ? AC : IN} strokeWidth="1.8" fill={active ? AF : 'none'} />
    </svg>
  )
}

function DiaryIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={active ? AC : IN} strokeWidth="1.8" fill={active ? AF : 'none'} />
      <path d="M8 8H16M8 12H16M8 16H13" stroke={active ? AC : IN} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 20V14M8 20V10M13 20V6M18 20V3" stroke={active ? AC : IN} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? AC : IN} strokeWidth="1.8" fill={active ? AF : 'none'} />
      <path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke={active ? AC : IN} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
