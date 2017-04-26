import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MashTweetsComponent } from './mash-tweets.component';

describe('MashTweetsComponent', () => {
  let component: MashTweetsComponent;
  let fixture: ComponentFixture<MashTweetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MashTweetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MashTweetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
