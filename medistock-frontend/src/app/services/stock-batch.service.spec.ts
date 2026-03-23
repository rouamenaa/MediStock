import { TestBed } from '@angular/core/testing';

import { StockBatchService } from './stock-batch.service';

describe('StockBatchService', () => {
  let service: StockBatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockBatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
