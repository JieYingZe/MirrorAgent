import type { EndingId, EndingVariantId } from '../../../types/story'

/**
 * 玩家可见结局清单。
 *
 * 这里保存的是「变体」而不是「家族」：玩家看到的标题来自变体。
 * 标题与 hidden 在结局定义里也各有一份，验证脚本会检查两侧一致，
 * 避免清单和正文悄悄漂移。
 */
export const endingManifest = {
  schemaVersion: 3,
  order: [
    'soft_illusion',
    'cruel_optimization',
    'silent_delegation',
    'symbiosis_stable_boundary',
    'symbiosis_rebuilt_boundary',
    'symbiosis_cautious',
    'symbiosis_fragile_boundary',
    'disconnection_active',
    'disconnection_hard_extraction',
    'disconnection_shallow',
    'mirror_trap',
  ] as const satisfies readonly EndingVariantId[],
  entries: {
    soft_illusion: {
      endingId: 'soft_illusion',
      title: '温柔幻觉',
      hidden: false,
    },
    cruel_optimization: {
      endingId: 'cruel_optimization',
      title: '残酷优化',
      hidden: false,
    },
    silent_delegation: {
      endingId: 'silent_delegation',
      title: '无声代行',
      hidden: false,
    },
    symbiosis_stable_boundary: {
      endingId: 'symbiosis',
      title: '稳定边界',
      hidden: false,
    },
    symbiosis_rebuilt_boundary: {
      endingId: 'symbiosis',
      title: '边界重建',
      hidden: false,
    },
    symbiosis_cautious: {
      endingId: 'symbiosis',
      title: '谨慎共生',
      hidden: false,
    },
    symbiosis_fragile_boundary: {
      endingId: 'symbiosis',
      title: '脆弱边界',
      hidden: false,
    },
    disconnection_active: {
      endingId: 'active_disconnection',
      title: '主动断联',
      hidden: false,
    },
    disconnection_hard_extraction: {
      endingId: 'active_disconnection',
      title: '艰难抽离',
      hidden: false,
    },
    disconnection_shallow: {
      endingId: 'active_disconnection',
      title: '浅尝辄止',
      hidden: false,
    },
    mirror_trap: {
      endingId: 'mirror_trap',
      title: '镜像困局',
      hidden: true,
    },
  } as const satisfies Record<
    EndingVariantId,
    { endingId: EndingId; title: string; hidden: boolean }
  >,
} as const
