import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallPokemonPage } from './detall-pokemon.page';

describe('DetallPokemonPage', () => {
  let component: DetallPokemonPage;
  let fixture: ComponentFixture<DetallPokemonPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallPokemonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
