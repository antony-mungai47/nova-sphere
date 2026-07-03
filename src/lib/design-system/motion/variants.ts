import { Variants } from 'framer-motion';
import { motionTokens } from './tokens';

export const motionVariants = {
  fadeIn: {
    hidden: { opacity: motionTokens.opacity.hidden },
    visible: { 
      opacity: motionTokens.opacity.visible,
      transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.standard }
    },
    exit: { 
      opacity: motionTokens.opacity.hidden,
      transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.exit }
    }
  } as Variants,

  slideUp: {
    hidden: { opacity: motionTokens.opacity.hidden, y: motionTokens.distance.medium },
    visible: { 
      opacity: motionTokens.opacity.visible, 
      y: 0,
      transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.enter }
    },
    exit: { 
      opacity: motionTokens.opacity.hidden, 
      y: motionTokens.distance.medium,
      transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.exit }
    }
  } as Variants,

  slideDrawer: {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.enter }
    },
    exit: { 
      x: '100%',
      transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.exit }
    }
  } as Variants,

  scaleCard: {
    idle: { scale: 1 },
    hover: { 
      scale: motionTokens.scale.hover,
      transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.standard }
    },
    pressed: { 
      scale: motionTokens.scale.pressed,
      transition: { duration: motionTokens.duration.instant, ease: motionTokens.easing.standard }
    }
  } as Variants,

  routeTransition: {
    hidden: { opacity: motionTokens.opacity.hidden, y: motionTokens.distance.small },
    visible: { 
      opacity: motionTokens.opacity.visible, 
      y: 0,
      transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.standard }
    },
    exit: { 
      opacity: motionTokens.opacity.hidden, 
      y: -motionTokens.distance.small,
      transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.exit }
    }
  } as Variants,
};
