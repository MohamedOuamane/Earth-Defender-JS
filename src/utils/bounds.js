export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
export function isOutOfBoundsX(x) {
  return x < 0 || x > 1;
}
export function keepInBoundsX(entity) {
  entity.x = clamp(entity.x, entity.width / 2, 1 - entity.width / 2);
}
export function hitLeftEdge(entity) {
  return entity.x - entity.width / 2 <= 0;
}
export function hitRightEdge(entity) {
  return entity.x + entity.width / 2 >= 1;
}
