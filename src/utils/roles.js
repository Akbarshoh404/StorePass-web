export function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "shop") return "/shop";
  return "/shops";
}
