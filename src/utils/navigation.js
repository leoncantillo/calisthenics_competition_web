export function rutaDeBloque(slug) {
  if (slug === "basicos") return "/basicos/panel";
  if (slug === "street") return "/street/panel";
  return "/chooseblock";
}
