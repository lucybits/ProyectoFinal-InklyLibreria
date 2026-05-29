export const isAdminUser = (user) => {
  return Boolean(
    user?.isAdmin ||
    user?.email?.toLowerCase() === 'admin@gmail.com'
  )
}
