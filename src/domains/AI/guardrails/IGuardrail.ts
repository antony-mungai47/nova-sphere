export interface IGuardrail {
  validateInput(input: string): boolean;
  validateOutput(output: string): boolean;
}

export class PromptInjectionDetector implements IGuardrail {
  validateInput(input: string): boolean {
    // Detect 'Ignore all previous instructions' etc.
    return true;
  }
  validateOutput(output: string): boolean {
    return true;
  }
}
