import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1373817718192734268'
})

const siteStartTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://i.imgur.com/UMlwRbP.png'
}

function formatAnimeSlug(slug: string | null): string | null {
  if (!slug) return null
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
function getAnimeTitleFromDOM(): string | null {
  const titleSpan = document.querySelector<HTMLElement>('span[style*="view-transition-name: title-"]')
  if (titleSpan && titleSpan.textContent?.trim()) {
    return titleSpan.textContent.trim()
  }
  const titleElem = document.querySelector('.anime-title, .show-title, h1')
  if (titleElem && titleElem.textContent?.trim()) {
    return titleElem.textContent.trim()
  }
  return null
}
function getChapterOrSubtitleFromDOM(): { chapter: string | null; subtitleLang: string | null } {
  const chapterElem = document.querySelector('.vds-chapter-title')
  const chapter = chapterElem?.textContent?.trim() || null
  const trackElem = document.querySelector<HTMLTrackElement>('track[default], track[kind="captions"][src]')
  const subtitleLang = trackElem?.label || trackElem?.srclang?.toUpperCase() || null
  return { chapter, subtitleLang }
}
function getEpisodeTitleFromDOM(): string | null {
  const epTitleSpan = document.querySelector('.ep-title')
  if (epTitleSpan && epTitleSpan.textContent?.trim()) {
    return epTitleSpan.textContent.trim()
  }
  const epImg = document.querySelector('img[alt*="titled"]')
  if (!epImg) return null
  const altText = epImg.getAttribute('alt') || ''
  const match = altText.match(/titled\s+['"](.+?)['"]/i)
  return match && match[1] ? match[1].trim() : null
}
function getCoverImageFromDOM(): string | null {
  const coverImg = document.querySelector<HTMLImageElement>('img._infoImage_aojp4_125') ||
    document.querySelector<HTMLImageElement>('img[class*="_infoImage_"]') ||
    document.querySelector<HTMLImageElement>('img._coverImg_2wrhc_89') ||
    document.querySelector<HTMLImageElement>('img[class*="_coverImg_"]')
  const src = coverImg?.src || coverImg?.getAttribute('src')
  return src && src.startsWith('http') ? src : null
}
presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const searchParams = new URLSearchParams(search)
  const [useMultiLanguage, showAnimeAsTitle, showButtons, showTimestamps, showEpTitle] = await Promise.all([
    presence.getSetting<boolean>('multiLanguage'),
    presence.getSetting<boolean>('showAnimeAsTitle'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('showEpTitle')
  ])
  const rawStrings = await presence.getStrings({
    browsing: 'general.browsing',
    searching: 'general.searching',
    viewHome: 'general.viewHome',
    viewing: 'general.viewing'
  })
  const getString = (key: keyof typeof rawStrings, fallback: string) => {
    if (!useMultiLanguage) return fallback
    const val = rawStrings[key]
    return val && !val.startsWith('general.') ? val : fallback
  }
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: siteStartTimestamp
  }
  switch (true) {
    case pathname === '/' || pathname === '': {
      presenceData.details = 'Miruro'
      presenceData.state = getString('viewHome', 'On Homepage')
      break
    }
    case pathname.includes('/history'): {
      presenceData.details = 'Miruro'
      presenceData.state = 'Viewing Watch History'
      break
    }
    case pathname.includes('/schedule'): {
      presenceData.details = 'Miruro'
      presenceData.state = 'Checking Release Schedule'
      break
    }
    case pathname.includes('/trending'): {
      presenceData.details = 'Miruro'
      presenceData.state = 'Browsing Trending Anime'
      break
    }
    case pathname.includes('/profile'): {
      presenceData.details = 'Miruro'
      presenceData.state = 'Viewing Profile'
      break
    }
    case pathname.includes('/search') || searchParams.has('query') || searchParams.has('q'): {
      const query = searchParams.get('query') ?? searchParams.get('q') ?? searchParams.get('search') ?? ''
      const searchingStr = getString('searching', 'Searching')
      presenceData.details = 'Miruro'
      presenceData.state = query ? `${searchingStr} "${query}"` : `${searchingStr}...`
      break
    }
    case /\/info(?:\/\d+\/([^\?\/#]+))?/i.test(pathname): {
      const infoMatch = pathname.match(/\/info\/\d+\/([^\?\/#]+)/i)
      const animeTitle = getAnimeTitleFromDOM() || (infoMatch && infoMatch[1] ? formatAnimeSlug(infoMatch[1]) : null)
      const coverUrl = getCoverImageFromDOM()
      presenceData.details = animeTitle ? `${getString('viewing', 'Viewing')} ${animeTitle}` : 'Browsing Anime Info'
      presenceData.state = animeTitle ? 'Reading Details & Overview' : 'Exploring Info Catalog'
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Info',
            url: href
          }
        ]
      }
      break
    }
    case /\/watch\/\d+\/([^\?\/#]+)/i.test(pathname) && searchParams.has('ep'): {
      const watchMatch = pathname.match(/\/watch\/\d+\/([^\?\/#]+)/i)
      const epNum = searchParams.get('ep') ?? ''
      const showTitle = getAnimeTitleFromDOM() || (watchMatch && watchMatch[1] ? formatAnimeSlug(watchMatch[1]) : null) || 'Anime'
      const epTitle = getEpisodeTitleFromDOM()
      const { chapter, subtitleLang } = getChapterOrSubtitleFromDOM()
      const coverUrl = getCoverImageFromDOM()
      let epLine = `Episode ${epNum}`
      if (showEpTitle && (chapter || epTitle)) {
        epLine += ` - ${chapter || epTitle}`
      }
      if (subtitleLang) {
        epLine += ` [${subtitleLang}]`
      }
      if (showAnimeAsTitle && showTitle) {
        presenceData.name = showTitle
        presenceData.details = epLine
        delete presenceData.state
      } else {
        delete presenceData.name
        presenceData.details = showTitle
        presenceData.state = epLine
      }
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Watch Episode',
            url: href
          }
        ]
      }
      break
    }
    default: {
      const catalogMatch = pathname.match(/\/(?:anime|details|info)\/([^\?\/#]+)/i) || pathname.match(/\/watch\/\d+\/([^\?\/#]+)/i)
      const animeTitle = getAnimeTitleFromDOM() || (catalogMatch && catalogMatch[1] ? formatAnimeSlug(catalogMatch[1]) : null)
      const coverUrl = getCoverImageFromDOM()
      presenceData.details = getString('browsing', 'Browsing...')
      presenceData.state = animeTitle ? `${getString('viewing', 'Viewing')} ${animeTitle}` : 'Exploring Catalog'
      presenceData.largeImageKey = coverUrl || ActivityAssets.Logo
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href
          }
        ]
      }
      break
    }
  }
  if (!showTimestamps) {
    delete presenceData.startTimestamp
  }
  presence.setActivity(presenceData)
})