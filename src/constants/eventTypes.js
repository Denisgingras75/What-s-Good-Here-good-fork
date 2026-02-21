export const EVENT_TYPES = [
  { value: 'live_music', label: 'Live Music' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'karaoke', label: 'Karaoke' },
  { value: 'open_mic', label: 'Open Mic' },
  { value: 'other', label: 'Other' },
]

export function getEventTypeLabel(value) {
  const found = EVENT_TYPES.find(t => t.value === value)
  return found ? found.label : value
}
