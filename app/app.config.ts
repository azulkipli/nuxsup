export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'zinc',
    },
    avatar: {
      slots: {
        root: 'inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated',
        image: 'h-full w-full rounded-[inherit] object-cover',
        fallback: 'font-medium leading-none text-muted truncate',
        icon: 'text-muted shrink-0',
      },
      variants: {
        size: {
          '3xs': {
            root: 'size-4 text-[8px]',
          },
          '2xs': {
            root: 'size-5 text-[10px]',
          },
          xs: {
            root: 'size-6 text-xs',
          },
          sm: {
            root: 'size-7 text-sm',
          },
          md: {
            root: 'size-8 text-base',
          },
          lg: {
            root: 'size-9 text-lg',
          },
          xl: {
            root: 'size-10 text-xl',
          },
          '2xl': {
            root: 'size-11 text-[22px]',
          },
          '3xl': {
            root: 'size-12 text-2xl',
          },
          '4xl': {
            root: 'size-14 text-3xl',
          },
          '5xl': {
            root: 'size-16 text-4xl',
          },
          '6xl': {
            root: 'size-18 text-5xl',
          },
          '7xl': {
            root: 'size-20 text-6xl',
          },
          '8xl': {
            root: 'size-22 text-7xl',
          },
          '9xl': {
            root: 'size-24 text-8xl',
          },
          '10xl': {
            root: 'size-26 text-9xl',
          },
          '11xl': {
            root: 'size-28 text-10xl',
          },
          '12xl': {
            root: 'size-30 text-11xl',
          },
        },
      },
      defaultVariants: {
        size: 'md',
      },
    },
  },
})
