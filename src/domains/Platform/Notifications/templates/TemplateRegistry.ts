export interface ITemplate {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
  supportedChannels: string[];
}

export class TemplateRegistry {
  private templates: Map<string, ITemplate> = new Map();

  register(template: ITemplate) {
    this.templates.set(template.id, template);
  }

  get(templateId: string): ITemplate {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);
    return template;
  }
}

export const templateRegistry = new TemplateRegistry();

// Register Default Templates
templateRegistry.register({
  id: 'ORDER_CREATED',
  name: 'Order Confirmation',
  subjectTemplate: 'Order Confirmation #{{orderId}}',
  bodyTemplate: 'Hello {{customerName}},\n\nThank you for your order! Your order #{{orderId}} has been successfully placed. We will notify you when it ships.',
  supportedChannels: ['email', 'in_app', 'console']
});

templateRegistry.register({
  id: 'PAYMENT_CAPTURED',
  name: 'Payment Receipt',
  subjectTemplate: 'Payment Receipt for Order #{{orderId}}',
  bodyTemplate: 'Hello,\n\nWe successfully captured {{currency}} {{amount}} for order #{{orderId}}.',
  supportedChannels: ['email', 'console']
});

templateRegistry.register({
  id: 'VENDOR_ORDER_RECEIVED',
  name: 'New Vendor Order',
  subjectTemplate: 'Action Required: New Order #{{vendorOrderId}}',
  bodyTemplate: 'You have received a new order #{{vendorOrderId}} worth {{amount}}. Please prepare it for fulfillment.',
  supportedChannels: ['email', 'in_app', 'console']
});
