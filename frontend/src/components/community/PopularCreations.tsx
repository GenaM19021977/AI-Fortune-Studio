import { MaterialIcon } from '../ui/MaterialIcon'

import { COMMUNITY_CREATIONS, type CommunityCreation } from './communityData'

interface PopularCreationsProps {
  onViewAll: () => void
  onOpen: (item: CommunityCreation) => void
}

/**
 * Сетка популярных работ сообщества.
 */
export function PopularCreations({ onViewAll, onOpen }: PopularCreationsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">Популярные работы</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="font-label-caps flex items-center gap-1 text-aether-primary hover:underline"
        >
          Все
          <MaterialIcon name="chevron_right" className="text-[16px]" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {COMMUNITY_CREATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className="glass-card group overflow-hidden rounded-xl text-left transition-transform active:scale-[0.98]"
          >
            <div className="relative aspect-square overflow-hidden">
              <div
                className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-110"
                style={{ background: item.gradient }}
                aria-hidden
              >
                <MaterialIcon
                  name={item.icon}
                  filled
                  className="text-5xl text-aether-primary/80"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <MaterialIcon
                  name="favorite"
                  filled
                  className="text-[14px] text-aether-primary"
                />
                <span className="text-[12px] font-medium text-white">
                  {item.likesLabel}
                </span>
              </div>
            </div>
            <div className="p-3">
              <p className="truncate text-xs text-aether-on-variant">{item.author}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
