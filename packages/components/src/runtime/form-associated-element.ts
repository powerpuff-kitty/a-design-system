import { LitElement } from 'lit';

/**
 * Shared foundation for ADS controls that participate in native HTML forms.
 * Subclasses get one ElementInternals instance plus normalized validity/value
 * helpers without duplicating lifecycle plumbing.
 */
export abstract class FormAssociatedElement extends LitElement {
  static formAssociated = true;

  protected readonly internals: ElementInternals;
  #formDisabled = false;

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

  /** True when the form-associated custom element is disabled by form context. */
  protected get formDisabled(): boolean {
    return this.#formDisabled;
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
    if (disabled === this.#formDisabled) return;
    this.#formDisabled = disabled;
    this.requestUpdate();
    this.onFormDisabledChange(disabled);
  }
}
