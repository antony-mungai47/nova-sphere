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
