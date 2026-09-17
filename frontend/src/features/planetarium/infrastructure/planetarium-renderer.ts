import type {
  PlanetariumScene,
  PlanetariumViewState,
} from "@/features/planetarium/domain/planetarium";

export interface PlanetariumRenderer {
  initialize(canvas: HTMLCanvasElement): void;
  resize(width: number, height: number, pixelRatio: number): void;
  updateScene(scene: PlanetariumScene): void;
  updateView(view: PlanetariumViewState): void;
  render(): void;
  hitTest(x: number, y: number): string | null;
  dispose(): void;
}
