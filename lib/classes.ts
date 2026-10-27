export interface ClassItem {
  id: string
  title: string
  youtubeUrl: string
  notes: string
  pdfUrl: string
  dateAdded: string
  imageUrl?: string
  pdfFileName?: string
  imageStoragePath?: string
  pdfStoragePath?: string
}

export const CLASS_STORAGE_KEY = 'ignou_coders_classes_v2'
export const CLASS_ASSETS_BUCKET = 'class-assets'

export interface ClassDatabaseRow {
  id: string
  title: string
  youtube_url: string
  notes: string
  pdf_url: string
  pdf_file_name: string | null
  pdf_storage_path: string | null
  image_url: string | null
  image_storage_path: string | null
  date_added: string
}

function isClassItem(value: unknown): value is ClassItem {
  if (!value || typeof value !== 'object') return false

  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.youtubeUrl === 'string' &&
    typeof item.notes === 'string' &&
    typeof item.pdfUrl === 'string' &&
    typeof item.dateAdded === 'string' &&
    (item.imageUrl === undefined || typeof item.imageUrl === 'string') &&
    (item.pdfFileName === undefined || typeof item.pdfFileName === 'string') &&
    (item.imageStoragePath === undefined ||
      typeof item.imageStoragePath === 'string') &&
    (item.pdfStoragePath === undefined ||
      typeof item.pdfStoragePath === 'string')
  )
}

export function readClasses(): ClassItem[] {
  const saved = window.localStorage.getItem(CLASS_STORAGE_KEY)
  if (saved === null) return []

  try {
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed) || !parsed.every(isClassItem)) {
      return []
    }
    return parsed
  } catch {
    return []
  }
}

export function classFromDatabase(row: ClassDatabaseRow): ClassItem {
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtube_url,
    notes: row.notes,
    pdfUrl: row.pdf_url,
    pdfFileName: row.pdf_file_name ?? undefined,
    pdfStoragePath: row.pdf_storage_path ?? undefined,
    imageUrl: row.image_url ?? undefined,
    imageStoragePath: row.image_storage_path ?? undefined,
    dateAdded: row.date_added,
  }
}

export function toYouTubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input.trim())
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    let videoId: string | null = null

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? null
    } else if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      const parts = url.pathname.split('/').filter(Boolean)
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v')
      } else if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) {
        videoId = parts[1] ?? null
      }
    }

    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null
  } catch {
    return null
  }
}

/**
 * Extracts class sequence number from titles like:
 * "Class 1: HTML Basics", "Day 2 - Tags", "03 Introduction", "Lecture 1", etc.
 */
export function extractClassSequenceNumber(title: string): number | null {
  if (!title) return null

  // 1. Explicit keyword followed by number: "Class 1", "Session #2", "Day 3", "Lec 4", etc.
  const keywordMatch = title.match(
    /\b(?:class|day|session|part|lecture|chapter|ep|episode|lec|module|unit)\s*(?:#|no\.?|num\.?)?\s*(\d+)/i,
  )
  if (keywordMatch && keywordMatch[1]) {
    return parseInt(keywordMatch[1], 10)
  }

  // 2. Leading number: "1. ", "01 - ", "1: ", "#1 "
  const leadingMatch = title.match(/^\s*(?:#)?\s*(\d+)\s*[-.:)]/i)
  if (leadingMatch && leadingMatch[1]) {
    return parseInt(leadingMatch[1], 10)
  }

  // 3. Standalone number anywhere in title: "HTML 1", "HTML - 2"
  const standaloneMatch = title.match(/\b(\d+)\b/)
  if (standaloneMatch && standaloneMatch[1]) {
    return parseInt(standaloneMatch[1], 10)
  }

  return null
}

/**
 * Sorts classes sequentially (1 -> 2 -> 3...) with natural fallback
 */
export function sortClassesSequentially(
  items: ClassItem[],
  direction: 'asc' | 'desc' = 'asc',
): ClassItem[] {
  return [...items].sort((a, b) => {
    const numA = extractClassSequenceNumber(a.title)
    const numB = extractClassSequenceNumber(b.title)

    if (numA !== null && numB !== null && numA !== numB) {
      return direction === 'asc' ? numA - numB : numB - numA
    }

    if (numA !== null && numB === null) return direction === 'asc' ? -1 : 1
    if (numA === null && numB !== null) return direction === 'asc' ? 1 : -1

    // Natural alphanumeric fallback ("Class 1" < "Class 2" < "Class 3")
    const cmp = a.title.localeCompare(b.title, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
    return direction === 'asc' ? cmp : -cmp
  })
}

/**
 * Automatically detects the course or technology (HTML, CSS, Python, JavaScript, etc.)
 * from class titles and notes without requiring hardcoding.
 */
export function detectClassCategory(title: string, notes?: string): string {
  if (!title) return 'General'
  const clean = title.trim()

  // 1. Check title prefix pattern: "<TECH> CLASS", "<TECH> - CLASS", "<TECH> : CLASS"
  // e.g. "HTML CLASS 01", "CSS CLASS 02", "PYTHON CLASS 05", "ADVANCED CSS CLASS"
  const prefixMatch = clean.match(
    /^([A-Za-z0-9+#.\-_]{2,20}(?:\s+[A-Za-z0-9+#.\-_]{2,20})?)\s+(?:CLASS|SESSION|LECTURE|DAY|MODULE|EPISODE|CHAPTER|PART)\b/i,
  )
  if (prefixMatch && prefixMatch[1]) {
    const raw = prefixMatch[1].trim()
    const upper = raw.toUpperCase()
    if (upper === 'HTML' || upper === 'HTML5') return 'HTML'
    if (upper === 'CSS' || upper === 'CSS3') return 'CSS'
    if (upper === 'JS' || upper === 'JAVASCRIPT') return 'JavaScript'
    if (upper === 'TS' || upper === 'TYPESCRIPT') return 'TypeScript'
    if (upper === 'PY' || upper === 'PYTHON') return 'Python'
    if (upper === 'REACT' || upper === 'REACTJS' || upper === 'REACT JS') return 'React'
    if (upper === 'C' || upper === 'C LANG' || upper === 'C PROGRAMMING') return 'C'
    if (upper === 'CPP' || upper === 'C++') return 'C++'
    if (upper === 'JAVA') return 'Java'
    if (upper === 'PHP') return 'PHP'
    if (upper === 'SQL' || upper === 'MYSQL' || upper === 'POSTGRES') return 'SQL'
    if (upper === 'NODE' || upper === 'NODEJS') return 'Node.js'
    return raw.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  }

  // 2. Check IGNOU Subject Code e.g. "BCS-011", "BCSL-013", "MCS-011"
  const subjectCodeMatch = clean.match(/\b([A-Z]{3,4}\s*[-_]?\s*\d{2,4})\b/i)
  if (subjectCodeMatch && subjectCodeMatch[1]) {
    return subjectCodeMatch[1].toUpperCase().replace(/\s+/g, '-')
  }

  // 3. Scan title for well known technologies
  const titleUpper = clean.toUpperCase()
  if (/\bHTML\b|\bHTML5\b/.test(titleUpper)) return 'HTML'
  if (/\bCSS\b|\bCSS3\b|\bTAILWIND\b|\bBOOTSTRAP\b/.test(titleUpper)) return 'CSS'
  if (/\bJAVASCRIPT\b|\bJS\b|\bECMASCRIPT\b/.test(titleUpper)) return 'JavaScript'
  if (/\bTYPESCRIPT\b|\bTS\b/.test(titleUpper)) return 'TypeScript'
  if (/\bPYTHON\b|\bDJANGO\b|\bFLASK\b/.test(titleUpper)) return 'Python'
  if (/\bREACT\b|\bNEXTJS\b|\bNEXT\.JS\b/.test(titleUpper)) return 'React'
  if (/\bJAVA\b|\bSPRING\b/.test(titleUpper) && !/\bJAVASCRIPT\b/.test(titleUpper)) return 'Java'
  if (/\bC\+\+\b|\bCPP\b/.test(titleUpper)) return 'C++'
  if (/\bC PROGRAMMING\b|\bC LANGUAGE\b/.test(titleUpper)) return 'C'
  if (/\bPHP\b/.test(titleUpper)) return 'PHP'
  if (/\bSQL\b|\bDATABASE\b|\bDBMS\b/.test(titleUpper)) return 'Database'

  // 4. Delimiter before pipe or colon: "HTML | ...", "CSS : ..."
  const delimiterMatch = clean.match(/^([A-Za-z0-9+#.\-_]{2,15})\s*[:|\-]/)
  if (delimiterMatch && delimiterMatch[1]) {
    const raw = delimiterMatch[1].trim()
    const upper = raw.toUpperCase()
    if (upper === 'HTML') return 'HTML'
    if (upper === 'CSS') return 'CSS'
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }

  // 5. Notes fallback
  if (notes) {
    const notesUpper = notes.toUpperCase()
    if (/\bHTML\b|\bHTML5\b/.test(notesUpper)) return 'HTML'
    if (/\bCSS\b|\bCSS3\b/.test(notesUpper)) return 'CSS'
    if (/\bPYTHON\b/.test(notesUpper)) return 'Python'
    if (/\bJAVASCRIPT\b|\bJS\b/.test(notesUpper)) return 'JavaScript'
  }

  return 'General'
}

export interface CategoryWithCount {
  name: string
  count: number
}

/**
 * Extracts and sorts dynamic categories present in the given classes.
 */
export function extractCategoriesFromClasses(classes: ClassItem[]): CategoryWithCount[] {
  const counts = new Map<string, number>()

  for (const cls of classes) {
    const cat = detectClassCategory(cls.title, cls.notes)
    counts.set(cat, (counts.get(cat) || 0) + 1)
  }

  const list: CategoryWithCount[] = []
  for (const [name, count] of counts.entries()) {
    list.push({ name, count })
  }

  // Prioritize HTML, CSS, then others alphabetically
  list.sort((a, b) => {
    if (a.name === 'HTML') return -1
    if (b.name === 'HTML') return 1
    if (a.name === 'CSS') return -1
    if (b.name === 'CSS') return 1
    if (a.name === 'JavaScript') return -1
    if (b.name === 'JavaScript') return 1
    if (a.name === 'Python') return -1
    if (b.name === 'Python') return 1
    if (a.name === 'General') return 1
    if (b.name === 'General') return -1
    return a.name.localeCompare(b.name)
  })

  return list
}

/**
 * Dynamic badge styling helper for technologies
 */
export function getCategoryBadgeStyle(category: string): {
  bg: string
  text: string
  border: string
  dot: string
} {
  const cat = category.toUpperCase()
  if (cat === 'HTML') {
    return {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
    }
  }
  if (cat === 'CSS') {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30',
      dot: 'bg-blue-500',
    }
  }
  if (cat === 'JAVASCRIPT' || cat === 'JS') {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    }
  }
  if (cat === 'PYTHON') {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
    }
  }
  if (cat === 'REACT') {
    return {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/30',
      dot: 'bg-cyan-500',
    }
  }
  if (cat === 'JAVA') {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500',
    }
  }
  return {
    bg: 'bg-[#087fce]/10 dark:bg-[#61c5ff]/20',
    text: 'text-[#087fce] dark:text-[#61c5ff]',
    border: 'border-[#087fce]/30',
    dot: 'bg-[#087fce]',
  }
}
