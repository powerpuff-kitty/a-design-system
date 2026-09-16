import { LitElement } from 'lit';

/**
 * Shared foundation for ADS controls that participate in native HTML forms.
 * Subclasses get one ElementInternals instance plus normalized validity/value
 * helpers without duplicating lifecycle plumbing.
 */
export abstract class FormAssociatedElement extends LitElement {
  static formAssociated = true;

  protected readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  get willValidate(): boolean {
    return this.internals.willValidate;
  }

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }

  protected setFormValue(value: string | File | FormData | null, state?: string | File | FormData | null): void {
    this.internals.setFormValue(value, state);
  }

  protected setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement,
  ): void {
    this.internals.setValidity(flags, message, anchor);
  }

  protected onFormDisabledChange(_disabled: boolean): void {}

  formDisabledCallback(disabled: boolean): void {
    this.onFormDisabledChange(disabled);
  }
}
