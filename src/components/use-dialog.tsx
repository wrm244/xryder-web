import React, { useState } from 'react'

interface FormWithReset {
  reset: () => void
}

export function useDialog(form?: FormWithReset) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  function trigger() {
    setIsOpen(true)
  }

  function dismiss() {
    setIsOpen(false)
    triggerRef.current?.focus()
    if (form) {
      form.reset()
    }
  }

  return {
    triggerProps: {
      ref: triggerRef,
      onClick: trigger,
    },
    dialogProps: {
      open: isOpen,
      onOpenChange: (open: boolean) => {
        if (open) trigger()
        else dismiss()
      },
    },
    trigger,
    dismiss,
  }
}
