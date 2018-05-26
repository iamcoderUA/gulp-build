import formValid from './modules/validation';
// Form Validation
if (document.getElementsByClassName('form').length > 0) {
  const valid = formValid();
  valid.submitInit();
}
