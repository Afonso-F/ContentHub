/**
 * navigation.test.js — Tests for sidebar nav group logic (js/app.js)
 * Functions inlined to test in isolation (same pattern as other test files).
 */
import { describe, it, expect } from 'vitest'

// ── Inlined from js/app.js ─────────────────────────────────────────────────

const _navGroups = {
  factory:    ['channels', 'avatar-studio', 'pipeline', 'podcast-gen', 'shorts-factory'],
  automation: ['factory-setup', 'fila', 'scheduler'],
  content:    ['avatares', 'youtube', 'podcasts', 'videos', 'musicos', 'publicados', 'biblioteca', 'campanhas'],
  analytics:  ['analytics', 'analises', 'monetizacao', 'despesas', 'pagamentos'],
}

// All sections registered in the sections map in app.js
const ALL_SECTIONS = [
  'dashboard', 'channels', 'avatar-studio', 'pipeline', 'podcast-gen', 'shorts-factory',
  'scheduler', 'factory-setup', 'analytics',
  'avatares', 'youtube', 'musicos', 'podcasts', 'criar', 'videos',
  'fila', 'publicados', 'biblioteca', 'campanhas', 'analises',
  'monetizacao', 'despesas', 'pagamentos', 'configuracoes',
]

// Extracts the pure lookup logic from _expandGroupForSection
function findGroupForSection(section) {
  for (const [groupId, sectionList] of Object.entries(_navGroups)) {
    if (sectionList.includes(section)) return groupId
  }
  return null
}

// ── TESTS ──────────────────────────────────────────────────────────────────

describe('_navGroups structure', () => {
  it('has exactly 4 groups', () => {
    expect(Object.keys(_navGroups)).toHaveLength(4)
  })

  it('each group value is a non-empty array of strings', () => {
    for (const [group, sections] of Object.entries(_navGroups)) {
      expect(Array.isArray(sections), `${group} should be array`).toBe(true)
      expect(sections.length, `${group} should be non-empty`).toBeGreaterThan(0)
      sections.forEach(s => expect(typeof s, `item in ${group}`).toBe('string'))
    }
  })

  it('no section appears in more than one group', () => {
    const all = Object.values(_navGroups).flat()
    const unique = new Set(all)
    expect(unique.size).toBe(all.length)
  })

  it('every section in _navGroups exists in the app sections map', () => {
    const all = Object.values(_navGroups).flat()
    for (const s of all) {
      expect(ALL_SECTIONS, `"${s}" missing from sections map`).toContain(s)
    }
  })

  it('factory group has 5 items', () => {
    expect(_navGroups.factory).toHaveLength(5)
  })

  it('automation group has 3 items', () => {
    expect(_navGroups.automation).toHaveLength(3)
  })

  it('content group has 8 items', () => {
    expect(_navGroups.content).toHaveLength(8)
  })

  it('analytics group has 5 items', () => {
    expect(_navGroups.analytics).toHaveLength(5)
  })

  it('total grouped sections is 21', () => {
    const total = Object.values(_navGroups).reduce((sum, arr) => sum + arr.length, 0)
    expect(total).toBe(21)
  })
})

describe('findGroupForSection() — factory group', () => {
  it('channels → factory', () => expect(findGroupForSection('channels')).toBe('factory'))
  it('avatar-studio → factory', () => expect(findGroupForSection('avatar-studio')).toBe('factory'))
  it('pipeline → factory', () => expect(findGroupForSection('pipeline')).toBe('factory'))
  it('podcast-gen → factory', () => expect(findGroupForSection('podcast-gen')).toBe('factory'))
  it('shorts-factory → factory', () => expect(findGroupForSection('shorts-factory')).toBe('factory'))
})

describe('findGroupForSection() — automation group', () => {
  it('factory-setup → automation', () => expect(findGroupForSection('factory-setup')).toBe('automation'))
  it('fila → automation', () => expect(findGroupForSection('fila')).toBe('automation'))
  it('scheduler → automation', () => expect(findGroupForSection('scheduler')).toBe('automation'))
})

describe('findGroupForSection() — content group', () => {
  it('avatares → content', () => expect(findGroupForSection('avatares')).toBe('content'))
  it('youtube → content', () => expect(findGroupForSection('youtube')).toBe('content'))
  it('podcasts → content', () => expect(findGroupForSection('podcasts')).toBe('content'))
  it('videos → content', () => expect(findGroupForSection('videos')).toBe('content'))
  it('musicos → content', () => expect(findGroupForSection('musicos')).toBe('content'))
  it('publicados → content', () => expect(findGroupForSection('publicados')).toBe('content'))
  it('biblioteca → content', () => expect(findGroupForSection('biblioteca')).toBe('content'))
  it('campanhas → content', () => expect(findGroupForSection('campanhas')).toBe('content'))
})

describe('findGroupForSection() — analytics group', () => {
  it('analytics → analytics', () => expect(findGroupForSection('analytics')).toBe('analytics'))
  it('analises → analytics', () => expect(findGroupForSection('analises')).toBe('analytics'))
  it('monetizacao → analytics', () => expect(findGroupForSection('monetizacao')).toBe('analytics'))
  it('despesas → analytics', () => expect(findGroupForSection('despesas')).toBe('analytics'))
  it('pagamentos → analytics', () => expect(findGroupForSection('pagamentos')).toBe('analytics'))
})

describe('findGroupForSection() — standalone sections (no group)', () => {
  it('dashboard → null', () => expect(findGroupForSection('dashboard')).toBeNull())
  it('configuracoes → null', () => expect(findGroupForSection('configuracoes')).toBeNull())
  it('criar → null (topbar-only section)', () => expect(findGroupForSection('criar')).toBeNull())
  it('unknown section → null', () => expect(findGroupForSection('unknown-xyz')).toBeNull())
  it('empty string → null', () => expect(findGroupForSection('')).toBeNull())
})
