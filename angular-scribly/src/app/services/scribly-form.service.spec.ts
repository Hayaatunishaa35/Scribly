import { TestBed } from '@angular/core/testing';

import { ScriblyFormService } from './scribly-form.service';

describe('ScriblyFormService', () => {
  let service: ScriblyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScriblyFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
