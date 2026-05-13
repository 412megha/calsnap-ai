export default function FlowerIcon({ size = 20, color = '#d4607a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="7" rx="3" ry="5" fill={color} opacity="0.8" />
      <ellipse cx="12" cy="17" rx="3" ry="5" fill={color} opacity="0.8" />
      <ellipse cx="7" cy="12" rx="5" ry="3" fill={color} opacity="0.8" />
      <ellipse cx="17" cy="12" rx="5" ry="3" fill={color} opacity="0.8" />
      <ellipse cx="8.5" cy="8.5" rx="3" ry="4.5" fill={color} opacity="0.6" transform="rotate(-45 8.5 8.5)" />
      <ellipse cx="15.5" cy="8.5" rx="3" ry="4.5" fill={color} opacity="0.6" transform="rotate(45 15.5 8.5)" />
      <ellipse cx="8.5" cy="15.5" rx="3" ry="4.5" fill={color} opacity="0.6" transform="rotate(45 8.5 15.5)" />
      <ellipse cx="15.5" cy="15.5" rx="3" ry="4.5" fill={color} opacity="0.6" transform="rotate(-45 15.5 15.5)" />
      <circle cx="12" cy="12" r="3.5" fill={color} />
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.6" />
    </svg>
  )
}
