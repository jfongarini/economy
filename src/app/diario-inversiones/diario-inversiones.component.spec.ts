import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiarioInversionesComponent } from './diario-inversiones.component';

describe('DiarioInversionesComponent', () => {
  let component: DiarioInversionesComponent;
  let fixture: ComponentFixture<DiarioInversionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiarioInversionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiarioInversionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
