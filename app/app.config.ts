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
          '13xl': {
            root: 'size-32 text-12xl',
          },
          '14xl': {
            root: 'size-34 text-13xl',
          },
          '15xl': {
            root: 'size-36 text-14xl',
          },
          '16xl': {
            root: 'size-38 text-15xl',
          },
          '17xl': {
            root: 'size-40 text-16xl',
          },
          '18xl': {
            root: 'size-42 text-17xl',
          },
          '19xl': {
            root: 'size-44 text-18xl',
          },
          '20xl': {
            root: 'size-46 text-19xl',
          },
          '21xl': {
            root: 'size-48 text-20xl',
          },
          '22xl': {
            root: 'size-50 text-21xl',
          },
          '23xl': {
            root: 'size-52 text-22xl',
          },
          '24xl': {
            root: 'size-54 text-23xl',
          },
          '25xl': {
            root: 'size-56 text-24xl',
          },
          '26xl': {
            root: 'size-58 text-25xl',
          },
          '27xl': {
            root: 'size-60 text-26xl',
          },
          '28xl': {
            root: 'size-62 text-27xl',
          },
          '29xl': {
            root: 'size-64 text-28xl',
          },
          '30xl': {
            root: 'size-66 text-29xl',
          },
          '31xl': {
            root: 'size-68 text-30xl',
          },
          '32xl': {
            root: 'size-70 text-31xl',
          },
          '33xl': {
            root: 'size-72 text-32xl',
          },
          '34xl': {
            root: 'size-74 text-33xl',
          },
          '35xl': {
            root: 'size-76 text-34xl',
          },
          '36xl': {
            root: 'size-78 text-35xl',
          },
          '37xl': {
            root: 'size-80 text-36xl',
          },
          '38xl': {
            root: 'size-82 text-37xl',
          },
          '39xl': {
            root: 'size-84 text-38xl',
          },
          '40xl': {
            root: 'size-86 text-39xl',
          },
          '41xl': {
            root: 'size-88 text-40xl',
          },
          '42xl': {
            root: 'size-90 text-41xl',
          },
          '43xl': {
            root: 'size-92 text-42xl',
          },
          '44xl': {
            root: 'size-94 text-43xl',
          },
          '45xl': {
            root: 'size-96 text-44xl',
          },
          '46xl': {
            root: 'size-98 text-45xl',
          },
          '47xl': {
            root: 'size-100 text-46xl',
          },
          '48xl': {
            root: 'size-102 text-47xl',
          },
          '49xl': {
            root: 'size-104 text-48xl',
          },
          '50xl': {
            root: 'size-106 text-49xl',
          },
          '51xl': {
            root: 'size-108 text-50xl',
          },
          '52xl': {
            root: 'size-110 text-51xl',
          },
          '53xl': {
            root: 'size-112 text-52xl',
          },
          '54xl': {
            root: 'size-114 text-53xl',
          },
          '55xl': {
            root: 'size-116 text-54xl',
          },
          '56xl': {
            root: 'size-118 text-55xl',
          },
          '57xl': {
            root: 'size-120 text-56xl',
          },
          '58xl': {
            root: 'size-122 text-57xl',
          },
          '59xl': {
            root: 'size-124 text-58xl',
          },
          '60xl': {
            root: 'size-126 text-59xl',
          },
          '61xl': {
            root: 'size-128 text-60xl',
          },
          '62xl': {
            root: 'size-130 text-61xl',
          },
          '63xl': {
            root: 'size-132 text-62xl',
          },
          '64xl': {
            root: 'size-134 text-63xl',
          },
          '65xl': {
            root: 'size-136 text-64xl',
          },
          '66xl': {
            root: 'size-138 text-65xl',
          },
          '67xl': {
            root: 'size-140 text-66xl',
          },
          '68xl': {
            root: 'size-142 text-67xl',
          },
          '69xl': {
            root: 'size-144 text-68xl',
          },
          '70xl': {
            root: 'size-146 text-69xl',
          },
          '71xl': {
            root: 'size-148 text-70xl',
          },
          '72xl': {
            root: 'size-150 text-71xl',
          },
          '73xl': {
            root: 'size-152 text-72xl',
          },
          '74xl': {
            root: 'size-154 text-73xl',
          },
          '75xl': {
            root: 'size-156 text-74xl',
          },
          '76xl': {
            root: 'size-158 text-75xl',
          },
          '77xl': {
            root: 'size-160 text-76xl',
          },
          '78xl': {
            root: 'size-162 text-77xl',
          },
          '79xl': {
            root: 'size-164 text-78xl',
          },
          '80xl': {
            root: 'size-166 text-79xl',
          },
        },
      },
    },
  },
})
