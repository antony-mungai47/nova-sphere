import { toast } from '@/shared/components/ui/toast';

export type FeedbackLevel = 'tiny' | 'inline' | 'toast' | 'modal' | 'blocking';

export interface FeedbackOptions {
  level?: FeedbackLevel;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

export const feedback = {
  trigger: (options: FeedbackOptions) => {
    const level = options.level || 'toast';
    
    switch (level) {
      case 'tiny':
      case 'inline':
        // For tiny/inline, components should manage their own state (e.g. AnimatedButton success state)
        // But if fallback to global is needed for simple use cases, we use a tiny toast
        toast[options.variant || 'success'](options.title || 'Success');
        break;
      case 'toast':
        toast[options.variant || 'default'](options.title || 'Notification', options.description);
        break;
      case 'modal':
      case 'blocking':
        // Future: integrate a global modal store. For now, fallback to persistent toast or window.alert
        toast[options.variant || 'default'](options.title || 'Attention', options.description);
        break;
    }
  },
  
  cartAdded: (productName: string) => {
    feedback.trigger({
      level: 'toast',
      title: 'Added to cart',
      description: `${productName} was added to your cart.`,
      variant: 'success'
    });
  },

  actionSuccess: (actionName: string) => {
    feedback.trigger({
      level: 'inline', // Buttons handle this visually, but this is a semantic wrapper
      title: `${actionName} successful`,
      variant: 'success'
    });
  },
  
  error: (message: string) => {
    feedback.trigger({
      level: 'toast',
      title: 'Error',
      description: message,
      variant: 'error'
    });
  }
};
