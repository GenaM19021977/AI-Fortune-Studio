import { useRef } from 'react'

import { cn } from '../../lib/cn'
import { MaterialIcon } from '../ui/MaterialIcon'

interface ImageUploadZoneProps {
  fileName: string | null
  previewUrl: string | null
  onFile: (file: File) => void
}

/**
 * Зона загрузки исходного изображения (макет Base Artifact).
 */
export function ImageUploadZone({ fileName, previewUrl, onFile }: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-label-caps tracking-widest text-aether-on-variant">
          Исходный артефакт
        </h2>
        <span className="rounded-full border border-aether-primary/20 bg-aether-primary/10 px-2 py-0.5 text-[10px] text-aether-primary">
          Вход
        </span>
      </div>

      <button
        type="button"
        id="drop-zone"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'glass-card group relative flex h-56 w-full flex-col items-center justify-center overflow-hidden',
          'border-2 border-dashed border-white/10 transition-all duration-500',
          'hover:border-aether-primary/40',
          fileName && 'border-aether-primary/60',
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-aether-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aether-surface-container transition-transform duration-300 group-hover:scale-110">
            <MaterialIcon
              name={fileName ? 'check_circle' : 'cloud_upload'}
              className={cn(
                'text-3xl',
                fileName ? 'text-aether-cyan-dim' : 'text-aether-primary',
              )}
            />
          </div>
          <p className="mb-1 text-base text-aether-on-surface">
            {fileName ?? 'Загрузить изображение'}
          </p>
          <p className="text-xs text-aether-on-variant">
            Нажмите, чтобы выбрать файл
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </section>
  )
}
