import { useEffect } from 'react'
import { site } from '../config/site'

function setTag(selector, attr, value, create) {
  let el = document.head.querySelector(selector)

  if (!el) {
    el = document.createElement(create.tag)
    Object.entries(create.attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }

  el.setAttribute(attr, value)
}

export function usePageMeta({ title, description, noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.tagline}`
    const desc = description ?? site.tagline

    document.title = fullTitle

    setTag('meta[name="description"]', 'content', desc, {
      tag: 'meta', attrs: { name: 'description' },
    })
    setTag('meta[property="og:title"]', 'content', fullTitle, {
      tag: 'meta', attrs: { property: 'og:title' },
    })
    setTag('meta[property="og:description"]', 'content', desc, {
      tag: 'meta', attrs: { property: 'og:description' },
    })
    setTag('meta[property="og:url"]', 'content', window.location.href, {
      tag: 'meta', attrs: { property: 'og:url' },
    })
    setTag('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow', {
      tag: 'meta', attrs: { name: 'robots' },
    })
  }, [title, description, noindex])
}