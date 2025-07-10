import React from 'react'

import { fileImg } from '@/utils'

interface UserFileDisplayProps {
  docs?: string[]
  images?: string[]
}

/**
 * 用户上传文件和图片的展示组件
 */
const UserFileDisplay: React.FC<UserFileDisplayProps> = ({ docs, images }) => {
  return (
    <>
      {/* 文件展示 */}
      {docs && docs.length > 0 && (
        <div className="mb-3 space-y-2">
          {docs
            .filter(
              (f) => !['png', 'jpeg', 'jpg'].includes(f.split('.').pop() || '')
            )
            .map((f: string, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 p-3 bg-white/25 backdrop-blur-md rounded-lg border border-white/40 transition-all duration-300 hover:bg-white/30 hover:border-white/50"
              >
                <div className="w-8 h-8 rounded-md bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <img
                    src={fileImg}
                    alt="file"
                    className="w-4 h-4 opacity-90"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-white/95 block truncate">
                    {f}
                  </span>
                  <span className="text-xs text-white/75">
                    {f.split('.').pop()?.toUpperCase()} 文件
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 图片展示 */}
      {images && images.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-3">
          {images.map((image, imgIndex) => (
            <div
              key={imgIndex}
              className="relative group/img overflow-hidden rounded-lg"
            >
              <img
                src={image}
                alt="Uploaded Preview"
                className="max-w-64 w-full rounded-lg border-2 border-white/40 shadow-lg group-hover/img:scale-105 transition-all duration-500 cursor-pointer backdrop-blur-sm object-cover"
                onClick={() => window.open(image, '_blank')}
              />
              {/* 悬停遮罩层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 rounded-lg transition-all duration-500 pointer-events-none" />
              {/* 放大图标 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/img:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
              {/* 查看提示 */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-all duration-300 backdrop-blur-sm font-medium">
                点击放大
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default UserFileDisplay
