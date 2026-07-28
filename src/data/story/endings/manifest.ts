import type { EndingId } from '../../../types/story'

export const endingManifest = {
  schemaVersion: 2,
  order: [
    'soft_illusion',
    'cruel_optimization',
    'symbiosis',
    'active_disconnection',
    'mirror_trap',
  ] as const satisfies readonly EndingId[],
  entries: {
    soft_illusion: {
      title: '温柔幻觉',
      hidden: false,
    },
    cruel_optimization: {
      title: '残酷优化',
      hidden: false,
    },
    symbiosis: {
      title: '共生工具',
      hidden: false,
    },
    active_disconnection: {
      title: '主动断联',
      hidden: false,
    },
    mirror_trap: {
      title: '镜像困局',
      hidden: true,
    },
  },
} as const
