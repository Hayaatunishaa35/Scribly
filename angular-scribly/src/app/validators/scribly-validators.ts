import { FormControl, ValidationErrors } from '@angular/forms';

export class ScriblyValidators {
  // whitespace validation
  static notOnlyWhitespace(control: FormControl): ValidationErrors|null {
    if((control.value !=null) && (control.value.trim().length ===0)){
        // invalid, return error object
        return {'notOnlyWhitespace':true};
    }
    return null;
  }
}
